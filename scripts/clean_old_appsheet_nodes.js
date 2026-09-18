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

const APP_ID = 'ed726ad2-54d9-4d13-a088-a48b767191e2';
const APP_KEY = 'V2-Xw9do-4fMTs-flfVY-5fj4j-pD5kb-8CW1v-E5KX5-mrAdo';

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

async function main() {
  console.log('🔄 Eliminando nodo antiguo de prueba...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
  
  // Filtrar y eliminar el nodo antiguo "Extraer todo de AppSheet" y "Subir a Supabase (AppSheet)" si tienen la URL vieja
  const cleanedNodes = wf.nodes.filter(n => n.name !== 'Extraer todo de AppSheet' && n.name !== 'Subir a Supabase (AppSheet)');

  const cleanedConnections = { ...wf.connections };
  delete cleanedConnections['Extraer todo de AppSheet'];
  delete cleanedConnections['Subir a Supabase (AppSheet)'];

  // Limpiar referencias en las conexiones del trigger
  for (const srcNode of Object.keys(cleanedConnections)) {
    if (cleanedConnections[srcNode]?.main) {
      cleanedConnections[srcNode].main = cleanedConnections[srcNode].main.map(outputGroup =>
        outputGroup.filter(c => c.node !== 'Extraer todo de AppSheet' && c.node !== 'Subir a Supabase (AppSheet)')
      );
    }
  }

  // Asegurar que Send an Email esté validado
  cleanedNodes.forEach(n => {
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
    nodes: cleanedNodes,
    connections: cleanedConnections,
    settings: {
      executionOrder: wf.settings?.executionOrder || 'v1',
      saveDataSuccessExecution: wf.settings?.saveDataSuccessExecution || 'all',
      saveDataErrorExecution: wf.settings?.saveDataErrorExecution || 'all',
      saveManualExecutions: wf.settings?.saveManualExecutions !== undefined ? wf.settings.saveManualExecutions : true,
      callerPolicy: wf.settings?.callerPolicy || 'workflowsFromSameOwner'
    }
  });

  if (updateResult.id) {
    console.log(`✅ NODO ANTIGUO ELIMINADO Y WORKFLOW LIMPIADO CON ÉXITO!`);
    console.log(`   Nodos Activos: ${updateResult.nodes.length}`);
    fs.writeFileSync('scripts/live_Data_BI_SHEETS_workflow.json', JSON.stringify(updateResult, null, 2));
  } else {
    console.error(`❌ Error actualizando workflow:`, updateResult);
  }
}

main();
