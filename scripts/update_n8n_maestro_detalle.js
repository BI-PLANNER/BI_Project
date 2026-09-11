const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';

async function n8nRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: N8N_HOST,
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function updateMappingWithFullProductData() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  const jsCode = `// ==========================================================================
// LIMPIEZA & NORMALIZACIÓN 3FN MAESTRO-DETALLE (EXCEL 365 -> SUPABASE)
// ==========================================================================
const items = $input.all();
const licitaciones = [];

for (const item of items) {
  const row = item.json || {};
  
  const no_oferta = String(row['No. Oferta'] || row['No Oferta'] || row['Oferta'] || row['No. OFERTA'] || '').trim();
  const nombre_oferta = String(row['Nombre Oferta'] || row['Nombre de Oferta'] || row['Descripción'] || row['DESCRIPCION'] || '').trim();
  const cliente = String(row['Cliente'] || row['CLIENTE'] || row['Institución'] || row['INS'] || '').trim();
  const institucion = String(row['INS'] || row['INST.'] || row['Institución'] || 'MINSAL').trim().toUpperCase();
  const empresa = String(row['EMPR'] || row['Empresa'] || 'LAB&MED').trim().toUpperCase();
  const tipo_proceso = String(row['TIPO DE PROCESO'] || row['TIPO DE PROCESO '] || row['Tipo Proceso'] || 'LICITACION COMPETITIVA').trim().toUpperCase();
  const anio = String(row['AÑO'] || row['Año'] || row['ANIO'] || '2026').trim();
  const mes = String(row['Mes'] || row['MES'] || '').trim().toUpperCase();
  const presentacion = String(row['Presentación de oferta (Fecha)'] || row['Presentación'] || row['Presentacion'] || '').trim();
  
  // Datos específicos del producto / renglón
  const producto = String(row['Producto'] || row['PRODUCTO'] || row['Insumo'] || nombre_oferta || '').trim();
  const marca = String(row['Marca'] || row['MARCA'] || '').trim();
  const precio_unitario = row['Precio (unitario)'] || row['Precio Unitario'] || row['PRECIO'] || 0;
  const cantidad = row['Cantidad (unitaria)'] || row['Cantidad'] || row['CANTIDAD'] || 1;
  const total_ofertado = row['Total Ofertado'] || row['TOTAL OFERTADO'] || 0;
  const estatus_item = String(row['Estatus'] || row['ESTADO'] || '').trim();
  const no_contrato = String(row['No. De Contrato'] || row['No. Contrato'] || '').trim();
  const costo_prueba_lm = row['Costo de prueba L&M'] || 0;
  const observaciones = String(row['Observaciones'] || '').trim();

  // Filtrar solo filas completamente vacías
  if (!no_oferta && !nombre_oferta && !producto && !cliente) continue;

  licitaciones.push({
    no_oferta: no_oferta || ('OFERTA-' + (licitaciones.length + 1)),
    nombre_oferta: nombre_oferta || 'Licitación / Oferta ' + no_oferta,
    cliente: cliente || 'MINSAL',
    institucion: institucion || 'MINSAL',
    empresa: empresa || 'LAB&MED',
    tipo_proceso: tipo_proceso || 'LICITACION COMPETITIVA',
    anio: anio || '2026',
    mes: mes || 'MARZO',
    presentacion: presentacion || '',
    producto: producto,
    marca: marca,
    precio_unitario: precio_unitario,
    cantidad: cantidad,
    total_ofertado: total_ofertado,
    estatus_item: estatus_item,
    no_contrato: no_contrato,
    costo_prueba_lm: costo_prueba_lm,
    observaciones: observaciones,
    fuente: 'Microsoft Excel 365 (SharePoint Lab&Med)'
  });
}

return [{
  json: {
    tipo: 'licitaciones_excel_365_3fn_maestro_detalle',
    total_licitaciones: licitaciones.length,
    licitaciones: licitaciones
  }
}];`;

  const mapNode = wf.nodes.find(n => n.id === 'transform-licitaciones-365');
  if (mapNode) {
    mapNode.parameters = {
      mode: 'runOnceForAllItems',
      jsCode: jsCode
    };
    console.log('✅ Nodo de Mapeo actualizado con campos completos de producto y renglón.');
  }

  console.log('📤 Enviando actualización de workflow a n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1",
      saveDataSuccessExecution: "all",
      saveExecutionProgress: true,
      saveManualExecutions: true
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 Workflow actualizado con éxito.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

updateMappingWithFullProductData();
