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

async function run() {
  const { data: con, error } = await supabase.from('contratos').select('*');
  console.log('Total contratos en DB:', con?.length);
  con?.forEach(c => {
    console.log(`- [${c.contrato_id}] ${c.numero_contrato} | ${c.nombre_contrato} | Cliente: ${c.cliente_id}`);
  });
}

run();
