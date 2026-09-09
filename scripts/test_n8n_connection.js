const https = require('https');

async function testEndpoint(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.slice(0, 1000)
        });
      });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('--- Probando Webhook n8n ---');
  const r1 = await testEndpoint('https://n8n.cyberedu.my/webhook/sync-sheets-supabase', { method: 'GET' });
  console.log('Webhook GET Result:', JSON.stringify(r1, null, 2));

  console.log('\n--- Probando API REST n8n (/api/v1/workflows) ---');
  const r2 = await testEndpoint('https://n8n.cyberedu.my/api/v1/workflows', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  console.log('API /api/v1/workflows:', JSON.stringify(r2, null, 2));
}

run();
