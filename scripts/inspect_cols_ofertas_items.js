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

async function inspectCols() {
  // Test insert to trigger schema reflection error with all columns
  const { data, error } = await supabase.from('ofertas_items').insert({ dummy_col: 'test' });
  console.log('Error info:', error);

  // Intentar insert básico con licitacion_oferta_id
  const { data: lic } = await supabase.from('licitaciones_ofertas').select('licitacion_oferta_id').limit(1).single();
  console.log('Sample lic ID:', lic?.licitacion_oferta_id);
}

inspectCols();
