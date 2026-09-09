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

async function inspectTableGrowth() {
  console.log('=== INVESTIGACIÓN DE INCREMENTO DE DATOS EN SUPABASE ===\n');
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 días atrás (~2026-09-02)
  const oneWeekIso = oneWeekAgo.toISOString();
  console.log(`Fecha actual de análisis: ${now.toISOString().split('T')[0]}`);
  console.log(`Punto de corte (semana pasada): >= ${oneWeekIso.split('T')[0]}\n`);

  const results = [];

  for (const table of TABLES) {
    try {
      // 1. Conteo total
      const { count: totalCount, error: countErr } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countErr) {
        results.push({ table, status: 'Error', error: countErr.message });
        continue;
      }

      // 2. Intentar buscar por campos de fecha: created_at, creado_en, fecha_creacion, etc.
      let newRecordsCount = 0;
      let timestampField = null;

      const dateFieldsToTest = ['created_at', 'creado_en', 'fecha_creacion', 'fecha_registro', 'updated_at'];
      for (const field of dateFieldsToTest) {
        const { count: newCount, error: dateErr } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .gte(field, oneWeekIso);

        if (!dateErr && newCount !== null) {
          newRecordsCount = newCount;
          timestampField = field;
          break;
        }
      }

      // 3. Obtener muestra de registros recientes si los hay
      let recentSample = [];
      if (timestampField) {
        const { data: samples } = await supabase
          .from(table)
          .select('*')
          .gte(timestampField, oneWeekIso)
          .order(timestampField, { ascending: false })
          .limit(3);
        recentSample = samples || [];
      } else {
        // Si no tiene campo de fecha conocido, traer los últimos 3 por id/creación
        const { data: samples } = await supabase.from(table).select('*').limit(3);
        recentSample = samples || [];
      }

      results.push({
        table,
        totalCount,
        newRecordsCount,
        timestampField,
        recentSample
      });
    } catch (err) {
      results.push({ table, status: 'Exception', error: err.message });
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

inspectTableGrowth();
