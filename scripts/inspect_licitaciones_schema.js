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

async function inspectLicitacionesTables() {
  const tables = ['licitaciones_ofertas', 'ofertas_items', 'procesos', 'contratos', 'contrato_procesos', 'clientes'];
  for (const t of tables) {
    console.log(`\n================== TABLA: ${t} ==================`);
    const { data, count, error } = await supabase.from(t).select('*', { count: 'exact' }).limit(3);
    if (error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Total registros: ${count}`);
      if (data && data.length > 0) {
        console.log(`Campos disponibles:`, Object.keys(data[0]));
        console.log(`Ejemplo de fila 1:`, JSON.stringify(data[0], null, 2));
      } else {
        console.log('Tabla vacía. Intentando obtener columnas con RPC o insert dummy...');
      }
    }
  }
}

inspectLicitacionesTables();
