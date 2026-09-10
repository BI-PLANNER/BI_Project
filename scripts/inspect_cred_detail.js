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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).end();
  });
}

async function run() {
  const cred = await n8nRequest('/api/v1/credentials/v8LmpDEejUNLVHGA');
  console.log('Credencial en n8n:', JSON.stringify(cred, null, 2));
}

run();
