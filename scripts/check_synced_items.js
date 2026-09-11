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

async function checkSynced() {
  const { data: items } = await supabase.from('ofertas_items').select('*, producto:productos_equipo(nombre_producto_equipo, descripcion, marcas(nombre_marca))');
  console.log(`Total ofertas_items en DB: ${items?.length}`);

  let adjCount = 0;
  let nonAdjCount = 0;
  let totalPriceSum = 0;

  items?.slice(0, 10).forEach(i => {
    console.log(`Item #${i.renglon_numero}: Prod="${i.producto?.nombre_producto_equipo}", Marca="${i.producto?.marcas?.nombre_marca}", Cant=${i.cantidad}, Price=$${i.precio_unitario}, Adj=${i.es_adjudicado}`);
  });

  items?.forEach(i => {
    if (i.es_adjudicado) adjCount++;
    else nonAdjCount++;
    totalPriceSum += (Number(i.cantidad || 0) * Number(i.precio_unitario || 0));
  });

  console.log(`\nStats: Adjudicados=${adjCount}, No Adjudicados=${nonAdjCount}, Suma Total Ofertada=$${totalPriceSum.toFixed(2)}`);
}

checkSynced();
