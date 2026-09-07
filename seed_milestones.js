const { createClient } = require('./node_modules/@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadMilestones() {
  console.log('--- Cargando numerales contractuales reales ---');
  const sqlContent = fs.readFileSync('../seed_data_real.sql', 'utf8');
  
  // Extract all INSERT INTO milestones_contrato statements
  const regex = /INSERT INTO milestones_contrato \(id, proyecto_id, numeral, descripcion, ejecutor_id, supervisor_id, estado, porcentaje, comentarios\)\s*VALUES\s*\(\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(NULL|'[^']*')\s*\)/g;
  
  let match;
  const milestones = [];
  while ((match = regex.exec(sqlContent)) !== null) {
    const rawComentario = match[9];
    const comentario = rawComentario === 'NULL' ? null : rawComentario.slice(1, -1).replace(/''/g, "'");
    milestones.push({
      id: match[1],
      proyecto_id: match[2],
      numeral: match[3].replace(/''/g, "'"),
      descripcion: match[4].replace(/''/g, "'"),
      ejecutor_id: match[5],
      supervisor_id: match[6],
      estado: match[7],
      porcentaje: parseInt(match[8]),
      comentarios: comentario
    });
  }

  console.log(`Encontrados ${milestones.length} numerales. Insertando en lotes...`);

  // Insert in batches of 40
  const batchSize = 40;
  for (let i = 0; i < milestones.length; i += batchSize) {
    const batch = milestones.slice(i, i + batchSize);
    const { error } = await supabase.from('milestones_contrato').upsert(batch, { onConflict: 'proyecto_id,numeral' });
    if (error) {
      console.error(`Error en lote ${i}:`, error.message);
    } else {
      console.log(`✓ Lote ${i + 1} a ${Math.min(i + batchSize, milestones.length)} insertado`);
    }
  }

  console.log('--- Numerales cargados exitosamente ---');
}

loadMilestones().catch(console.error);
