const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';

async function run() {
  const req = https.request({
    hostname: N8N_HOST,
    port: 443,
    path: `/api/v1/workflows/${WORKFLOW_ID}`,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const wf = JSON.parse(d);
      const excelNode = wf.nodes.find(n => n.name.includes('Microsoft Excel') || n.name.includes('LICITACIONES'));
      console.log('--- EXCEL NODE ---');
      console.log(JSON.stringify(excelNode, null, 2));
      const mapNode = wf.nodes.find(n => n.name.includes('Mapear Licitaciones'));
      console.log('--- MAP NODE ---');
      console.log(JSON.stringify(mapNode, null, 2));
      const httpNode = wf.nodes.find(n => n.name.includes('Sincronizar Supabase: Licitaciones'));
      console.log('--- HTTP NODE ---');
      console.log(JSON.stringify(httpNode, null, 2));
      console.log('--- WORKFLOW SETTINGS ---');
      console.log(JSON.stringify(wf.settings, null, 2));
    });
  });
  req.end();
}

run();
