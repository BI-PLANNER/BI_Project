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

async function inspectSchema() {
  console.log('--- ESTRUCTURA DE TABLA: ofertas_items ---');
  // Intentar obtener las columnas mediante una inserción dummy que falle o mediante select
  const { data, error } = await supabase.from('ofertas_items').select('*').limit(1);
  console.log('Select ofertas_items:', { data, error });

  if (error) {
    console.error('Error al consultar ofertas_items:', error);
  }

  // Comprobar tabla productos_equipo y marcas
  const { data: marcas } = await supabase.from('marcas').select('marca_id, nombre_marca').limit(5);
  console.log('Marcas sample:', marcas);
  
  const { count: prodCount } = await supabase.from('productos_equipo').select('*', { count: 'exact', head: true });
  console.log('Total productos_equipo:', prodCount);
}

inspectSchema();
