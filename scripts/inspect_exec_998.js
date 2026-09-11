const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

async function getExecDetail(id) {
  return new Promise((resolve) => {
    https.request({
      hostname: N8N_HOST,
      port: 443,
      path: `/api/v1/executions/${id}?includeData=true`,
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
  const detail = await getExecDetail(998);
  const runData = detail.data?.resultData?.runData || {};
  const syncNode = runData['Sincronizar Supabase: Licitaciones & Ofertas'];
  if (syncNode) {
    console.log('Sync node output in 998:', JSON.stringify(syncNode[0]?.data?.main?.[0]?.[0]?.json, null, 2));
  }
}

run();
