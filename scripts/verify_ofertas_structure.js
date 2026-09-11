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
    path: `/api/v1/executions/1002?includeData=true`,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const detail = JSON.parse(d);
      const mapNode = detail.data?.resultData?.runData?.['Mapear Licitaciones Excel 365 (3FN)'];
      const list = mapNode?.[0]?.data?.main?.[0]?.[0]?.json?.licitaciones || [];
      const uniqueOfertas = new Set(list.map(l => l.no_oferta.toLowerCase().trim()));
      console.log('Total filas leídas del Excel BD Oferta:', list.length);
      console.log('Total números de oferta únicos (cabeceras):', uniqueOfertas.size);

      // Conteo por cliente
      const clientCount = {};
      list.forEach(l => {
        clientCount[l.cliente] = (clientCount[l.cliente] || 0) + 1;
      });
      console.log('Distribución por cliente (top 5):', Object.entries(clientCount).sort((a,b) => b[1] - a[1]).slice(0, 5));
    });
  });
  req.end();
}

run();
