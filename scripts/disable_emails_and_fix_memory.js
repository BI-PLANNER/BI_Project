const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

function n8nRequest(endpoint, method = 'GET', body = null) {
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
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('📥 Obteniendo workflow Data_BI_SHEETS...');
  const res = await n8nRequest('/api/v1/workflows/e1Yt2LjWn33U6eZv');
  const wf = res.data;

  console.log(`Workflow actual: ${wf.name} (${wf.nodes.length} nodos)`);

  // 1. DESACTIVAR Y DESCONECTAR EL NODO DE ENVÍO DE CORREOS
  const emailNode = wf.nodes.find(n => n.type.includes('emailSend') || n.name.includes('Enviar Correo'));
  if (emailNode) {
    emailNode.disabled = true; // Desactivar nodo
    console.log('🛑 Nodo de Enviar Correo DESACTIVADO (disabled: true).');
  }

  // Desconectar también del flujo de ejecución
  if (wf.connections['Formatear Alertas por Encargado']) {
    wf.connections['Formatear Alertas por Encargado'] = { main: [[]] };
    console.log('🔌 Conexión de envío de correos desconectada.');
  }

  if (wf.connections['Consolidar Reporte BI']) {
    // Solo conectar a Responder al Webhook, quitar llamada a notificaciones
    wf.connections['Consolidar Reporte BI'] = {
      main: [
        [
          { node: 'Responder al Webhook', type: 'main', index: 0 }
        ]
      ]
    };
    console.log('🔌 Rama de correos desconectada de Consolidar Reporte BI.');
  }

  // 2. SOLUCIONAR EL ERROR DE "Simple Memory / No session ID found"
  // En un pipeline ETL por webhook/cron no hay sesión de chat, por lo que Simple Memory da error.
  // Quitamos la conexión de memoria hacia el agente IA o removemos el nodo.
  const memoryNodeIndex = wf.nodes.findIndex(n => n.type.includes('memoryBufferWindow') || n.name === 'Simple Memory');
  if (memoryNodeIndex !== -1) {
    wf.nodes.splice(memoryNodeIndex, 1);
    console.log('🗑️ Nodo "Simple Memory" eliminado (corrige el error "No session ID found").');
  }

  // Limpiar conexiones huérfanas de Simple Memory
  delete wf.connections['Simple Memory'];
  for (const [k, v] of Object.entries(wf.connections)) {
    if (v.ai_memory) {
      delete v.ai_memory;
    }
  }

  // 3. ACTUALIZAR EN N8N
  console.log('🚀 Actualizando workflow en n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${wf.id}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('✅ Workflow actualizado exitosamente en n8n!');
  } else {
    console.error('❌ Error al actualizar:', updateRes.data);
    return;
  }

  // 4. VERIFICAR ACTIVACIÓN
  const actRes = await n8nRequest(`/api/v1/workflows/${wf.id}/activate`, 'POST');
  console.log('🟢 Estado de activación:', actRes.status === 200 ? 'ACTIVO' : actRes.data);
}

run();
