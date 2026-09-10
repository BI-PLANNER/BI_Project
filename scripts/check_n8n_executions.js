const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

async function n8nRequest(endpoint, method = 'GET') {
  return new Promise((resolve) => {
    https.request({
      hostname: N8N_HOST,
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).end();
  });
}

async function getRecentExecutions() {
  console.log('--- Obteniendo Últimas Ejecuciones de n8n ---');
  const res = await n8nRequest('/api/v1/executions?limit=5');
  console.log('Executions Status:', res.status);
  
  if (res.data && res.data.data) {
    for (const exec of res.data.data) {
      console.log(`\n======================================================`);
      console.log(`ID: ${exec.id} | Workflow: ${exec.workflowId} | Modo: ${exec.mode} | Status: ${exec.status} | Finished: ${exec.finished}`);
      console.log(`Started At: ${exec.startedAt} | Stopped At: ${exec.stoppedAt}`);
      
      // Detalle de la ejecución
      const detail = await n8nRequest(`/api/v1/executions/${exec.id}`);
      if (detail.data && detail.data.data && detail.data.data.resultData) {
        const result = detail.data.data.resultData;
        if (result.error) {
          console.log(`❌ ERROR EN NODO:`, JSON.stringify(result.error, null, 2));
        }
        if (result.lastNodeExecuted) {
          console.log(`Último nodo ejecutado: ${result.lastNodeExecuted}`);
        }
      }
    }
  } else {
    console.log('Respuesta:', JSON.stringify(res.data, null, 2));
  }
}

getRecentExecutions();
