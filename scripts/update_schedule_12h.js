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

async function updateScheduleTo12Hours() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // 1. Modificar el nodo Schedule Trigger
  const oldNodeName = "Alimentación Automática (Cada 1 Hora)";
  const newNodeName = "Alimentación Automática (Cada 12 Horas)";

  const cronNode = wf.nodes.find(n => n.id === 'cron-sync' || n.type === 'n8n-nodes-base.scheduleTrigger');
  if (cronNode) {
    cronNode.name = newNodeName;
    cronNode.parameters = {
      rule: {
        interval: [
          {
            field: "hours",
            hoursInterval: 12
          }
        ]
      }
    };
    console.log('✅ Nodo ScheduleTrigger actualizado a 12 horas.');
  }

  // 2. Actualizar conexiones
  wf.connections = wf.connections || {};
  if (wf.connections[oldNodeName]) {
    wf.connections[newNodeName] = wf.connections[oldNodeName];
    delete wf.connections[oldNodeName];
  }

  console.log('📤 Enviando workflow actualizado a n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 ¡ÉXITO! Frecuencia de actualización programada cambiada a Cada 12 Horas.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

updateScheduleTo12Hours();
