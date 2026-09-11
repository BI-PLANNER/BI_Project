const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

async function run() {
  const req = https.request({
    hostname: N8N_HOST,
    port: 443,
    path: `/api/v1/executions?limit=3`,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const parsed = JSON.parse(d);
      console.log('Ultimas ejecuciones:', JSON.stringify(parsed.data?.map(e => ({ id: e.id, status: e.status, startedAt: e.startedAt, stoppedAt: e.stoppedAt })), null, 2));
    });
  });
  req.end();
}

run();
