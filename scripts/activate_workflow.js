const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';

async function checkAndActivate() {
  const req = https.request({
    hostname: N8N_HOST,
    port: 443,
    path: `/api/v1/workflows/${WORKFLOW_ID}`,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', async () => {
      const wf = JSON.parse(d);
      console.log('Workflow Name:', wf.name);
      console.log('Active:', wf.active);
      if (!wf.active) {
        console.log('Activando workflow...');
        const actReq = https.request({
          hostname: N8N_HOST,
          port: 443,
          path: `/api/v1/workflows/${WORKFLOW_ID}/activate`,
          method: 'POST',
          headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        }, actRes => {
          let actData = '';
          actRes.on('data', c => actData += c);
          actRes.on('end', () => console.log('Activación:', actRes.statusCode, actData));
        });
        actReq.end();
      }
    });
  });
  req.end();
}

checkAndActivate();
