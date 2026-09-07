const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updateRealUsersAndRACI() {
  console.log('--- Configurando Usuarios Reales y Matriz RACI en Supabase ---');

  const { data: dbRoles } = await supabase.from('roles').select('id, nombre');
  const roleMap = {};
  dbRoles.forEach(r => { roleMap[r.nombre] = r.id; });

  const realUsers = [
    {
      id: 'a0000001-0000-0000-0000-000000000001',
      nombre: 'Luis',
      apellido: 'Orellana',
      email: 'luis.orellana@labandmed.com',
      rol_id: roleMap['Gerente'],
      departamento: 'Gerencia General'
    },
    {
      id: 'a0000001-0000-0000-0000-000000000002',
      nombre: 'Roberto',
      apellido: 'Batres',
      email: 'roberto.batres@labandmed.com',
      rol_id: roleMap['Planner'],
      departamento: 'Planificación y Control'
    },
    {
      id: 'a0000001-0000-0000-0000-000000000003',
      nombre: 'Lenny',
      apellido: 'Gómez',
      email: 'lenny.gomez@labandmed.com',
      rol_id: roleMap['Planner'],
      departamento: 'Planificación Estratégica'
    },
    {
      id: 'a0000001-0000-0000-0000-000000000008',
      nombre: 'Juan José',
      apellido: 'Fuentes Rodríguez',
      email: 'juanjose.fuentes@labandmed.com',
      rol_id: roleMap['PM'],
      departamento: 'Gestión de Proyectos & Contratos'
    }
  ];

  for (const u of realUsers) {
    await supabase.auth.admin.createUser({
      id: u.id,
      email: u.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { nombre: `${u.nombre} ${u.apellido}` }
    }).catch(() => {});

    const { error } = await supabase.from('users').upsert({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      apellido: u.apellido,
      rol_id: u.rol_id,
      departamento: u.departamento,
      activo: true
    }, { onConflict: 'id' });

    if (error) console.error(`Error en usuario ${u.nombre}:`, error);
    else console.log(`✓ Usuario configurado: ${u.nombre} ${u.apellido} -> Rol: ${Object.keys(roleMap).find(k => roleMap[k] === u.rol_id)}`);
  }

  console.log('✓ Todos los usuarios reales y roles RACI actualizados.');
}

updateRealUsersAndRACI();
