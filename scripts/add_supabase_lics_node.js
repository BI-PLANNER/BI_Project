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

async function addSupabaseLicitacionesSyncNode() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // Nodo de guardado diario en Supabase
  const supabaseLicsNode = {
    parameters: {
      method: "POST",
      url: "https://control-planner.vercel.app/api/db",
      sendBody: true,
      specifyBody: "json",
      jsonBody: "={\n  \"action\": \"sync_excel_licitaciones\",\n  \"licitaciones\": $json.licitaciones\n}",
      options: {}
    },
    id: "sync-supabase-licitaciones-diarias",
    name: "Sincronizar Supabase: Licitaciones & Ofertas",
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position: [560, -200],
    continueOnFail: true,
    notes: "Guarda y actualiza diariamente todas las licitaciones en la tabla 'licitaciones_ofertas' y 'clientes' de Supabase"
  };

  // Agregar o reemplazar
  wf.nodes = wf.nodes.filter(n => n.id !== 'sync-supabase-licitaciones-diarias');
  wf.nodes.push(supabaseLicsNode);

  // Conectar:
  // Mapear Licitaciones Excel 365 -> Sincronizar Supabase: Licitaciones & Ofertas -> Consolidar Datos 5 Hojas para IA
  wf.connections = wf.connections || {};
  
  wf.connections["Mapear Licitaciones Excel 365 (3FN)"] = {
    main: [
      [{ node: supabaseLicsNode.name, type: "main", index: 0 }]
    ]
  };

  wf.connections[supabaseLicsNode.name] = {
    main: [
      [{ node: "Consolidar Datos 5 Hojas para IA", type: "main", index: 0 }]
    ]
  };

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
    console.log('🎉 ¡ÉXITO! Nodo de guardado diario en Supabase (licitaciones_ofertas) configurado en n8n.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

addSupabaseLicitacionesSyncNode();
