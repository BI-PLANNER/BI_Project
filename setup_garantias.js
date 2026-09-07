const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupGarantiasTable() {
  console.log('--- Configurando tabla garantias y cargando datos ---');

  // Insertar contratos adicionales si no existen (ej. Hospital Saldaña, Hospital Bloom)
  const newProjects = [
    { id: 'b0000001-0000-0000-0000-000000000005', cliente: 'Hospital Saldaña', contrato_num: 'CT-110/2026', nombre: 'Suministro y Equipamiento de Laboratorio - Hospital Saldaña', estado: 'En Ejecucion', presupuesto: 145000.00 },
    { id: 'b0000001-0000-0000-0000-000000000006', cliente: 'Hospital Bloom', contrato_num: 'N° 68/2026', nombre: 'Equipo CHORUS EVO y Pruebas Rápidas - Hospital Bloom', estado: 'En Ejecucion', presupuesto: 210000.00 }
  ];

  for (const p of newProjects) {
    await supabase.from('projects').upsert(p, { onConflict: 'contrato_num' });
  }
  console.log('✓ Proyectos Hospital Saldaña y Bloom asegurados');

  // Garantías iniciales extraídas de los contratos
  const garantiasIniciales = [
    {
      proceso: 'Licitación Pública SM-022/2024',
      institucion: 'ISSS',
      contrato_num: 'SM-022/2024',
      calidad: 'Garantía de Fiel Cumplimiento y Calidad de Reactivo (Fianza Bancaria)',
      tipo_garantia: 'Fianza de Fiel Cumplimiento',
      monto: 45000.00,
      completado: true,
      notas: 'Fianza presentada y aprobada por la Unidad Financiera del ISSS'
    },
    {
      proceso: 'Contratación Directa CT No 16/2026',
      institucion: 'Hospital San Juan de Dios de Santa Ana',
      contrato_num: 'CT No 16/2026',
      calidad: 'Garantía de Reposición y Buen Funcionamiento Atellica CI',
      tipo_garantia: 'Fianza y Pagaré',
      monto: 28000.00,
      completado: true,
      notas: 'Pagaré y fianza de fiel cumplimiento entregados'
    },
    {
      proceso: 'Licitación 13-BS-2026',
      institucion: 'Hospital Militar Central',
      contrato_num: 'CT No 13-BS-2026',
      calidad: 'Garantía de Fábrica Autenticada EPOC / RapidPoint',
      tipo_garantia: 'Garantía de Fábrica',
      monto: 19500.00,
      completado: false,
      notas: 'Pendiente autenticación consular de carta de garantía de fábrica'
    },
    {
      proceso: 'Proceso AD-014/2026-ISBM',
      institucion: 'ISBM',
      contrato_num: 'CT No AD-014/2026-ISBM',
      calidad: 'Garantía de Reposición de Reactivos >18 meses',
      tipo_garantia: 'Carta Compromiso / Fianza',
      monto: 16000.00,
      completado: false,
      notas: 'Solicitado a fábrica EXIAS, pendiente entrega de documentos'
    },
    {
      proceso: 'Licitación Pública N° 68/2026',
      institucion: 'Hospital Bloom',
      contrato_num: 'N° 68/2026',
      calidad: 'Garantía de Reposición de Reactivos y Calidad Metodología Elisa',
      tipo_garantia: 'Fianza de Cumplimiento',
      monto: 21000.00,
      completado: false,
      notas: 'Presentado en oferta, pendiente formalización de contrato'
    },
    {
      proceso: 'Contrato CT-110/2026',
      institucion: 'Hospital Saldaña',
      contrato_num: 'CT-110/2026',
      calidad: 'Garantía Técnica y Soporte de Interfaz LIS',
      tipo_garantia: 'Garantía Técnica',
      monto: 14500.00,
      completado: false,
      notas: 'Pendiente confirmación de interfaz con administradora de contrato'
    }
  ];

  // Crear o poblar tabla garantias
  // Primero intentemos crear la tabla vía SQL si existe la función o insertemos
  const { error: insErr } = await supabase.from('garantias').upsert(garantiasIniciales, { onConflict: 'contrato_num,calidad' });
  if (insErr) {
    console.log('Nota sobre tabla garantias:', insErr.message);
  } else {
    console.log('✓ Garantías iniciales cargadas');
  }

  // Cargar las 34 tareas completas de Fase 2 en kardex_pendientes
  console.log('--- Cargando tareas de Kardex de Fase 2 ---');
  const { data: dbUsers } = await supabase.from('users').select('id, nombre, apellido');
  const userMap = {};
  dbUsers.forEach(u => {
    userMap[u.nombre.toUpperCase()] = u.id;
    if (u.apellido) userMap[`${u.nombre} ${u.apellido}`.toUpperCase()] = u.id;
  });

  const { data: dbProjects } = await supabase.from('projects').select('id, contrato_num, cliente');
  const projMap = {};
  dbProjects.forEach(p => {
    projMap[p.contrato_num] = p.id;
    projMap[p.cliente.toUpperCase()] = p.id;
  });

  const kardexFase2 = [
    { cli: 'ISSS', cnum: 'SM-022/2024', desc: 'Sistema Informático: Instalación de antivirus en PCs de laboratorio', resp: 'Coordinador IT', fecha: '2026-09-08', prio: 'Alta', sem: 'Verde', notas: 'Pendiente compra de licencias de antivirus' },
    { cli: 'ISBM', cnum: 'CT No AD-014/2026-ISBM', desc: 'Garantía de Fábrica Autenticado EXIAS', resp: 'Julio César', fecha: '2026-09-02', prio: 'Urgente', sem: 'Rojo', notas: 'Solicitado a fábrica, pendiente entrega de garantías consulares' },
    { cli: 'ISBM', cnum: 'CT No AD-014/2026-ISBM', desc: 'Controles de 3era Opinión Bio-Rad', resp: 'Julio César', fecha: '2026-09-03', prio: 'Urgente', sem: 'Rojo', notas: 'Controles cotizados y comprados, fabricante entrega a más tardar' },
    { cli: 'ISBM', cnum: 'CT No AD-014/2026-ISBM', desc: 'Carta de Autorización del Fabricante EXIAS', resp: 'Julio César', fecha: '2026-09-04', prio: 'Urgente', sem: 'Rojo', notas: 'Solicitada nueva carta a EXIAS con traducción legal' },
    { cli: 'ISBM', cnum: 'CT No AD-014/2026-ISBM', desc: 'Fundamento de la Prueba con Rangos de Referencia', resp: 'Edgar Martínez', fecha: '2026-09-10', prio: 'Media', sem: 'Anaranjado', notas: 'Pendiente elaboración de documento firmado por aplicaciones' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Controles 3era Opinión - Química Emergencia y Hosp.', resp: 'Juan José Rivas', fecha: '2026-09-09', prio: 'Alta', sem: 'Anaranjado', notas: 'Para química de emergencia y hospitalización' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Reporte de Desechos Generados Atellica CI', resp: 'Julio César', fecha: '2026-09-01', prio: 'Urgente', sem: 'Rojo', notas: 'Pendiente entrega de especificaciones por fabricante' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Certificado de Manufactura de Equipos', resp: 'Julio César', fecha: '2026-09-01', prio: 'Urgente', sem: 'Rojo', notas: 'Pendiente entrega de fábrica' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Adecuación Roto Motor y Tanque Rotoplas', resp: 'Moisés Hernández', fecha: '2026-09-15', prio: 'Alta', sem: 'Verde', notas: 'Proveedor programó visita técnica de instalación' },
    { cli: 'Hospital Saldaña', cnum: 'CT-110/2026', desc: 'Validación de Sistema e Interfaz LIS de Respaldo', resp: 'Juan José Rivas', fecha: '2026-09-03', prio: 'Urgente', sem: 'Rojo', notas: 'Pendiente nota oficial de administradora de contrato' },
    { cli: 'Hospital Militar', cnum: 'CT No 13-BS-2026', desc: 'Inscripción Control de Calidad 3era Opinión Immulite/F200', resp: 'Juan José Rivas', fecha: '2026-09-08', prio: 'Alta', sem: 'Anaranjado', notas: 'Controles cotizados para Immulite 2000 XPi y F200' },
    { cli: 'Hospital Militar', cnum: 'CT No 13-BS-2026', desc: 'Instalación y Puesta en Marcha RapidPoint 500e', resp: 'Juan José Rivas', fecha: '2026-09-08', prio: 'Alta', sem: 'Anaranjado', notas: 'Pendiente coordinar fecha de instalación con administrador' },
    { cli: 'Hospital Militar', cnum: 'CT No 13-BS-2026', desc: 'Mesa Especial y Respaldo Eléctrico para Gases Arteriales', resp: 'Moisés Hernández', fecha: '2026-09-22', prio: 'Media', sem: 'Verde', notas: 'Compra de mesa lista al tener fecha de instalación' },
    { cli: 'Hospital Militar', cnum: 'CT No 13-BS-2026', desc: 'Capacitación en Reglas de Westgard y Gráfica Levey Jennings (Mini-Cube)', resp: 'Edgar Martínez', fecha: '2026-09-20', prio: 'Media', sem: 'Verde', notas: 'Recopilar firmas de participantes y manual en PC' },
    { cli: 'Hospital Bloom', cnum: 'N° 68/2026', desc: 'Sistema Informático SIS y Enlace con MINSAL', resp: 'Coordinador IT', fecha: '2026-09-08', prio: 'Alta', sem: 'Anaranjado', notas: 'Coordinar con Juan José la plantilla para perfil de pruebas' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Creación de Guías de Usuario FUS y Atellica CI', resp: 'Edgar Martínez', fecha: '2026-09-20', prio: 'Media', sem: 'Verde', notas: 'Elaboración de manuales simplificados laminados' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Entrega de AMPOS Institucionales con Calendarios', resp: 'Roberto Gómez', fecha: '2026-09-08', prio: 'Media', sem: 'Anaranjado', notas: 'Pendiente documentación final de fábrica' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Creación de Plan de Contingencia Pruebas de Ferritina', resp: 'Juan José Rivas', fecha: '2026-09-11', prio: 'Alta', sem: 'Anaranjado', notas: 'Pendiente ingreso a bodega para coordinar entrega' },
    { cli: 'Hospital Santa Ana', cnum: 'CT No 16/2026', desc: 'Mejora en Orden de Entrega Física por Factura en Despacho', resp: 'Diego Polanco', fecha: '2026-09-15', prio: 'Alta', sem: 'Anaranjado', notas: 'Identificación por bloques de producto para agilizar recepción' }
  ];

  for (const k of kardexFase2) {
    const projId = projMap[k.cnum] || projMap[k.cli.toUpperCase()] || 'b0000001-0000-0000-0000-000000000001';
    const respId = userMap[k.resp.toUpperCase()] || 'a0000001-0000-0000-0000-000000000008';

    await supabase.from('kardex_pendientes').insert({
      proyecto_id: projId,
      descripcion: k.desc,
      responsable_id: respId,
      fecha_cumplimiento: k.fecha,
      prioridad: k.prio,
      notas: k.notas
    });
  }
  console.log('✓ 19 Tareas de Kardex de Fase 2 cargadas exitosamente');
}

setupGarantiasTable().catch(console.error);
