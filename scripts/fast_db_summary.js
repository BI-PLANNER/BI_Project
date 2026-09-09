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

const TABLES = [
  'empresas',
  'tipos_institucion',
  'clientes',
  'areas',
  'personas',
  'roles',
  'estatus',
  'users',
  'marcas',
  'productos_equipo',
  'procesos',
  'tipos_dependiente',
  'ubicaciones',
  'situaciones',
  'licitaciones_ofertas',
  'ofertas_items',
  'entregas_programadas',
  'contratos',
  'contrato_procesos',
  'asignaciones_proceso',
  'incidencias_seguimiento'
];

async function run() {
  console.log('--- RESUMEN RÁPIDO DE TODAS LAS TABLAS ---');
  const cutoff = '2026-09-02T00:00:00.000Z'; // 1 semana atrás

  for (const t of TABLES) {
    try {
      const { data, count, error } = await supabase
        .from(t)
        .select('*', { count: 'exact' })
        .limit(10);

      if (error) {
        console.log(`❌ ${t}: Error -> ${error.message}`);
        continue;
      }

      // Check fields in first row
      const firstRow = data && data[0] ? data[0] : null;
      let dateField = null;
      if (firstRow) {
        for (const k of Object.keys(firstRow)) {
          if (k.includes('cread') || k.includes('created') || k.includes('fecha') || k.includes('updated')) {
            dateField = k;
            break;
          }
        }
      }

      let recentCount = 0;
      if (dateField) {
        const { count: rc } = await supabase
          .from(t)
          .select('*', { count: 'exact', head: true })
          .gte(dateField, cutoff);
        recentCount = rc || 0;
      }

      console.log(`📊 ${t.padEnd(25)} | Total: ${String(count).padStart(5)} | Nuevos/Modif (>= 2 sep): ${String(recentCount).padStart(5)} (campo: ${dateField || 'ninguno'})`);
    } catch (e) {
      console.log(`⚠️ ${t}: Exception -> ${e.message}`);
    }
  }

  // Also check auth users
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
  const recentAuth = authUsers.filter(u => new Date(u.created_at) >= new Date(cutoff));
  console.log(`\n🔐 Supabase Auth Users     | Total: ${String(authUsers.length).padStart(5)} | Nuevos (>= 2 sep): ${String(recentAuth.length).padStart(5)}`);
  console.log('Usuarios Auth Recientes:', recentAuth.map(u => ({ email: u.email, created_at: u.created_at })));
}

run();
