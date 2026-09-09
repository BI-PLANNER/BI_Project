const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

async function getWorkflow(id) {
  return new Promise((resolve) => {
    https.request({
      hostname: N8N_HOST,
      port: 443,
      path: `/api/v1/workflows/${id}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).end();
  });
}

async function run() {
  const ids = ['e1Yt2LjWn33U6eZv', 'j9DQ27cvgY59pt0q', 'JWundMQ80BxAJ3Ys'];
  for (const id of ids) {
    const wf = await getWorkflow(id);
    console.log(`\n================== WORKFLOW: ${wf.name} (ID: ${wf.id}) ==================`);
    console.log(`Activo: ${wf.active}`);
    console.log('Nodos:');
    (wf.nodes || []).forEach(n => {
      console.log(`- Tipo: ${n.type} | Nombre: ${n.name} | Credentials: ${JSON.stringify(n.credentials || {})}`);
      if (n.type.includes('webhook')) {
        console.log(`  -> Webhook Path: ${n.parameters?.path || 'N/A'}`);
      }
      if (n.type.includes('googleSheets')) {
        console.log(`  -> Google Sheets Parameters:`, JSON.stringify(n.parameters || {}));
      }
    });
  }
}

run();
