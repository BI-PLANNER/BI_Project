const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function test() {
  const { data: d1, error: e1 } = await supabase.from('incidencias_seguimiento').select('incidencia_id');
  console.log('incidencias_seguimiento:', d1 ? d1.length : e1);

  const { data: d2, error: e2 } = await supabase.from('sync_excel_licitaciones').select('*');
  console.log('sync_excel_licitaciones:', d2 ? d2.length : e2);

  const { data: d3, error: e3 } = await supabase.from('licitaciones_ofertas').select('*');
  console.log('licitaciones_ofertas:', d3 ? d3.length : e3);
}

test();
