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
    path: `/api/v1/workflows/e1Yt2LjWn33U6eZv`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync('scripts/data_bi_sheets_current.json', data);
      console.log('Descargado workflow actual Data_BI_SHEETS a scripts/data_bi_sheets_current.json');
    });
  });
  req.end();
}

run();
