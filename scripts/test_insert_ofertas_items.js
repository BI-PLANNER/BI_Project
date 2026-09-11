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

async function testInsert() {
  const { data: lic } = await supabase.from('licitaciones_ofertas').select('licitacion_oferta_id').limit(1).single();
  const { data: prod } = await supabase.from('productos_equipo').select('producto_equipo_id').limit(1).single();

  const testRow = {
    licitacion_oferta_id: lic.licitacion_oferta_id,
    producto_equipo_id: prod?.producto_equipo_id || null,
    renglon_numero: 1,
    cantidad: 500,
    precio_unitario: 1.5,
    es_adjudicado: true
  };

  const { data, error } = await supabase.from('ofertas_items').insert(testRow).select();
  console.log('Insert test result:', { data, error });

  if (data && data.length > 0) {
    // Delete the test row
    await supabase.from('ofertas_items').delete().eq('oferta_item_id', data[0].oferta_item_id);
    console.log('Deleted test row cleanly.');
  }
}

testInsert();
