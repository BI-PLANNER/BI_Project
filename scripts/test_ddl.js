const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testColumns() {
  const cols = [
    'observaciones',
    'marca',
    'estatus_item',
    'precio_adjudicado',
    'empresa_adjudicada',
    'fecha_adjudicacion',
    'costo_prueba_lm',
    'razon',
    'no_contrato'
  ];

  const { data: lic } = await supabase.from('licitaciones_ofertas').select('licitacion_oferta_id').limit(1).single();

  for (const colName of cols) {
    const testRow = {
      licitacion_oferta_id: lic.licitacion_oferta_id,
      renglon_numero: 9999,
      cantidad: 1,
      precio_unitario: 1,
      [colName]: colName === 'precio_adjudicado' || colName === 'costo_prueba_lm' ? 1.5 : (colName === 'fecha_adjudicacion' ? '2026-01-01' : 'Test')
    };

    const { data, error } = await supabase.from('ofertas_items').insert(testRow).select();
    if (error) {
      console.log(`❌ Columna '${colName}': NO existe (${error.message})`);
    } else {
      console.log(`✅ Columna '${colName}': ¡EXISTE EN SUPABASE!`);
      if (data && data[0]) {
        await supabase.from('ofertas_items').delete().eq('oferta_item_id', data[0].oferta_item_id);
      }
    }
  }
}

testColumns();
