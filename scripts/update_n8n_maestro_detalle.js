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
// LIMPIEZA & NORMALIZACIÓN 3FN MAESTRO-DETALLE + PARSER FECHAS EXCEL (SERIAL 46052 -> YYYY-MM-DD / DD/MM/YYYY)
// ==========================================================================
const items = $input.all();
const licitaciones = [];

function parseExcelOrStandardDate(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (!isNaN(num) && num > 30000 && num < 70000) {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return \`\${dd}/\${mm}/\${yyyy}\`;
  }
  const str = String(val).trim();
  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    const p0 = slashParts[0].padStart(2, '0');
    const p1 = slashParts[1].padStart(2, '0');
    let p2 = slashParts[2].trim();
    if (p2.length === 2) p2 = '20' + p2;
    if (p0.length === 4) return \`\${slashParts[2].padStart(2,'0')}/\${p1}/\${p0}\`;
    return \`\${p0}/\${p1}/\${p2}\`;
  }
  const hyphenParts = str.split('-');
  if (hyphenParts.length === 3) {
    if (hyphenParts[0].length === 4) {
      return \`\${hyphenParts[2].padStart(2,'0')}/\${hyphenParts[1].padStart(2,'0')}/\${hyphenParts[0]}\`;
    }
  }
  return str;
}

function toISODate(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (!isNaN(num) && num > 30000 && num < 70000) {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return \`\${yyyy}-\${mm}-\${dd}\`;
  }
  const str = String(val).trim();
  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    const p0 = slashParts[0].padStart(2, '0');
    const p1 = slashParts[1].padStart(2, '0');
    let p2 = slashParts[2].trim();
    if (p2.length === 2) p2 = '20' + p2;
    if (p0.length === 4) return \`\${p0}-\${p1}-\${p2.padStart(2, '0')}\`;
    return \`\${p2}-\${p1}-\${p0}\`;
  }
  const hyphenParts = str.split('-');
  if (hyphenParts.length === 3) {
    if (hyphenParts[0].length === 4) return str;
    let p2 = hyphenParts[2].trim();
    if (p2.length === 2) p2 = '20' + p2;
    return \`\${p2}-\${hyphenParts[1].padStart(2, '0')}-\${hyphenParts[0].padStart(2, '0')}\`;
  }
  return null;
}

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
  
  const rawPresentacion = row['Presentación de oferta (Fecha)'] || row['Presentación'] || row['Presentacion'] || '';
  const rawAdjudicacion = row['Fecha de adjudicacion'] || row['Fecha Adjudicación'] || row['Fecha Adjudicacion'] || '';

  const presentacion_formateada = parseExcelOrStandardDate(rawPresentacion);
  const presentacion_iso = toISODate(rawPresentacion);
  
  const adjudicacion_formateada = parseExcelOrStandardDate(rawAdjudicacion);
  const adjudicacion_iso = toISODate(rawAdjudicacion);

  // Datos específicos del producto / renglón
  const renglon = row['No. Renglón'] || row['Renglón'] || row['Renglon'] || row['No. Item'] || null;
  const producto = String(row['Producto'] || row['PRODUCTO'] || row['Insumo'] || nombre_oferta || '').trim();
  const marca = String(row['Marca'] || row['MARCA'] || '').trim();
  const precio_unitario = row['Precio (unitario)'] || row['Precio Unitario'] || row['PRECIO'] || 0;
  const cantidad = row['Cantidad (unitaria)'] || row['Cantidad'] || row['CANTIDAD'] || 1;
  const total_ofertado = row['Total Ofertado'] || row['TOTAL OFERTADO'] || 0;
  const estatus_item = String(row['Estatus'] || row['ESTADO'] || '').trim();
  const no_contrato = String(row['No. De Contrato'] || row['No. Contrato'] || '').trim();
  const costo_prueba_lm = row['Costo de prueba L&M'] || 0;
  const observaciones = String(row['Observaciones'] || '').trim();
  const precio_adjudicado = row['Precio adjudicado '] || row['Precio adjudicado'] || 0;
  const empresa_adjudicada = String(row['Empresa adjudicada'] || row['Empresa adjudicada '] || '').trim();
  const razon = String(row['Razon'] || row['Razon '] || '').trim();
  const esperado = String(row['Esperado'] || '').trim();

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
    'Presentación de oferta (Fecha)': presentacion_formateada || 'N/A',
    presentacion_iso: presentacion_iso,
    'Fecha de adjudicacion': adjudicacion_formateada || 'N/A',
    adjudicacion_iso: adjudicacion_iso,
    renglon: renglon,
    producto: producto,
    marca: marca,
    precio_unitario: precio_unitario,
    cantidad: cantidad,
    total_ofertado: total_ofertado,
    estatus_item: estatus_item,
    precio_adjudicado: precio_adjudicado,
    empresa_adjudicada: empresa_adjudicada,
    razon: razon,
    esperado: esperado,
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
  }

  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: 'v1' }
  };

  console.log('📤 Enviando actualización de workflow a n8n con formateador de fechas Excel...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', payload);
  if (updateRes.status === 200) {
    console.log('🎉 Workflow de n8n actualizado con éxito (Fechas Excel Seriales corregidas).');
  } else {
    console.error('Error al actualizar workflow:', updateRes.data);
  }
}

updateMappingWithFullProductData().catch(console.error);
