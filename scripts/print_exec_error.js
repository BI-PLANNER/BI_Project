const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

async function getExecError() {
  return new Promise((resolve) => {
    https.request({
      hostname: N8N_HOST,
      port: 443,
      path: `/api/v1/executions/993?includeData=true`,
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
          const json = JSON.parse(data);
          const rd = json.data?.resultData;
          console.log('Error:', JSON.stringify(rd?.error, null, 2));
          console.log('Last Node:', rd?.lastNodeExecuted);
          resolve();
        } catch (e) {
          console.log(e);
        }
      });
    }).end();
  });
}

getExecError();
