const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const MASTER_LICITACIONES_PENDIENTES = [
  {
    cliente: 'HOSPITAL BLOOM',
    numero_contrato: 'N° 68/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'Sistema informatico SIS',
    area: 'IT',
    responsable: 'RICARDO VILLANUEVA',
    responsableEmail: 'ricardo.villanueva@lm-sv.com',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'MINSAL no comparte la prueeba...',
    estatus: 'Rojo'
  },
  // I will just read them from the page.tsx file directly using a regex/eval or just parse them out!
];

async function migrate() {
  const data = JSON.parse(fs.readFileSync('scripts/master.json', 'utf8'));

  console.log(`Encontradas ${data.length} tareas. Comenzando migración...`);

  // Obtener catálogos
  const { data: clientes } = await supabase.from('clientes').select('cliente_id, nombre_cliente');
  const { data: contratos } = await supabase.from('contratos').select('contrato_id, numero_contrato');
  const { data: estatus } = await supabase.from('estatus').select('estatus_id, nombre_estatus');
  const { data: situaciones } = await supabase.from('situaciones').select('situacion_id, nombre_situacion');
  const { data: personas } = await supabase.from('personas').select('persona_id, nombre_completo, area_id');
  const { data: areas } = await supabase.from('areas').select('area_id, nombre_area');

  const getOrCreate = async (table, field, value, extra = {}) => {
    if (!value) return null;
    const existing = await supabase.from(table).select('*').ilike(field, value).limit(1);
    if (existing.data && existing.data.length > 0) return existing.data[0][table.slice(0, -1) + '_id'] || existing.data[0][table === 'estatus' ? 'estatus_id' : ''];
    
    const { data: inserted } = await supabase.from(table).insert({ [field]: value, ...extra }).select();
    if (inserted && inserted.length > 0) return inserted[0][table.slice(0, -1) + '_id'] || inserted[0][table === 'estatus' ? 'estatus_id' : ''];
    return null;
  };

  const getOrCreateArea = async (value) => {
    if (!value) return null;
    const existing = areas.find(a => a.nombre_area.toLowerCase() === value.toLowerCase());
    if (existing) return existing.area_id;
    const { data: inserted } = await supabase.from('areas').insert({ nombre_area: value }).select();
    return inserted ? inserted[0].area_id : null;
  };

  const getOrCreatePersona = async (nombre, email, area_id) => {
    if (!nombre) return null;
    const existing = personas.find(p => p.nombre_completo.toLowerCase() === nombre.toLowerCase());
    if (existing) return existing.persona_id;
    const { data: inserted } = await supabase.from('personas').insert({ nombre_completo: nombre, email: email, area_id }).select();
    return inserted ? inserted[0].persona_id : null;
  };

  for (const item of data) {
    const cliente_id = await getOrCreate('clientes', 'nombre_cliente', item.cliente, { activo: true });
    
    // Contratos
    let contrato_id = null;
    if (item.numero_contrato) {
      const existingC = contratos.find(c => c.numero_contrato === item.numero_contrato);
      if (existingC) contrato_id = existingC.contrato_id;
      else {
        const { data: insC } = await supabase.from('contratos').insert({ numero_contrato: item.numero_contrato, cliente_id }).select();
        if (insC) contrato_id = insC[0].contrato_id;
      }
    }

    const estatus_id = await getOrCreate('estatus', 'nombre_estatus', item.estatus);
    const situacion_id = await getOrCreate('situaciones', 'nombre_situacion', item.situacion);
    
    const area_id = await getOrCreateArea(item.area);
    const persona_id = await getOrCreatePersona(item.responsable, item.responsableEmail, area_id);

    const payload = {
      cliente_id,
      contrato_id,
      estatus_id,
      situacion_id,
      persona_id,
      fecha_cumplimiento: item.fecha_cumplimiento || null,
      comentario: item.comentario || ''
    };

    // check if exists
    const { data: existInc } = await supabase.from('incidencias_seguimiento').select('incidencia_id').eq('comentario', item.comentario).limit(1);
    if (!existInc || existInc.length === 0) {
      await supabase.from('incidencias_seguimiento').insert(payload);
      console.log(`Insertado: ${item.situacion}`);
    } else {
      console.log(`Ya existe: ${item.situacion}`);
    }
  }

  console.log("Migración completada.");
}

migrate();
