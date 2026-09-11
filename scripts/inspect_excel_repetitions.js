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

async function inspectRepetitions() {
  const detail = await getExecDetail(1002);
  const excelNode = detail.data?.resultData?.runData?.['Microsoft Excel 365: REPORTE DE LICITACIONES'];
  const rows = excelNode?.[0]?.data?.main?.[0]?.map(item => item.json) || [];

  console.log(`Total filas en el Excel crudo: ${rows.length}`);
  if (rows.length > 0) {
    console.log('\nColumnas presentes en el Excel crudo:');
    console.log(Object.keys(rows[0]));
  }

  // Agrupar filas por no_oferta
  const groups = {};
  for (const row of rows) {
    const ofertaKey = String(row['No. Oferta'] || row['No Oferta'] || row['Oferta'] || '').trim();
    if (!ofertaKey) continue;
    if (!groups[ofertaKey]) groups[ofertaKey] = [];
    groups[ofertaKey].push(row);
  }

  // Buscar ofertas con muchas repeticiones
  const sortedOffers = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  
  console.log('\n--- TOP 3 OFERTAS CON MÁS FILAS REPETIDAS ---');
  for (let i = 0; i < Math.min(3, sortedOffers.length); i++) {
    const [oferta, items] = sortedOffers[i];
    console.log(`\n======================================================`);
    console.log(`Oferta: "${oferta}" -> Total filas: ${items.length}`);
    console.log(`Cliente: ${items[0]['Cliente'] || items[0]['CLIENTE']}`);
    console.log('Muestra de las primeras 3 filas de esta oferta:');
    for (let j = 0; j < Math.min(3, items.length); j++) {
      console.log(`\n  Fila ${j + 1}:`);
      console.log(JSON.stringify(items[j], null, 2));
    }
  }
}

inspectRepetitions();
