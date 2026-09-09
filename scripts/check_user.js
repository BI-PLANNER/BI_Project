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

async function main() {
  const { data: personas } = await supabase.from('personas').select('*');
  console.log('PERSONAS:', JSON.stringify(personas, null, 2));

  const { data: users } = await supabase.from('users').select('*');
  console.log('USERS TABLE:', JSON.stringify(users, null, 2));

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log('AUTH USERS:', JSON.stringify(authUsers?.users?.map(u => ({ id: u.id, email: u.email, user_metadata: u.user_metadata })), null, 2));
}

main();
