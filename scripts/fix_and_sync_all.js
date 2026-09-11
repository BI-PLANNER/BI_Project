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

async function fixWorkflowAndTest() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // 1. Configurar nodo de mapeo con JavaScript ultrarobusto compatible con el motor V8 nativo de n8n
  const jsCode = `// ==========================================================================
// LIMPIEZA & NORMALIZACIÓN 3FN DE LICITACIONES (JAVASCRIPT NATIVO V8 N8N)
// ==========================================================================
const items = $input.all();
const licitaciones = [];

for (const item of items) {
  const row = item.json || {};
  
  const no_oferta = String(row['No. Oferta'] || row['No Oferta'] || row['Oferta'] || '').trim();
  const nombre_oferta = String(row['Nombre Oferta'] || row['Nombre de Oferta'] || row['Descripción'] || '').trim();
  const cliente = String(row['Cliente'] || row['CLIENTE'] || '').trim();
  const institucion = String(row['INS'] || row['Institución'] || row['Institucion'] || 'MINSAL').trim().toUpperCase();
  const empresa = String(row['EMPR'] || row['Empresa'] || 'LAB&MED').trim().toUpperCase();
  const tipo_proceso = String(row['TIPO DE PROCESO'] || row['Tipo Proceso'] || 'LICITACION COMPETITIVA').trim().toUpperCase();
  const anio = String(row['AÑO'] || row['Año'] || row['ANIO'] || '2026').trim();
  const mes = String(row['Mes'] || row['MES'] || '').trim().toUpperCase();
  const presentacion = String(row['Presentación'] || row['Presentacion'] || '').trim();

  if (!no_oferta && !nombre_oferta && !cliente) continue;

  licitaciones.push({
    no_oferta,
    nombre_oferta,
    cliente,
    institucion,
    empresa,
    tipo_proceso,
    anio,
    mes,
    presentacion,
    fuente: 'Microsoft Excel 365 (SharePoint Lab&Med)'
  });
}

return [{
  json: {
    tipo: 'licitaciones_excel_365_3fn',
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
    console.log('✅ Nodo de Mapeo configurado con JavaScript nativo V8.');
  }

  // 2. Corregir nodo HTTP Sync para que serialice el JSON correctamente con JSON.stringify
  const syncNode = wf.nodes.find(n => n.id === 'http-sync-supabase-licitaciones' || (n.name && n.name.includes('Sincronizar Supabase: Licitaciones')));
  if (syncNode) {
    syncNode.parameters = {
      method: "POST",
      url: "https://control-planner.vercel.app/api/db",
      sendBody: true,
      specifyBody: "json",
      jsonBody: "={{ JSON.stringify({ action: 'sync_excel_licitaciones', table: 'sync_excel_licitaciones', licitaciones: $json.licitaciones }) }}",
      options: {}
    };
    console.log('✅ Nodo HTTP Sync configurado con serialización JSON válida. ID:', syncNode.id);
  } else {
    console.log('⚠️ No se encontró syncNode con ese nombre. Nombres disponibles:', wf.nodes.map(n => n.name));
  }

  console.log('📤 Actualizando workflow en n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 Workflow actualizado con éxito.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

fixWorkflowAndTest();
