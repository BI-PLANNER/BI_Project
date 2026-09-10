const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';
const OUTLOOK_CRED_ID = 'JWdTQwgYoasXfNVQ';

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

async function updateWorkflowWithOutlook() {
  console.log(`📥 1. Obteniendo workflow ${WORKFLOW_ID}...`);
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('❌ Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // Nodo de Microsoft Outlook
  const outlookNode = {
    parameters: {
      operation: "send",
      toRecipients: "={{ $json.email }}",
      subject: "={{ $json.asunto }}",
      bodyContent: "={{ $json.cuerpoHtml }}",
      bodyContentType: "html",
      options: {}
    },
    id: "outlook-send-encargados",
    name: "Enviar Correo a Encargados (Microsoft Outlook 365)",
    type: "n8n-nodes-base.microsoftOutlook",
    typeVersion: 2,
    position: [1744, 368],
    credentials: {
      microsoftOutlookOAuth2Api: {
        id: OUTLOOK_CRED_ID,
        name: "Microsoft Outlook - Lab&Med (businessinteligent01@lm-sv.com)"
      }
    },
    continueOnFail: true,
    notes: "Envía notificaciones de alerta y compromisos desde la cuenta corporativa businessinteligent01@lm-sv.com"
  };

  // Reemplazar o actualizar el nodo de correo
  wf.nodes = wf.nodes.filter(n => n.id !== 'smtp-send-encargados' && n.id !== 'outlook-send-encargados');
  wf.nodes.push(outlookNode);

  // Limpiar conexiones viejas
  delete wf.connections["Enviar Correo a Encargados (SMTP Lab & Med)"];
  wf.connections[outlookNode.name] = { main: [[]] };

  // Conectar Formatear Alertas -> Microsoft Outlook
  wf.connections = wf.connections || {};
  if (wf.connections["Formatear Alertas por Encargado"]) {
    wf.connections["Formatear Alertas por Encargado"] = {
      main: [
        [{ node: outlookNode.name, type: "main", index: 0 }]
      ]
    };
  }

  console.log(`📤 2. Actualizando workflow con nodo de Microsoft Outlook...`);
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 ¡ÉXITO! Nodo de Microsoft Outlook 365 agregado y configurado en el workflow.');
  } else {
    console.error('❌ Error al actualizar workflow:', updateRes.data);
  }
}

updateWorkflowWithOutlook();
