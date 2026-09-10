const https = require('https');

async function triggerWebhook() {
  console.log('🚀 Disparando Webhook n8n: https://n8n.cyberedu.my/webhook/sync-sheets-supabase ...');
  
  return new Promise((resolve) => {
    https.request('https://n8n.cyberedu.my/webhook/sync-sheets-supabase', {
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
          console.log('Response:', data.slice(0, 500));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    }).end();
  });
}

triggerWebhook();
