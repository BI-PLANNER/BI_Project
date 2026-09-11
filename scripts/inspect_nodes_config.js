const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';

async function run() {
  const options = {
    hostname: N8N_HOST,
    port: 443,
    path: `/api/v1/workflows/${WORKFLOW_ID}`,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  };
  const req = https.request(options, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const wf = JSON.parse(d);
      const syncNode = wf.nodes.find(n => n.name.includes('Licitaciones & Ofertas'));
      console.log('--- SYNC NODE ---');
      console.log(JSON.stringify(syncNode?.parameters, null, 2));
      const mapNode = wf.nodes.find(n => n.name.includes('Mapear Licitaciones'));
      console.log('--- MAP NODE ---');
      console.log(JSON.stringify(mapNode?.parameters, null, 2));
    });
  });
  req.end();
}

run();
