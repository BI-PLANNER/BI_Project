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

async function main() {
  const wf = await apiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
  console.log(`Workflow: "${wf.name}", Nodos: ${wf.nodes.length}`);

  // Copy credential from existing Google Sheets node
  const existingSheetsNode = wf.nodes.find(n => n.type === 'n8n-nodes-base.googleSheets');
  if (!existingSheetsNode) { console.log('No hay nodo Sheets existente'); return; }
  
  console.log('Credenciales del nodo Sheets existente:', JSON.stringify(existingSheetsNode.credentials));
  
  const sheetsCredentials = existingSheetsNode.credentials;
  const sourceNode = wf.nodes.find(n => n.name === 'Mapear Pedidos & Demanda');
  if (!sourceNode) { console.log('ERROR: No se encontró nodo fuente'); return; }

  // Check if already added
  if (wf.nodes.find(n => n.name === 'Google Sheets: Pedidos Detalles')) {
    console.log('⚠️  El nodo ya existe en el workflow.');
    return;
  }

  // New nodes
  const newSheetsNode = {
    id: 'sheets-pedidos-detalles',
    name: 'Google Sheets: Pedidos Detalles',
    type: 'n8n-nodes-base.googleSheets',
    typeVersion: existingSheetsNode.typeVersion || 4,
    position: [3056, 340],
    credentials: sheetsCredentials,
    parameters: {
      operation: 'read',
      documentId: { __rl: true, mode: 'list', value: 'DBlabymed' },
      sheetName: { __rl: true, mode: 'name', value: 'PedidosDetalles' },
      options: {}
    }
  };

  const newTransformNode = {
    id: 'transform-pedidos-detalles',
    name: 'Mapear Detalles de Pedidos',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [3296, 340],
    parameters: {
      jsCode: `const items = $input.all();
return items.map(item => {
  const r = item.json;
  return {
    json: {
      pedido_id: String(r['ID Pedido'] || r['PedidoID'] || r['ID'] || '').trim(),
      numero_pedido: String(r['No. Pedido'] || r['Numero Pedido'] || '').trim(),
      fecha_pedido: r['Fecha Pedido'] || '',
      cliente: String(r['Cliente'] || r['Hospital'] || '').trim(),
      producto: String(r['Producto'] || r['Descripcion'] || '').trim(),
      codigo_sku: String(r['SKU'] || r['Codigo'] || '').trim(),
      cantidad_pedida: Number(r['Cantidad'] || 0),
      cantidad_entregada: Number(r['Entregado'] || 0),
      precio_unitario: Number(r['PrecioUnitario'] || r['Precio'] || 0),
      total_linea: Number(r['Total'] || 0),
      estado: String(r['Estado'] || r['Estatus'] || 'PENDIENTE').trim().toUpperCase(),
      motorista: String(r['Motorista'] || '').trim(),
      numero_acta: String(r['Acta'] || '').trim(),
      observaciones: String(r['Observaciones'] || '').trim()
    }
  };
}).filter(i => i.json.pedido_id || i.json.numero_pedido || i.json.producto);`
    }
  };

  const newSupabaseNode = {
    id: 'supabase-pedidos-detalles',
    name: 'Supabase: Pedidos Detalles',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4,
    position: [3536, 340],
    parameters: {
      method: 'POST',
      url: `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/entregas_programadas`,
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'apikey', value: env.SUPABASE_SERVICE_ROLE_KEY },
          { name: 'Authorization', value: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Prefer', value: 'resolution=merge-duplicates,return=minimal' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json) }}',
      options: { response: { response: { neverError: true } } }
    }
  };

  wf.nodes.push(newSheetsNode);
  wf.nodes.push(newTransformNode);
  wf.nodes.push(newSupabaseNode);

  // Add connections
  const srcConn = wf.connections['Mapear Pedidos & Demanda'];
  if (!srcConn) {
    wf.connections['Mapear Pedidos & Demanda'] = { main: [[{ node: newSheetsNode.name, type: 'main', index: 0 }]] };
  } else {
    if (!srcConn.main) srcConn.main = [[]];
    if (!srcConn.main[0]) srcConn.main[0] = [];
    srcConn.main[0].push({ node: newSheetsNode.name, type: 'main', index: 0 });
  }
  wf.connections[newSheetsNode.name] = { main: [[{ node: newTransformNode.name, type: 'main', index: 0 }]] };
  wf.connections[newTransformNode.name] = { main: [[{ node: newSupabaseNode.name, type: 'main', index: 0 }]] };

  console.log('Actualizando workflow en n8n...');
  const result = await apiRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: wf.settings?.executionOrder || 'v1',
      saveDataSuccessExecution: wf.settings?.saveDataSuccessExecution || 'all',
      saveExecutionProgress: wf.settings?.saveExecutionProgress !== false,
      saveManualExecutions: wf.settings?.saveManualExecutions !== false
    },
    staticData: wf.staticData || null
  });

  if (result.id) {
    console.log(`✅ ¡Nodo "Pedidos Detalles" agregado exitosamente!`);
    console.log(`   Nodos totales: ${result.nodes?.length}`);
    console.log(`   Flujo: Mapear Pedidos & Demanda → Google Sheets: Pedidos Detalles → Mapear Detalles de Pedidos → Supabase: Pedidos Detalles`);
  } else {
    console.log('❌ Error:', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
