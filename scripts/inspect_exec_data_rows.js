const fs = require('fs');
const https = require('https');

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

async function inspectRows() {
  const detail = await getExecDetail(1002);
  const mapNode = detail.data?.resultData?.runData?.['Mapear Licitaciones Excel 365 (3FN)'];
  const items = mapNode?.[0]?.data?.main?.[0]?.[0]?.json?.licitaciones || [];

  console.log(`Total licitaciones in exec 1002: ${items.length}`);
  console.log('Sample item 0 keys:', Object.keys(items[0] || {}));
  console.log('Sample item 0:', items[0]);
  console.log('Sample item 1:', items[1]);
  console.log('Sample item 5:', items[5]);

  // Check unique values of estatus_item, producto, precio_unitario
  const statuses = new Set();
  items.forEach(i => statuses.add(i.estatus_item));
  console.log('Unique estatus_item values in n8n:', Array.from(statuses));
}

inspectRows();
