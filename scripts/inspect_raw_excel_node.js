const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const N8N_API_KEY = env.N8N_API_KEY;
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

async function inspectRawExcelNode() {
  const detail = await getExecDetail(1002);
  const runData = detail.data?.resultData?.runData || {};
  // Check the node before mapping node
  const excelNode = runData['Microsoft Excel 365 (SharePoint Lab&Med)'] || runData['Obtener Excel Licitaciones SharePoint'];
  const firstItem = excelNode?.[0]?.data?.main?.[0]?.[0]?.json || {};
  console.log('RAW EXCEL NODE KEYS:', Object.keys(firstItem));
  console.log('RAW EXCEL ITEM 0:', firstItem);
}

inspectRawExcelNode();
