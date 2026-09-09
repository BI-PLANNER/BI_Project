const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

async function list() {
  const req = https.request({
    hostname: N8N_HOST,
    port: 443,
    path: '/api/v1/workflows?limit=50',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      console.log('Workflows en n8n:');
      (json.data || []).forEach(w => {
        console.log(`- ID: ${w.id} | Activo: ${w.active} | Nombre: ${w.name}`);
      });
    });
  });
  req.end();
}

list();
