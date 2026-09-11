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
  const detail = await getExecDetail(997);
  console.log('Last node:', detail.data?.resultData?.lastNodeExecuted);
  console.log('Error:', JSON.stringify(detail.data?.resultData?.error, null, 2));
  const runData = detail.data?.resultData?.runData || {};
  console.log('Executed nodes:', Object.keys(runData));
  for (const node of Object.keys(runData)) {
    const nodeRuns = runData[node];
    console.log(`Node [${node}] runs:`, nodeRuns?.length);
    if (nodeRuns?.[0]?.error) {
      console.log(`  -> Error in [${node}]:`, JSON.stringify(nodeRuns[0].error, null, 2));
    }
  }
}

run();
