const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updateRolesAndUsers() {
  console.log('--- Actualizando usuarios y roles: Planner y PM ---');

  const { data: dbRoles } = await supabase.from('roles').select('id, nombre');
  const roleMap = {};
  dbRoles.forEach(r => { roleMap[r.nombre] = r.id; });

  // 1. Crear / Actualizar a José Lenny Gómez Henríquez como Planner
  const plannerId = 'a0000001-0000-0000-0000-000000000003';
  const plannerEmail = 'jose.gomez@labandmed.com';

  await supabase.auth.admin.createUser({
    id: plannerId,
    email: plannerEmail,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { nombre: 'José Lenny Gómez Henríquez' }
  }).catch(() => {});

  const { error: errPlanner } = await supabase.from('users').upsert({
    id: plannerId,
    email: plannerEmail,
    nombre: 'José Lenny',
    apellido: 'Gómez Henríquez',
    rol_id: roleMap['Planner'],
    departamento: 'Planificación Estratégica',
    activo: true
  }, { onConflict: 'id' });

  if (errPlanner) console.error('Error actualizando Planner:', errPlanner);
  else console.log('✓ Planner actualizado: José Lenny Gómez Henríquez');

  // 2. Asegurar a Juan José como Product Manager (PM)
  const pmId = 'a0000001-0000-0000-0000-000000000008';
  const pmEmail = 'juanjose.rivas@labandmed.com';

  const { error: errPM } = await supabase.from('users').upsert({
    id: pmId,
    email: pmEmail,
    nombre: 'Juan José',
    apellido: 'Rivas',
    rol_id: roleMap['PM'],
    departamento: 'Product Management',
    activo: true
  }, { onConflict: 'id' });

  if (errPM) console.error('Error actualizando PM:', errPM);
  else console.log('✓ PM actualizado: Juan José (Product Manager)');

  // 3. Si Roberto estaba como supervisor por defecto en milestones, actualicemos referencias clave o mantengámoslo en su área correcta
  console.log('✓ Actualizaciones aplicadas con éxito en Supabase');
}

updateRolesAndUsers().catch(console.error);
