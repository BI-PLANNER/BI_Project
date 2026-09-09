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

async function setupLuisOrellana() {
  const tempPassword = 'Password123!'; // Contraseña temporal estándar del sistema
  const email1 = 'lorellana@lm-sv.com';
  const email2 = 'luis.orellana@lm-sv.com';

  console.log('--- Configurando Luis Orellana ---');

  // 1. Listar usuarios auth existentes
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
  
  for (const email of [email1, email2]) {
    const existing = authUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      console.log(`Actualizando password y metadata para ${email} (ID: ${existing.id})...`);
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nombre: 'Luis',
          apellido: 'Orellana',
          departamento: 'Gerencia de Integración',
          email_verified: true,
          rol: 'Jefatura / Gerencia de Integración'
        }
      });
      if (error) console.error(`Error actualizando ${email}:`, error);
      else console.log(`✓ Auth usuario ${email} actualizado con éxito.`);
    } else {
      console.log(`Creando usuario auth para ${email}...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nombre: 'Luis',
          apellido: 'Orellana',
          departamento: 'Gerencia de Integración',
          email_verified: true,
          rol: 'Jefatura / Gerencia de Integración'
        }
      });
      if (error) console.error(`Error creando ${email}:`, error);
      else console.log(`✓ Auth usuario ${email} creado con éxito (ID: ${data.user.id}).`);
    }
  }

  // 2. Asegurar registro en tabla 'users'
  for (const email of [email1, email2]) {
    const { data: userRow } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
    if (userRow) {
      console.log(`Actualizando fila en tabla users para ${email}...`);
      await supabase.from('users').update({
        nombre: 'Luis',
        apellido: 'Orellana',
        departamento: 'Gerencia de Integración',
        activo: true
      }).eq('id', userRow.id);
    } else {
      const authU = (await supabase.auth.admin.listUsers()).data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (authU) {
        console.log(`Insertando fila en tabla users para ${email}...`);
        await supabase.from('users').insert({
          id: authU.id,
          email: email,
          nombre: 'Luis',
          apellido: 'Orellana',
          departamento: 'Gerencia de Integración',
          activo: true
        });
      }
    }
  }

  console.log('✓ Configuración de usuario Luis Orellana completada con éxito.');
}

setupLuisOrellana();
