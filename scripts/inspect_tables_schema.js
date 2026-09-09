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
  console.log('--- ESTRUCTURA DE TABLA: entregas_programadas ---');
  const { data, error } = await supabase.from('entregas_programadas').select('*').limit(1);
  console.log('entregas_programadas error/data:', error, data);

  console.log('\n--- ESTRUCTURA DE TABLA: incidencias_seguimiento ---');
  const { data: inc, error: incErr } = await supabase.from('incidencias_seguimiento').select('*').limit(1);
  console.log('incidencias_seguimiento error/data:', incErr, inc);
}

run();
