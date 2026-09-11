const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testVercelSync() {
  const sampleLicitaciones = [
    {
      "anio": "2026",
      "mes": "MARZO",
      "empresa": "LAB&MED",
      "institucion": "ISSS",
      "cliente": "INSTITUTO SALVADOREÑO DEL SEGURO SOCIAL",
      "tipo_proceso": "LICITACION COMPETITIVA",
      "no_oferta": "LC26DM0050",
      "nombre_oferta": "SUMINISTRO DE REACTIVOS DE LABORATORIO CLÍNICO ISSS 2026",
      "presentacion": "Oferta Técnica y Económica"
    },
    {
      "anio": "2026",
      "mes": "MARZO",
      "empresa": "LAB&MED",
      "institucion": "ISSS",
      "cliente": "INSTITUTO SALVADOREÑO DEL SEGURO SOCIAL",
      "tipo_proceso": "LICITACION COMPETITIVA",
      "no_oferta": "LC26DM0076",
      "nombre_oferta": "ADQUISICIÓN DE REACTIVOS DE LABORATORIO CLÍNICO ISSS",
      "presentacion": "Muestras Entregadas"
    },
    {
      "anio": "2026",
      "mes": "MARZO",
      "empresa": "LAB&MED",
      "institucion": "MINSAL",
      "cliente": "HOSPITAL NACIONAL EDMUNDO VASQUEZ DE CHALATENANGO",
      "tipo_proceso": "SUBASTA ELECTRONICA INVERSA",
      "no_oferta": "SIE No. 01-2026",
      "nombre_oferta": "COMPRA DE REACTIVOS DE LABORATORIO CHALATENANGO",
      "presentacion": "Adjudicación en Firme"
    },
    {
      "anio": "2026",
      "mes": "ABRIL",
      "empresa": "LAB&MED",
      "institucion": "ISSS",
      "cliente": "INSTITUTO SALVADOREÑO DEL SEGURO SOCIAL",
      "tipo_proceso": "BAJA CUANTIA",
      "no_oferta": "BAJAS CUANTIA - DIAGNOSAL",
      "nombre_oferta": "BAJAS CUANTIA - DIAGNOSAL REACTIVOS",
      "presentacion": "Entrega Inmediata"
    }
  ];

  console.log('🚀 Enviando licitaciones a https://control-planner.vercel.app/api/db ...');
  
  const postData = JSON.stringify({
    action: 'sync_excel_licitaciones',
    licitaciones: sampleLicitaciones
  });

  const req = https.request('https://control-planner.vercel.app/api/db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      console.log('Status HTTP:', res.statusCode);
      console.log('Respuesta del Servidor:', data);

      // Consultar Supabase
      const { data: rows, count } = await supabase.from('licitaciones_ofertas').select('*', { count: 'exact' });
      console.log(`\n🎉 FILAS GUARDADAS EN SUPABASE (licitaciones_ofertas): ${count}`);
      console.log(JSON.stringify(rows, null, 2));
    });
  });

  req.on('error', (err) => console.error(err));
  req.write(postData);
  req.end();
}

testVercelSync();
