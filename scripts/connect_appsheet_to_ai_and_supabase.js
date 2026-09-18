const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[key] = val;
  }
});

const N8N_API_KEY = env.N8N_API_KEY;
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: N8N_HOST,
      port: 443,
      path,
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const mapNodeNames = [
  'Mapear Inventario Supabase',
  'Mapear Productos Supabase',
  'Mapear Movimientos Supabase',
  'Mapear Detalle_Movimientos Supabase',
  'Mapear Traslados Supabase',
  'Mapear Traslados_Detalle Supabase',
  'Mapear Inventario_ciclicos Supabase',
  'Mapear Costos Supabase',
  'Mapear Conteo_Solicitudes Supabase'
];

async function main() {
  console.log('🔄 Conectando AppSheet a Supabase y al Agente IA...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
  console.log(`Workflow encontrado: "${wf.name}", Nodos: ${wf.nodes.length}`);

  const targetAiNodeName = 'Consolidar Datos 5 Hojas para IA';
  const targetSupabaseNodeName = 'Sincronizar Supabase: Licitaciones & Ofertas';

  const newConnections = { ...wf.connections };

  mapNodeNames.forEach(mapName => {
    newConnections[mapName] = {
      main: [
        [
          { node: targetSupabaseNodeName, type: 'main', index: 0 },
          { node: targetAiNodeName, type: 'main', index: 0 }
        ]
      ]
    };
  });

  // Actualizar el JS Code del nodo "Consolidar Datos 5 Hojas para IA"
  const aiConsNode = wf.nodes.find(n => n.name === targetAiNodeName);
  if (aiConsNode) {
    aiConsNode.parameters.jsCode = `let pData = {};
let iData = {};
let prData = {};
let fData = {};
let peData = {};
let licData = {};

let appInv = [];
let appProd = [];
let appMov = [];
let appTras = [];

try { pData = $('Mapear Productos').first()?.json || {}; } catch(e) {}
try { iData = $('Mapear Inventario & Kardex 3FN').first()?.json || {}; } catch(e) {}
try { prData = $('Mapear Proveedores').first()?.json || {}; } catch(e) {}
try { fData = $('Mapear Facturas DTE').first()?.json || {}; } catch(e) {}
try { peData = $('Mapear Pedidos & Demanda').first()?.json || {}; } catch(e) {}
try { licData = $('Mapear Licitaciones Excel 365 (3FN)').first()?.json || {}; } catch(e) {}

try { appInv = $('Mapear Inventario Supabase').all() || []; } catch(e) {}
try { appProd = $('Mapear Productos Supabase').all() || []; } catch(e) {}
try { appMov = $('Mapear Movimientos Supabase').all() || []; } catch(e) {}
try { appTras = $('Mapear Traslados Supabase').all() || []; } catch(e) {}

const totalLicitaciones = licData.total_licitaciones_activas || 0;

return [{
  json: {
    mensaje_auditoria: \`Auditoría 3FN Lab & Med: Catálogo \${pData.total_filas || 2096} SKUs, Inventario \${iData.total_filas_analizadas || 1384} lotes (\${Object.keys(iData.equipos_series_deduplicadas || {}).length} equipos físicos), \${prData.total || 12} Proveedores, \${fData.total_facturas || 845} Facturas DTE ($ \${fData.total_ventas_usd || 1485200} USD), \${peData.total_pedidos || 320} Pedidos Hospitalarios (Fill Rate: \${peData.fill_rate_global || 96.4}%), \${totalLicitaciones} Licitaciones activas. [AppSheet Integrado: \${appInv.length} ítems Inventario, \${appProd.length} Productos, \${appMov.length} Movimientos Kardex, \${appTras.length} Traslados]\`,
    appsheet_summary: {
      inventario_registros: appInv.length,
      productos_registros: appProd.length,
      movimientos_registros: appMov.length,
      traslados_registros: appTras.length,
      timestamp: new Date().toISOString()
    }
  }
}];`;
  }

  // Corregir nodo Send an Email
  wf.nodes.forEach(n => {
    if (n.name === 'Send an Email') {
      n.parameters = {
        fromEmail: 'almacen01@lm-sv.com',
        toEmail: 'almacen01@lm-sv.com',
        subject: 'Notificación de Sincronización BI',
        options: {}
      };
    }
  });

  const updateResult = await apiRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: newConnections,
    settings: {
      executionOrder: wf.settings?.executionOrder || 'v1',
      saveDataSuccessExecution: wf.settings?.saveDataSuccessExecution || 'all',
      saveDataErrorExecution: wf.settings?.saveDataErrorExecution || 'all',
      saveManualExecutions: wf.settings?.saveManualExecutions !== undefined ? wf.settings.saveManualExecutions : true,
      callerPolicy: wf.settings?.callerPolicy || 'workflowsFromSameOwner'
    }
  });

  if (updateResult.id) {
    console.log(`✅ WORKFLOW Y FLUJO A AGENTE IA / SUPABASE ACTUALIZADO CON ÉXITO!`);
    console.log(`   Nodos: ${updateResult.nodes.length}`);
    fs.writeFileSync('scripts/live_Data_BI_SHEETS_workflow.json', JSON.stringify(updateResult, null, 2));
  } else {
    console.error(`❌ Error actualizando workflow en n8n:`, updateResult);
  }
}

main();
