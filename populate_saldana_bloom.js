const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateSaldanaAndBloom() {
  console.log('--- Poblando numerales para Hospital Saldaña y Hospital Bloom ---');

  // Buscar usuarios
  const { data: dbUsers } = await supabase.from('users').select('id, nombre, apellido, email');
  const userMap = {};
  dbUsers.forEach(u => {
    userMap[u.nombre.toUpperCase()] = u.id;
    if (u.apellido) userMap[`${u.nombre} ${u.apellido}`.toUpperCase()] = u.id;
  });

  const juanJose = userMap['JUAN JOSÉ RIVAS'] || userMap['JUAN JOSE'] || dbUsers[0].id;
  const moises = userMap['MOISÉS HERNÁNDEZ'] || userMap['MOISES'] || dbUsers[0].id;
  const edgar = userMap['EDGAR MARTÍNEZ'] || userMap['EDGAR'] || dbUsers[0].id;
  const juancarlos = userMap['JUAN CARLOS PINEDA'] || userMap['JUAN CARLOS'] || dbUsers[0].id;
  const marisela = userMap['MARISELA SÁNCHEZ'] || userMap['MARISELA'] || dbUsers[0].id;
  const it = userMap['COORDINADOR IT'] || dbUsers[0].id;
  const planner = userMap['JOSÉ LENNY GÓMEZ HENRÍQUEZ'] || userMap['JOSE LENNY'] || dbUsers[0].id;

  // Proyectos
  const { data: dbProjects } = await supabase.from('projects').select('id, contrato_num');
  const projMap = {};
  dbProjects.forEach(p => { projMap[p.contrato_num] = p.id; });

  const saldanaId = projMap['CT-110/2026'];
  const bloomId = projMap['N° 68/2026'];

  if (saldanaId) {
    const saldanaMilestones = [
      { proyecto_id: saldanaId, numeral: '1', descripcion: 'VALIDACIÓN DE SISTEMA E INTERFAZ LIS DE RESPALDO', ejecutor_id: juanJose, supervisor_id: planner, porcentaje: 30, estado: 'Pendiente', comentarios: 'Pendiente nota de administradora de contrato sobre interfaz' },
      { proyecto_id: saldanaId, numeral: '2', descripcion: 'ABASTECIMIENTO Y ENTREGA DE REACTIVOS DE LABORATORIO', ejecutor_id: juancarlos, supervisor_id: planner, porcentaje: 60, estado: 'En Progreso', comentarios: 'Entregas programadas en bodega hospitalaria' },
      { proyecto_id: saldanaId, numeral: '3', descripcion: 'CALENDARIZACIÓN DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO', ejecutor_id: moises, supervisor_id: planner, porcentaje: 100, estado: 'Completado', comentarios: 'Calendario colocado en área técnica' },
      { proyecto_id: saldanaId, numeral: '4', descripcion: 'CAPACITACIÓN Y MANUALES OPERATIVOS CON LISTADO DE FIRMAS', ejecutor_id: edgar, supervisor_id: planner, porcentaje: 50, estado: 'En Progreso', comentarios: 'Capacitación en desarrollo con personal de turno' },
    ];
    await supabase.from('milestones_contrato').insert(saldanaMilestones);
    console.log('✓ 4 Numerales insertados para Hospital Saldaña');
  }

  if (bloomId) {
    const bloomMilestones = [
      { proyecto_id: bloomId, numeral: '1', descripcion: 'PEDIDO DEL PRODUCTO Y GESTIÓN CON FABRICANTE', ejecutor_id: juanJose, supervisor_id: planner, porcentaje: 100, estado: 'Completado', comentarios: 'Pedido colocado' },
      { proyecto_id: bloomId, numeral: '2', descripcion: 'CONTROLES Y CONSUMIBLES CHORUS EVO', ejecutor_id: juanJose, supervisor_id: planner, porcentaje: 100, estado: 'Completado', comentarios: 'Lotes reservados' },
      { proyecto_id: bloomId, numeral: '3', descripcion: 'IMPORTACIÓN Y TRÁMITES ADUANALES', ejecutor_id: marisela, supervisor_id: planner, porcentaje: 80, estado: 'En Progreso', comentarios: 'En proceso de desaduanaje' },
      { proyecto_id: bloomId, numeral: '4', descripcion: 'GARANTÍA DE REPOSICIÓN DE REACTIVOS', ejecutor_id: juanJose, supervisor_id: planner, porcentaje: 100, estado: 'Completado', comentarios: 'Presentado en oferta' },
      { proyecto_id: bloomId, numeral: '5', descripcion: 'HOJAS DE SEGURIDAD Y FICHAS TÉCNICAS', ejecutor_id: edgar, supervisor_id: planner, porcentaje: 100, estado: 'Completado', comentarios: 'Entregadas' },
      { proyecto_id: bloomId, numeral: '6', descripcion: 'VERIFICACIÓN DE VENCIMIENTO DE REACTIVO >1 AÑO', ejecutor_id: juancarlos, supervisor_id: planner, porcentaje: 60, estado: 'En Progreso', comentarios: 'Seguimiento de lotes' },
      { proyecto_id: bloomId, numeral: '7', descripcion: 'INSTALACIÓN DE EQUIPO CHORUS EVO Y CALENDARIZACIÓN', ejecutor_id: moises, supervisor_id: planner, porcentaje: 40, estado: 'Pendiente', comentarios: 'Pendiente fecha fin de reactivo anterior' },
      { proyecto_id: bloomId, numeral: '8', descripcion: 'SISTEMA INFORMÁTICO SIS Y ENLACE MINSAL', ejecutor_id: it, supervisor_id: planner, porcentaje: 20, estado: 'Pendiente', comentarios: 'MINSAL no comparte prueba aún, coordinar con Juan José' },
      { proyecto_id: bloomId, numeral: '9', descripcion: 'METODOLOGÍA ELISA Y PROTOCOLOS PEDIÁTRICOS', ejecutor_id: edgar, supervisor_id: planner, porcentaje: 100, estado: 'Completado', comentarios: 'Validado' },
    ];
    await supabase.from('milestones_contrato').insert(bloomMilestones);
    console.log('✓ 9 Numerales insertados para Hospital Bloom');
  }
}

populateSaldanaAndBloom().catch(console.error);
