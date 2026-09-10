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
  const testPayload = {
    numero_contrato: 'TEST-2026-001',
    nombre_contrato: 'Contrato de Prueba Registro',
    cliente_id: 13,
    empresa_id: 1,
    monto_total: 50000,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  };

  const { data, error } = await supabase.from('contratos').insert(testPayload).select('*');
  console.log('Insert result:', { error, data });

  if (data && data.length > 0) {
    // Delete the test item
    const { error: delErr } = await supabase.from('contratos').delete().eq('contrato_id', data[0].contrato_id);
    console.log('Cleaned up test contract:', delErr ? delErr : 'OK');
  }
}

testInsert();
