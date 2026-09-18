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

const tablesToSync = [
  { name: 'Inventario', label: 'AppSheet: Inventario Real' },
  { name: 'Productos', label: 'AppSheet: Catálogo Productos' },
  { name: 'Movimientos', label: 'AppSheet: Movimientos Kardex' },
  { name: 'Detalle_Movimientos', label: 'AppSheet: Detalle Movimientos' },
  { name: 'Traslados', label: 'AppSheet: Traslados Almacén' },
  { name: 'Traslados_Detalle', label: 'AppSheet: Traslados Detalle' },
  { name: 'Inventario_ciclicos', label: 'AppSheet: Conteo Cíclico' },
  { name: 'Costos', label: 'AppSheet: Lista de Costos' },
  { name: 'Conteo_Solicitudes', label: 'AppSheet: Solicitudes de Conteo' }
];

async function main() {
  console.log('🔄 Obteniendo workflow actual de n8n...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
  console.log(`Workflow encontrado: "${wf.name}", Nodos actuales: ${wf.nodes.length}`);

  const triggerNodeName = 'Alimentación Automática (Cada 12 Horas)';
  const triggerNode = wf.nodes.find(n => n.name === triggerNodeName);
  
  if (!triggerNode) {
    console.error(`❌ No se encontró el nodo trigger "${triggerNodeName}"`);
    return;
  }

  // Corregir el nodo incompleto "Send an Email" si existe
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

  let startX = triggerNode.position ? triggerNode.position[0] + 300 : 500;
  let startY = triggerNode.position ? triggerNode.position[1] : 300;

  const newNodes = [];
  const newConnections = { ...wf.connections };

  if (!newConnections[triggerNodeName]) {
    newConnections[triggerNodeName] = { main: [[]] };
  }

  tablesToSync.forEach((tableObj, idx) => {
    const httpNodeName = tableObj.label;
    const mapNodeName = `Mapear ${tableObj.name} Supabase`;

    // 1. Nodo HTTP Request AppSheet
    const httpNode = {
      parameters: {
        method: 'POST',
        url: `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/${tableObj.name}/Action`,
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'ApplicationAccessKey', value: APP_KEY },
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: JSON.stringify({
          Action: 'Find',
          Properties: { Locale: 'es-ES' },
          Rows: []
        }),
        options: {}
      },
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [startX, startY + (idx * 160)],
      name: httpNodeName,
      id: `appsheet-node-${tableObj.name.toLowerCase()}`
    };

    // 2. Nodo Code para mapear a Supabase
    const mapNode = {
      parameters: {
        jsCode: `// Mapeo automático de ${tableObj.name} desde AppSheet hacia Supabase
const items = $input.all();
return items.map(item => {
  const d = item.json || {};
  return {
    json: {
      ...d,
      tabla_origen: '${tableObj.name}',
      sincronizado_en: new Date().toISOString()
    }
  };
});`
      },
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [startX + 320, startY + (idx * 160)],
      name: mapNodeName,
      id: `map-node-${tableObj.name.toLowerCase()}`
    };

    // Agregar si no existen
    if (!wf.nodes.find(n => n.name === httpNodeName)) {
      newNodes.push(httpNode);
    }
    if (!wf.nodes.find(n => n.name === mapNodeName)) {
      newNodes.push(mapNode);
    }

    // Conectar Trigger -> HTTP Node
    const mainOutputs = newConnections[triggerNodeName].main[0] || [];
    if (!mainOutputs.find(conn => conn.node === httpNodeName)) {
      mainOutputs.push({ node: httpNodeName, type: 'main', index: 0 });
    }
    newConnections[triggerNodeName].main[0] = mainOutputs;

    // Conectar HTTP Node -> Map Node
    newConnections[httpNodeName] = {
      main: [[{ node: mapNodeName, type: 'main', index: 0 }]]
    };
  });

  const updatedNodes = [...wf.nodes, ...newNodes];

  console.log(`✨ Agregando ${newNodes.length} nodos nuevos. Total nodos: ${updatedNodes.length}`);

  const updateResult = await apiRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, {
    name: wf.name,
    nodes: updatedNodes,
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
    console.log(`✅ WORKFLOW EN N8N ACTUALIZADO Y PUBLICADO CON ÉXITO!`);
    console.log(`   Nodos Totales en n8n: ${updateResult.nodes.length}`);
    fs.writeFileSync('scripts/live_Data_BI_SHEETS_workflow.json', JSON.stringify(updateResult, null, 2));
  } else {
    console.error(`❌ Error actualizando workflow en n8n:`, updateResult);
  }
}

main();
