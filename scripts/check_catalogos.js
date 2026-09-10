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

async function checkCatalogos() {
  console.log('--- EMPRESAS ---');
  const emp = await supabase.from('empresas').select('*');
  console.log(emp.data);

  console.log('\n--- CLIENTES ---');
  const cli = await supabase.from('clientes').select('*');
  console.log(cli.data);

  console.log('\n--- ESTATUS ---');
  const est = await supabase.from('estatus').select('*');
  console.log(est.data);

  console.log('\n--- PERSONAS ---');
  const per = await supabase.from('personas').select('*');
  console.log(per.data);
}

checkCatalogos();
