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

async function inspectColumns() {
  const tables = ['licitaciones_ofertas', 'ofertas_items', 'procesos', 'contrato_procesos', 'empresas', 'tipos_institucion'];
  
  for (const t of tables) {
    // Try inserting an empty object to trigger a schema/column error that reveals all columns
    const { error } = await supabase.from(t).insert({});
    console.log(`\n================== ${t} ==================`);
    if (error) {
      console.log('Insert response message:', error.message, error.details, error.hint);
    }
  }
}

inspectColumns();
