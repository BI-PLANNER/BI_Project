const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const N8N_API_KEY = env.N8N_API_KEY;
const N8N_HOST = 'n8n.cyberedu.my';

async function getExecDetail(id) {
  return new Promise((resolve) => {
    https.request({
      hostname: N8N_HOST,
      port: 443,
      path: `/api/v1/executions/${id}?includeData=true`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).end();
  });
}

async function syncDirect() {
  console.log('📥 Obteniendo los 1,586 renglones reales del Excel desde n8n...');
  const detail = await getExecDetail(1002);
  const runData = detail.data?.resultData?.runData || {};
  const excelNode = runData['Microsoft Excel 365: REPORTE DE LICITACIONES'] || runData['Mapear Licitaciones Excel 365 (3FN)'];
  const rawItems = excelNode?.[0]?.data?.main?.[0] || [];

  console.log(`Raw Excel items en ejecución: ${rawItems.length}`);
  if (rawItems.length === 0) return;

  const itemsToSync = rawItems.map(item => {
    const r = item.json?.licitaciones ? item.json : (item.json || {});
    // Si viene dentro de un arreglo agrupado
    if (r.licitaciones && Array.isArray(r.licitaciones)) return r.licitaciones;

    return {
      no_oferta: String(r['No. Oferta'] || r['No Oferta'] || r['Oferta'] || '').trim(),
      nombre_oferta: String(r['Nombre Oferta'] || r['Nombre de Oferta'] || '').trim(),
      cliente: String(r['Cliente'] || r['CLIENTE'] || '').trim(),
      institucion: String(r['INST.'] || 'MINSAL').trim(),
      empresa: String(r['EMPR'] || 'LABYMED').trim(),
      tipo_proceso: String(r['TIPO DE PROCESO '] || r['TIPO DE PROCESO'] || 'LICITACION COMPETITIVA').trim(),
      anio: String(r['AÑO'] || '2025').trim(),
      mes: String(r['Mes'] || 'ENERO').trim().toUpperCase(),
      presentacion: r['Presentación de oferta (Fecha)'] || r['Presentación'] || '',
      producto: String(r['Producto'] || '').trim(),
      marca: String(r['Marca'] || '').trim(),
      precio_unitario: r['Precio (unitario)'] !== undefined ? r['Precio (unitario)'] : 0,
      cantidad: r['Cantidad (unitaria)'] !== undefined ? r['Cantidad (unitaria)'] : 1,
      total_ofertado: r['Total Ofertado'] !== undefined ? r['Total Ofertado'] : 0,
      estatus_item: String(r['Estatus'] || r['ESTADO'] || '').trim(),
      precio_adjudicado: r['Precio adjudicado '] !== undefined ? r['Precio adjudicado '] : (r['Precio adjudicado'] || 0),
      empresa_adjudicada: String(r['Empresa adjudicada'] || r['Empresa adjudicada '] || '').trim(),
      razon: String(r['Razon'] || r['Razon '] || '').trim(),
      no_contrato: String(r['No. De Contrato'] || r['No. Contrato'] || '').trim(),
      costo_prueba_lm: r['Costo de prueba L&M'] !== undefined ? r['Costo de prueba L&M'] : 0,
      observaciones: String(r['Observaciones'] || '').trim()
    };
  }).flat().filter(i => i.no_oferta || i.nombre_oferta || i.producto);

  console.log(`Total renglones válidos procesados: ${itemsToSync.length}`);

  // 1. Obtener Catálogos Maestros
  const [clientesRes, empresasRes, estatusRes, personasRes, prodsRes, marcasRes] = await Promise.all([
    supabase.from('clientes').select('cliente_id, nombre_cliente'),
    supabase.from('empresas').select('empresa_id, nombre_empresa'),
    supabase.from('estatus').select('estatus_id, nombre_estatus'),
    supabase.from('personas').select('persona_id, nombre_completo'),
    supabase.from('productos_equipo').select('producto_equipo_id, nombre_producto_equipo'),
    supabase.from('marcas').select('marca_id, nombre_marca')
  ]);

  const clientesMap = new Map();
  clientesRes.data?.forEach(c => clientesMap.set(c.nombre_cliente.toLowerCase().trim(), c.cliente_id));

  const marcasMap = new Map();
  marcasRes.data?.forEach(m => marcasMap.set(m.nombre_marca.toLowerCase().trim(), m.marca_id));

  function getMarcaId(brandStr) {
    if (!brandStr) return 1;
    const b = brandStr.toLowerCase().trim();
    if (marcasMap.has(b)) return marcasMap.get(b);
    for (const [name, id] of marcasMap.entries()) {
      if (b.includes(name) || name.includes(b)) return id;
    }
    return 1;
  }

  const defaultEmpresaId = empresasRes.data?.[0]?.empresa_id || 1;
  const defaultEstatusId = estatusRes.data?.find(e => e.nombre_estatus.toLowerCase().includes('pendiente') || e.nombre_estatus.toLowerCase().includes('en progreso'))?.estatus_id || 5;
  const defaultPersonaId = personasRes.data?.[0]?.persona_id || 1;

  const prodsMap = new Map();
  prodsRes.data?.forEach(p => {
    if (p.nombre_producto_equipo) prodsMap.set(p.nombre_producto_equipo.toLowerCase().trim(), p.producto_equipo_id);
  });

  // 2. Pre-identificar clientes nuevos necesarios
  const neededClients = new Set();
  for (const lic of itemsToSync) {
    const rawCli = (lic.cliente || lic.institucion || 'MINSAL').toString().trim();
    if (rawCli && !clientesMap.has(rawCli.toLowerCase())) {
      let found = false;
      for (const [name] of clientesMap.entries()) {
        if (rawCli.toLowerCase().includes(name) || name.includes(rawCli.toLowerCase())) {
          found = true;
          break;
        }
      }
      if (!found) neededClients.add(rawCli);
    }
  }

  if (neededClients.size > 0) {
    const newClientRows = Array.from(neededClients).map(name => ({
      nombre_cliente: name,
      tipo_institucion_id: 1,
      activo: true
    }));
    const { data: createdClients } = await supabase.from('clientes').insert(newClientRows).select('cliente_id, nombre_cliente');
    createdClients?.forEach(c => clientesMap.set(c.nombre_cliente.toLowerCase().trim(), c.cliente_id));
  }

  // 3. Obtener licitaciones ya existentes
  const { data: existingLics } = await supabase.from('licitaciones_ofertas').select('licitacion_oferta_id, numero_oferta');
  const existingMap = new Map();
  existingLics?.forEach(l => {
    if (l.numero_oferta) existingMap.set(l.numero_oferta.toLowerCase().trim(), l.licitacion_oferta_id);
  });

  const monthMap = {
    'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04', 'MAYO': '05', 'JUNIO': '06',
    'JULIO': '07', 'AGOSTO': '08', 'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
  };

  const toInsert = [];
  const toUpdate = [];
  const seenInBatch = new Set();

  function toISODate(val) {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (!isNaN(num) && num > 30000 && num < 70000) {
      const excelEpoch = new Date(1899, 11, 30);
      const d = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    const str = String(val).trim();
    const slashParts = str.split('/');
    if (slashParts.length === 3) {
      const p0 = slashParts[0].padStart(2, '0');
      const p1 = slashParts[1].padStart(2, '0');
      let p2 = slashParts[2].trim();
      if (p2.length === 2) p2 = '20' + p2;
      if (p0.length === 4) return `${p0}-${p1}-${p2.padStart(2, '0')}`;
      return `${p2}-${p1}-${p0}`;
    }
    const hyphenParts = str.split('-');
    if (hyphenParts.length === 3) {
      if (hyphenParts[0].length === 4) return str;
      let p2 = hyphenParts[2].trim();
      if (p2.length === 2) p2 = '20' + p2;
      return `${p2}-${hyphenParts[1].padStart(2, '0')}-${hyphenParts[0].padStart(2, '0')}`;
    }
    return null;
  }

  for (const lic of itemsToSync) {
    const numOferta = (lic.no_oferta || '').toString().trim();
    const nomOferta = (lic.nombre_oferta || 'Licitación Suministro').toString().trim();
    const rawCliente = (lic.cliente || lic.institucion || 'MINSAL').toString().trim();
    const rawMes = (lic.mes || 'MARZO').toString().toUpperCase().trim();
    const rawAnio = (lic.anio || '2025').toString().trim();
    const tipoProceso = (lic.tipo_proceso || 'LICITACIÓN').toString().trim();
    const presentacion = (lic.presentacion || '').toString().trim();

    if (!numOferta && !nomOferta) continue;

    const key = (numOferta || nomOferta).toLowerCase();
    if (seenInBatch.has(key)) continue;
    seenInBatch.add(key);

    let clienteId = clientesMap.get(rawCliente.toLowerCase());
    if (!clienteId) {
      for (const [name, id] of clientesMap.entries()) {
        if (rawCliente.toLowerCase().includes(name) || name.includes(rawCliente.toLowerCase())) {
          clienteId = id;
          break;
        }
      }
      if (!clienteId) clienteId = 13;
    }

    const mesNum = monthMap[rawMes] || '03';
    const fechaPresentacion = toISODate(presentacion) || `${rawAnio}-${mesNum}-01`;
    const observaciones = `TIPO: ${tipoProceso} | Presentación: ${presentacion || 'N/A'} | Fuente: Microsoft Excel 365`;

    const existingId = numOferta ? existingMap.get(numOferta.toLowerCase()) : null;

    if (existingId) {
      toUpdate.push({
        id: existingId,
        payload: {
          nombre_oferta: nomOferta,
          cliente_id: clienteId,
          empresa_id: defaultEmpresaId,
          fecha_presentacion: fechaPresentacion,
          observaciones,
          actualizado_en: new Date().toISOString()
        }
      });
    } else {
      toInsert.push({
        numero_oferta: numOferta || `OF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nombre_oferta: nomOferta,
        empresa_id: defaultEmpresaId,
        cliente_id: clienteId,
        fecha_presentacion: fechaPresentacion,
        estatus_id: defaultEstatusId,
        persona_id: defaultPersonaId,
        observaciones
      });
    }
  }

  // 4. Inserción de cabeceras maestras
  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += 100) {
      const chunk = toInsert.slice(i, i + 100);
      await supabase.from('licitaciones_ofertas').insert(chunk);
    }
  }

  if (toUpdate.length > 0) {
    for (let i = 0; i < toUpdate.length; i += 20) {
      const chunk = toUpdate.slice(i, i + 20);
      await Promise.all(chunk.map(item =>
        supabase.from('licitaciones_ofertas').update(item.payload).eq('licitacion_oferta_id', item.id)
      ));
    }
  }

  // 5. Sincronización de detalle: 'ofertas_items'
  const { data: allLics } = await supabase.from('licitaciones_ofertas').select('licitacion_oferta_id, numero_oferta');
  const masterMap = new Map();
  allLics?.forEach(l => {
    if (l.numero_oferta) masterMap.set(l.numero_oferta.toLowerCase().trim(), l.licitacion_oferta_id);
  });

  // Pre-crear productos faltantes en bulk con columnas correctas
  const neededProductsMap = new Map();
  for (const lic of itemsToSync) {
    const prodName = (lic.producto || lic.nombre_oferta || '').toString().trim();
    if (prodName && !prodsMap.has(prodName.toLowerCase())) {
      let found = false;
      for (const [name] of prodsMap.entries()) {
        if (prodName.toLowerCase().includes(name) || name.includes(prodName.toLowerCase())) {
          found = true;
          break;
        }
      }
      if (!found && !neededProductsMap.has(prodName.toLowerCase())) {
        neededProductsMap.set(prodName.toLowerCase(), {
          name: prodName,
          marca: (lic.marca || '').toString().trim(),
          lic
        });
      }
    }
  }

  if (neededProductsMap.size > 0) {
    console.log(`📦 Creando ${neededProductsMap.size} nuevos productos en 'productos_equipo'...`);
    const newProdRows = Array.from(neededProductsMap.values()).map((item, idx) => {
      const brandId = getMarcaId(item.marca);
      const lic = item.lic;
      const statusStr = lic.estatus_item || 'N/A';
      const adjEmp = lic.empresa_adjudicada || 'N/A';
      const adjPrice = lic.precio_adjudicado !== undefined && lic.precio_adjudicado !== '' ? lic.precio_adjudicado : 0;
      const costoLM = lic.costo_prueba_lm || 0;
      const contrato = lic.no_contrato || 'N/A';
      const obs = lic.observaciones || lic.razon || '';
      const desc = `[Marca: ${item.marca || 'N/A'}] Estatus: ${statusStr} | Adjudicado: ${adjEmp} ($${adjPrice}) | Costo L&M: $${costoLM} | Contrato: ${contrato} | ${obs}`.trim();

      return {
        nombre_producto_equipo: (item.name || 'Producto').slice(0, 140),
        codigo_sku: `EX-${Date.now().toString().slice(-6)}-${idx + 1}`,
        marca_id: brandId,
        descripcion: desc,
        es_equipo: false,
        unidad_medida: 'Unidad',
        activo: true
      };
    });

    for (let i = 0; i < newProdRows.length; i += 100) {
      const chunk = newProdRows.slice(i, i + 100);
      const { data: createdProds, error: pErr } = await supabase.from('productos_equipo').insert(chunk).select('producto_equipo_id, nombre_producto_equipo');
      if (pErr) console.error('Error insertando productos:', pErr);
      createdProds?.forEach(p => prodsMap.set(p.nombre_producto_equipo.toLowerCase().trim(), p.producto_equipo_id));
    }
  }

  const defaultProductId = prodsRes.data?.[0]?.producto_equipo_id || 80;

  // Limpiar ofertas_items anteriores
  const activeMasterIds = Array.from(masterMap.values());
  if (activeMasterIds.length > 0) {
    for (let i = 0; i < activeMasterIds.length; i += 50) {
      const chunkIds = activeMasterIds.slice(i, i + 50);
      await supabase.from('ofertas_items').delete().in('licitacion_oferta_id', chunkIds);
    }
  }

  const ofertaProductSeen = new Map();
  const ofertaRenglonCounter = new Map();
  const itemsToInsert = [];
  const extraProductsToCreate = [];

  for (const lic of itemsToSync) {
    const numOferta = (lic.no_oferta || '').toString().trim();
    const licId = masterMap.get(numOferta.toLowerCase());
    if (!licId) continue;

    const currentRenglon = (ofertaRenglonCounter.get(licId) || 0) + 1;
    ofertaRenglonCounter.set(licId, currentRenglon);

    let prodName = (lic.producto || lic.nombre_oferta || `Producto Renglón ${currentRenglon}`).toString().trim();
    let prodId = prodsMap.get(prodName.toLowerCase());

    if (!prodId) {
      for (const [name, id] of prodsMap.entries()) {
        if (prodName.toLowerCase().includes(name) || name.includes(prodName.toLowerCase())) {
          prodId = id;
          break;
        }
      }
    }
    if (!prodId) prodId = defaultProductId;

    // Si ya existe este producto en esta misma oferta, generar un item diferenciado para no violar uq_oferta_producto
    const pairKey = `${licId}_${prodId}`;
    if (ofertaProductSeen.has(pairKey)) {
      extraProductsToCreate.push({
        licId,
        currentRenglon,
        prodName: `${prodName} (Rngl. ${currentRenglon} - ${numOferta})`.slice(0, 140),
        lic
      });
      continue;
    }

    ofertaProductSeen.set(pairKey, true);

    const rawQty = lic.cantidad || 1;
    const cleanQty = typeof rawQty === 'number' ? rawQty : (parseFloat(String(rawQty).replace(/[^0-9.-]+/g, '')) || 1);

    const rawPrice = lic.precio_unitario || 0;
    const cleanPrice = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0);

    const rawStatus = (lic.estatus_item || '').toString().toLowerCase();
    const esAdjudicado = rawStatus.includes('adjudicad') || rawStatus.includes('ganad');

    itemsToInsert.push({
      licitacion_oferta_id: licId,
      producto_equipo_id: prodId,
      renglon_numero: currentRenglon,
      cantidad: Math.max(1, cleanQty),
      precio_unitario: Math.max(0, cleanPrice),
      es_adjudicado: esAdjudicado
    });
  }

  // Si hubo duplicados dentro de la misma oferta, crear productos específicos en batch
  if (extraProductsToCreate.length > 0) {
    const extraRows = extraProductsToCreate.map((e, idx) => {
      const brandId = getMarcaId(e.lic.marca);
      const lic = e.lic;
      const statusStr = lic.estatus_item || 'N/A';
      const adjEmp = lic.empresa_adjudicada || 'N/A';
      const adjPrice = lic.precio_adjudicado !== undefined && lic.precio_adjudicado !== '' ? lic.precio_adjudicado : 0;
      const costoLM = lic.costo_prueba_lm || 0;
      const contrato = lic.no_contrato || 'N/A';
      const obs = lic.observaciones || lic.razon || '';
      const desc = `[Marca: ${lic.marca || 'N/A'}] Estatus: ${statusStr} | Adjudicado: ${adjEmp} ($${adjPrice}) | Costo L&M: $${costoLM} | Contrato: ${contrato} | ${obs}`.trim();

      return {
        nombre_producto_equipo: e.prodName,
        codigo_sku: `EX-D-${Date.now()}-${idx + 1}`,
        marca_id: brandId,
        descripcion: desc,
        es_equipo: false,
        unidad_medida: 'Unidad',
        activo: true
      };
    });

    const { data: createdExtra } = await supabase.from('productos_equipo').insert(extraRows).select('producto_equipo_id');
    if (createdExtra) {
      createdExtra.forEach((p, idx) => {
        const itemContext = extraProductsToCreate[idx];
        const rawQty = itemContext.lic.cantidad || 1;
        const cleanQty = typeof rawQty === 'number' ? rawQty : (parseFloat(String(rawQty).replace(/[^0-9.-]+/g, '')) || 1);
        const rawPrice = itemContext.lic.precio_unitario || 0;
        const cleanPrice = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0);
        const rawStatus = (itemContext.lic.estatus_item || '').toString().toLowerCase();

        itemsToInsert.push({
          licitacion_oferta_id: itemContext.licId,
          producto_equipo_id: p.producto_equipo_id,
          renglon_numero: itemContext.currentRenglon,
          cantidad: Math.max(1, cleanQty),
          precio_unitario: Math.max(0, cleanPrice),
          es_adjudicado: rawStatus.includes('adjudicad') || rawStatus.includes('ganad')
        });
      });
    }
  }

  let itemsInsertedCount = 0;
  if (itemsToInsert.length > 0) {
    for (let i = 0; i < itemsToInsert.length; i += 100) {
      const chunk = itemsToInsert.slice(i, i + 100);
      const { data: insData, error: itemErr } = await supabase.from('ofertas_items').insert(chunk).select('oferta_item_id');
      if (!itemErr) {
        itemsInsertedCount += chunk.length;
      } else {
        console.error('Error insertando ofertas_items:', itemErr);
      }
    }
  }

  console.log(`\n🎉 SINCRONIZACIÓN MAESTRO-DETALLE COMPLETADA CON ÉXITO:`);
  console.log(`📊 Total Licitaciones Maestras (licitaciones_ofertas): ${masterMap.size}`);
  console.log(`📦 Total Productos / Renglones Ofertados (ofertas_items): ${itemsInsertedCount}`);
}

syncDirect();
