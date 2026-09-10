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

async function testInsertLicitacion() {
  const testRow = {
    numero_oferta: 'LC26DM0076-TEST',
    nombre_oferta: 'ADQUISICIÓN DE REACTIVOS DE LABORATORIO CLÍNICO ISSS 2026',
    empresa_id: 1,
    cliente_id: 13, // ISSS
    fecha_presentacion: '2026-03-01',
    estatus_id: 5,
    persona_id: 1,
    observaciones: 'TIPO DE PROCESO: LICITACION COMPETITIVA | Fuente: Excel 365 SharePoint'
  };

  console.log('Insertando fila de prueba en licitaciones_ofertas...');
  const { data, error } = await supabase.from('licitaciones_ofertas').upsert(testRow, { onConflict: 'numero_oferta' }).select();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Éxito al insertar/upsert:', data);
    
    // Clean up test row
    await supabase.from('licitaciones_ofertas').delete().eq('numero_oferta', 'LC26DM0076-TEST');
    console.log('🧹 Registro de prueba limpiado.');
  }
}

testInsertLicitacion();
