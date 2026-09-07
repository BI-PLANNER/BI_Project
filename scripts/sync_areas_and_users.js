const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val.trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('--- ACTUALIZANDO ÁREAS, PERSONAS Y USUARIOS ---');

  // 1. Insertar a EDGAR FIGUERO en la tabla USERS
  const { data: existingUser } = await supabase.from('users').select('id').eq('email', 'edgar.figueroa@lm-sv.com').single();
  if (!existingUser) {
    const { data: newUser, error: userErr } = await supabase.from('users').insert({
      email: 'edgar.figueroa@lm-sv.com',
      nombre: 'Edgar',
      apellido: 'Figueroa',
      departamento: 'Aplicaciones',
      activo: true
    }).select('*');
    if (userErr) console.error('Error insertando user Edgar Figuero:', userErr);
    else console.log('✅ Usuario Edgar Figuero insertado con éxito en tabla users:', newUser);
  } else {
    console.log('ℹ️ Usuario Edgar Figuero ya existe en tabla users.');
  }

  // 2. Insertar Áreas Oficiales del Kardex
  const exactAreas = ['LOGISTICA', 'APLICACIONES', 'PM', 'GI', 'SOPORTE', 'IT', 'LICITACIONES'];
  const areasMap = {};
  for (const a of exactAreas) {
    let { data: area } = await supabase.from('areas').select('area_id').eq('nombre_area', a).single();
    if (!area) {
      const { data: newArea, error: aErr } = await supabase.from('areas').insert({
        nombre_area: a,
        descripcion: `Área operativa ${a}`,
        activo: true
      }).select('area_id').single();
      if (aErr) console.error('Error insert area:', a, aErr);
      area = newArea;
    }
    if (area) areasMap[a] = area.area_id;
  }
  console.log('✅ Áreas mapeadas:', areasMap);

  // 3. Actualizar Personas con su Área Correcta
  const personas = [
    { nombre: 'DIEGO POLANCO', email: 'diego.polanco@lm-sv.com', area: 'LOGISTICA' },
    { nombre: 'JUAN JOSE', email: 'juan.jose@lm-sv.com', area: 'PM' },
    { nombre: 'EDGAR FIGUEROA', email: 'edgar.figueroa@lm-sv.com', area: 'APLICACIONES' },
    { nombre: 'EDGAR FIGUERO', email: 'edgar.figueroa@lm-sv.com', area: 'APLICACIONES' },
    { nombre: 'JULIO CESAR', email: 'julio.cesar@lm-sv.com', area: 'PM' },
    { nombre: 'LUIS ORELLANA', email: 'luis.orellana@lm-sv.com', area: 'GI' },
    { nombre: 'MOISES HERNANDEZ', email: 'moises.hernandez@lm-sv.com', area: 'SOPORTE' },
    { nombre: 'RICARDO VILLANUEVA', email: 'ricardo.villanueva@lm-sv.com', area: 'IT' },
    { nombre: 'ROBERTO BATRES', email: 'roberto.batres@lm-sv.com', area: 'LICITACIONES' },
    { nombre: 'ROBERTO BATRES / KAREN', email: 'roberto.batres@lm-sv.com', area: 'LICITACIONES' },
    { nombre: 'ROBERTO BATRES / EDGAR FIGUEROA', email: 'roberto.batres@lm-sv.com', area: 'LICITACIONES' },
    { nombre: 'DIEGO POLANCO / JUAN JOSE', email: 'diego.polanco@lm-sv.com', area: 'LOGISTICA' }
  ];

  for (const p of personas) {
    const areaId = areasMap[p.area];
    if (areaId) {
      await supabase.from('personas').upsert({
        nombre_completo: p.nombre,
        email: p.email,
        area_id: areaId,
        activo: true
      }, { onConflict: 'nombre_completo' });
    }
  }
  console.log('✅ Personas y áreas sincronizadas correctamente.');
}

run().catch(console.error);
