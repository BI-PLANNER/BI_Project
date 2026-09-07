const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
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

const RAW_DATA = [
  {
    num: 1,
    cliente: 'ISSS',
    situacion: 'SISTEMA INFORMATICO',
    responsable: 'RICARDO VILLANUEVA',
    fecha_cumplimiento: '2026-09-10',
    comentario: 'Se instalara los antivirus a partir del Lunes 10 de agosto , pendiente la compra de los antivirus',
    semaforo: 'Anaranjado'
  },
  {
    num: 2,
    cliente: 'ISBM',
    situacion: 'GARANTIA DE FABRICA AUTENTICADO',
    responsable: 'JULIO CESAR',
    fecha_cumplimiento: '2026-08-10',
    comentario: 'Solicitado a fabrica, pendiente de entrega de las garantias',
    semaforo: 'Rojo'
  },
  {
    num: 3,
    cliente: 'ISBM',
    situacion: 'CONTROLES DE 3ERA OPINION',
    responsable: 'JULIO CESAR',
    fecha_cumplimiento: '2026-08-24',
    comentario: 'Controles cotizados y comprados, el fabricante lo estaría entregando a mas tardar (24-08-26)',
    semaforo: 'Rojo'
  },
  {
    num: 4,
    cliente: 'ISBM',
    situacion: 'CARTA DE AUTORIZACION DEL FABRICANTE',
    responsable: 'JULIO CESAR',
    fecha_cumplimiento: '2026-08-20',
    comentario: 'Carta con Nombre de LABYMED, se ha solicitado una nueva carta de distribución al fabricante EXIAS, solicitado con Andrea nueva carta de autorizacion del fabricante, pendiente la traduccion legal',
    semaforo: 'Rojo'
  },
  {
    num: 5,
    cliente: 'ISBM',
    situacion: 'FUNDAMENTO DE LA PRUEBA CON LOS RANGOS',
    responsable: 'EDGAR FIGUEROA',
    fecha_cumplimiento: '2026-09-01',
    comentario: 'Pendiente elaboración del fundamento de la prueba, firmado por Edgar',
    semaforo: 'Rojo'
  },
  {
    num: 6,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CONTROLES DE 3ERA OPINION (QUIMICA EMERGENCIA)',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Controles cotizados y comprados, el fabricante lo estaría entregando a mas tardar (31-08-26) (Para el área de Quimica Emergencia y Hospitalización)',
    semaforo: 'Rojo'
  },
  {
    num: 7,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CONTROLES DE 3ERA OPINION (HOSPITALIZACION)',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Controles cotizados y comprados, el fabricante lo estaría entregando a mas tardar (31-08-26) (Para el área de Quimica Emergencia y Hospitalización)',
    semaforo: 'Rojo'
  },
  {
    num: 8,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CONTROLES DE 3ERA OPINION (SEGUIMIENTO FABRICA)',
    responsable: 'JULIO CESAR',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Controles cotizados y comprados, el fabricante lo estaría entregando a mas tardar (31-08-26) (Para el área de Quimica Emergencia y Hospitalización)',
    semaforo: 'Rojo'
  },
  {
    num: 9,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'REPORTE DE DESECHOS GENERADOS',
    responsable: 'JULIO CESAR',
    fecha_cumplimiento: '2026-07-31',
    comentario: 'Pendiente entrega de fabrica',
    semaforo: 'Rojo'
  },
  {
    num: 10,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CERTIFICADO DE MANUFACTURA',
    responsable: 'JULIO CESAR',
    fecha_cumplimiento: '2026-07-31',
    comentario: 'Pendiente entrega de fabrica',
    semaforo: 'Rojo'
  },
  {
    num: 11,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'ROTO MOTOR y ROTOPLAS',
    responsable: 'MOISES HERNANDEZ',
    fecha_cumplimiento: '2026-09-15',
    comentario: 'Proveedor cambio la fecha de visita técnica al sabado 29/08',
    semaforo: 'Verde'
  },
  {
    num: 12,
    cliente: 'HOSPITAL SALDAÑA',
    situacion: 'PENDIENTE SISTEMA E INTERFAS:',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-08-17',
    comentario: 'Pendiente correo del a administradora de contrato, mencionando que no es necesario la interfas para respaldo',
    semaforo: 'Rojo'
  },
  {
    num: 13,
    cliente: 'HOSPITAL MILITAR',
    situacion: 'INSCRIPCION DE CONTROL DE CALIDAD 3era Opinión marca Biorad',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Controles cotizados y comprados, el fabricante lo estaría entregando a mas tardar (31-08-26) , para INMMULITE 2000 XPI, F200',
    semaforo: 'Rojo'
  },
  {
    num: 14,
    cliente: 'HOSPITAL MILITAR',
    situacion: 'INSTALACION DE RAPID POINT',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Pendiente coordinar la fecha para la instalación del equipo con el Administrador.',
    semaforo: 'Rojo'
  },
  {
    num: 15,
    cliente: 'HOSPITAL MILITAR',
    situacion: '(GASES ARTERIALES) RAPID POINT',
    responsable: 'MOISES HERNANDEZ',
    fecha_cumplimiento: '2026-09-30',
    comentario: 'Se hará la compra de la mesa al tener fecha de instalación',
    semaforo: 'Verde'
  },
  {
    num: 16,
    cliente: 'HOSPITAL MILITAR',
    situacion: '(ERITROSEDIMENTACIÓN) MINI-CUBE',
    responsable: 'EDGAR FIGUEROA',
    fecha_cumplimiento: '2026-09-15',
    comentario: 'Pendiente Capacitación de los controles de calidad internos a través de las reglas de Westgard, grafica de Levey Jennigs (Proporcionar lista con firma de los participantes) y agregar manual operativo a la computadora',
    semaforo: 'Verde'
  },
  {
    num: 17,
    cliente: 'HOSPITAL MILITAR',
    situacion: '(GASES ARTERIALES) RAPID POINT MARCA: SIEMENS',
    responsable: 'EDGAR FIGUEROA',
    fecha_cumplimiento: '2026-09-15',
    comentario: 'Al tener la PC instalada, agregar el manual operativo del equipo, Pendiente Capacitación, proporcionar listado con firma de los participantes (Esto se realizara hasta tener el equipo instalado)',
    semaforo: 'Verde'
  },
  {
    num: 18,
    cliente: 'HOSPITAL MILITAR',
    situacion: '(GASES ARTERIALES) EPOC MARCA: SIEMENS',
    responsable: 'EDGAR FIGUEROA',
    fecha_cumplimiento: '2026-09-15',
    comentario: 'pendiente listado de capacitaciones y entregar manual operativo o agregarse a la PC.',
    semaforo: 'Verde'
  },
  {
    num: 19,
    cliente: 'HOSPITAL MILITAR',
    situacion: 'Sistema de cómputo con interfaz al sistema hospitalario',
    responsable: 'RICARDO VILLANUEVA',
    fecha_cumplimiento: '2026-09-15',
    comentario: '(este punto estaría listo hasta que el equipo este instalado pendiente confirmación del administrador de contrato',
    semaforo: 'Verde'
  },
  {
    num: 20,
    cliente: 'HOSPITAL BLOOM',
    situacion: 'Sistema informatico SIS',
    responsable: 'RICARDO VILLANUEVA',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'MINSAL no comparte la prueeba y no la puden poner a nuestro perfil, comentan que aún tienen reactivo del otro equipo, ya se le pidió a Juan José que pida la plantilla para adelantar, no hay fecha de instalación debido a que no dieron fecha de fin de reactivo',
    semaforo: 'Rojo'
  },
  {
    num: 21,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CREACIÓN DE GUIA DE USUARIO',
    responsable: 'ROBERTO BATRES / EDGAR FIGUEROA',
    fecha_cumplimiento: '2026-09-15',
    comentario: 'Creación de Guia de usuario para los Equipo FUS Y ATELLICA',
    semaforo: 'Verde'
  },
  {
    num: 22,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'ENTREGA DE AMPOS',
    responsable: 'ROBERTO BATRES',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Se entregaron los calendarios de mantenimientos, la entrega de los ampos se concluira hasta tener la documentación pendiente de DIRUI por parte de Julio Velasco',
    semaforo: 'Rojo'
  },
  {
    num: 23,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CREACION Y COMPRA DE STICKERS DE LOS EQUIPOS',
    responsable: 'ROBERTO BATRES / KAREN',
    fecha_cumplimiento: '2026-09-08',
    comentario: 'Ya se compartio una imagen de esta solicud para crearla con los formatos de L&M, Pendiente cotización',
    semaforo: 'Anaranjado'
  },
  {
    num: 24,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'CREACION DE PLAN DE CONTINGENCIA DE FERRITINA',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Pendiente ingrese a bodega para coordinar entrega',
    semaforo: 'Rojo'
  },
  {
    num: 25,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'REVISAR REACTIVOS PENDIENTES DE ENTREGA (1ER Y 2DA)',
    responsable: 'JUAN JOSE',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Seguimiento de despacho y recepción de reactivos de 1ra y 2da entrega',
    semaforo: 'Rojo'
  },
  {
    num: 26,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'APROBACION PRESUPUESTO TRASLADO BOMBA CISTERNA',
    responsable: 'LUIS ORELLANA',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Se validará al realizar la visita por parte del tercero',
    semaforo: 'Rojo'
  },
  {
    num: 27,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'MEJORAR Y CREAR NUEVA ORDEN DE ENTREGA AL CLIENTE',
    responsable: 'DIEGO POLANCO',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'En la orden de entrega los bloques de productos deben ser identificados fisicamente por factura y asi mejorar el tiempo de revision de entrega al cliente asi como tiempos de entrega de despacho - se entregara 15 de septiembre',
    semaforo: 'Rojo'
  },
  {
    num: 28,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'BUSCAR METODOLOGIA DE REVISION INTERNA EN DESPACHO',
    responsable: 'DIEGO POLANCO',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Garantizar que lo que se enviará corresponda a lo solicitado -se entregara 15 de septiembre',
    semaforo: 'Rojo'
  },
  {
    num: 30,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    situacion: 'ENTREGA DE PRUEBA FERRITINA',
    responsable: 'DIEGO POLANCO / JUAN JOSE',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Coordinacion de la logistica de Ferritina para importar de los países de COL o CR, para una reaccion mas inmediata',
    semaforo: 'Rojo'
  }
];

async function seed() {
  console.log('--- INGESTIÓN SEPARADA DE PENDIENTES DE LICITACIONES (FASE 2) ---');

  // 1. Empresa Titular
  let { data: emp } = await supabase.from('empresas').select('empresa_id').eq('abreviatura', 'LM').single();
  if (!emp) {
    const { data: newEmp } = await supabase.from('empresas').insert({ nombre_empresa: 'LABANDMED S.A. DE C.V.', abreviatura: 'LM', activo: true }).select('empresa_id').single();
    emp = newEmp;
  }
  const empresaId = emp ? emp.empresa_id : 1;

  // 2. Tipos de Institución
  let { data: tipo } = await supabase.from('tipos_institucion').select('tipo_institucion_id').eq('codigo', 'HOSP').single();
  if (!tipo) {
    const { data: newTipo } = await supabase.from('tipos_institucion').insert({ codigo: 'HOSP', descripcion: 'Sector Salud y Hospitales', activo: true }).select('tipo_institucion_id').single();
    tipo = newTipo;
  }
  const tipoId = tipo ? tipo.tipo_institucion_id : 1;

  // 3. Clientes (Solo Licitaciones)
  const clientesMap = {};
  const distinctClientes = [...new Set(RAW_DATA.map(d => d.cliente))];
  for (const cName of distinctClientes) {
    let { data: cli } = await supabase.from('clientes').select('cliente_id').eq('nombre_cliente', cName).single();
    if (!cli) {
      const { data: newCli, error: cliErr } = await supabase.from('clientes').insert({ nombre_cliente: cName, tipo_institucion_id: tipoId, activo: true }).select('cliente_id').single();
      if (cliErr) console.error('Error insert cliente:', cName, cliErr);
      cli = newCli;
    }
    if (cli) clientesMap[cName] = cli.cliente_id;
  }
  console.log('Clientes de Licitaciones registrados:', clientesMap);

  // 4. Áreas Organizacionales
  const areasMap = {};
  const areasList = ['IT / Informática', 'Regulación y Calidad', 'Operaciones y Logística', 'Aplicaciones Clínicas', 'CAST / Soporte Técnico', 'Planificación y Licitaciones', 'Administración', 'Gerencia General', 'Almacén y Despacho'];
  for (const aName of areasList) {
    let { data: area } = await supabase.from('areas').select('area_id').eq('nombre_area', aName).single();
    if (!area) {
      const { data: newArea } = await supabase.from('areas').insert({ nombre_area: aName, activo: true }).select('area_id').single();
      area = newArea;
    }
    if (area) areasMap[aName] = area.area_id;
  }

  // 5. Personas
  const personasData = [
    { nombre: 'RICARDO VILLANUEVA', email: 'ricardo.villanueva@lm-sv.com', area: 'IT / Informática' },
    { nombre: 'JULIO CESAR', email: 'julio.cesar@lm-sv.com', area: 'Regulación y Calidad' },
    { nombre: 'EDGAR FIGUEROA', email: 'edgar.figueroa@lm-sv.com', area: 'Aplicaciones Clínicas' },
    { nombre: 'JUAN JOSE', email: 'juan.jose@lm-sv.com', area: 'Operaciones y Logística' },
    { nombre: 'MOISES HERNANDEZ', email: 'moises.hernandez@lm-sv.com', area: 'CAST / Soporte Técnico' },
    { nombre: 'ROBERTO BATRES', email: 'roberto.batres@lm-sv.com', area: 'Planificación y Licitaciones' },
    { nombre: 'ROBERTO BATRES / EDGAR FIGUEROA', email: 'roberto.batres@lm-sv.com', area: 'Planificación y Licitaciones' },
    { nombre: 'ROBERTO BATRES / KAREN', email: 'roberto.batres@lm-sv.com', area: 'Planificación y Licitaciones' },
    { nombre: 'KAREN', email: 'karen@lm-sv.com', area: 'Administración' },
    { nombre: 'LUIS ORELLANA', email: 'luis.orellana@lm-sv.com', area: 'Gerencia General' },
    { nombre: 'DIEGO POLANCO', email: 'diego.polanco@lm-sv.com', area: 'Almacén y Despacho' },
    { nombre: 'DIEGO POLANCO / JUAN JOSE', email: 'diego.polanco@lm-sv.com', area: 'Almacén y Despacho' }
  ];
  const personasMap = {};
  for (const p of personasData) {
    let { data: per } = await supabase.from('personas').select('persona_id').eq('nombre_completo', p.nombre).single();
    if (!per) {
      const { data: newPer, error: perErr } = await supabase.from('personas').insert({
        nombre_completo: p.nombre,
        email: p.email,
        area_id: areasMap[p.area] || areasMap['Operaciones y Logística'],
        activo: true
      }).select('persona_id').single();
      if (perErr) console.error('Error persona:', p.nombre, perErr);
      per = newPer;
    }
    if (per) personasMap[p.nombre] = per.persona_id;
  }
  console.log('Personas registradas:', Object.keys(personasMap).length);

  // 6. Situaciones
  const situacionesMap = {};
  const situacionesList = [...new Set(RAW_DATA.map(d => d.situacion.slice(0, 95)))];
  for (const sName of situacionesList) {
    let { data: sit } = await supabase.from('situaciones').select('situacion_id').eq('nombre_situacion', sName).single();
    if (!sit) {
      const { data: newSit } = await supabase.from('situaciones').insert({ nombre_situacion: sName }).select('situacion_id').single();
      sit = newSit;
    }
    if (sit) situacionesMap[sName] = sit.situacion_id;
  }

  // 7. Estatus
  const estatusMap = {};
  const estatusList = ['Verde', 'Anaranjado', 'Rojo', 'COMPLETADO', 'PENDIENTE', 'EN PROGRESO'];
  for (const eName of estatusList) {
    let { data: est } = await supabase.from('estatus').select('estatus_id').eq('nombre_estatus', eName).single();
    if (!est) {
      const { data: newEst } = await supabase.from('estatus').insert({ nombre_estatus: eName }).select('estatus_id').single();
      est = newEst;
    }
    if (est) estatusMap[eName] = est.estatus_id;
  }

  // 8. Contratos de Licitaciones
  const contratosData = [
    { cliente: 'ISSS', numero: 'SM-022/2024', nombre: 'Contrato ISSS ERITRO & Insumos' },
    { cliente: 'ISBM', numero: 'AD-014/2026-ISBM', nombre: 'Contrato ISBM Electrolitos & Gases' },
    { cliente: 'SAN JUAN DE DIOS DE SANTA ANA', numero: 'CT No 16/2026', nombre: 'Contrato San Juan de Dios de Santa Ana' },
    { cliente: 'HOSPITAL MILITAR', numero: 'CT No 13-BS-2026', nombre: 'Contrato Hospital Militar Central' },
    { cliente: 'HOSPITAL BLOOM', numero: 'N° 68/2026', nombre: 'Contrato Hospital Nacional de Niños Benjamín Bloom' },
    { cliente: 'HOSPITAL SALDAÑA', numero: 'CT-SALDAÑA-2026', nombre: 'Contrato Hospital Saldaña' }
  ];
  const contratosMap = {};
  for (const c of contratosData) {
    const cId = clientesMap[c.cliente];
    if (cId) {
      let { data: con } = await supabase.from('contratos').select('contrato_id').eq('numero_contrato', c.numero).single();
      if (!con) {
        const { data: newCon } = await supabase.from('contratos').insert({
          numero_contrato: c.numero,
          nombre_contrato: c.nombre,
          cliente_id: cId,
          empresa_id: empresaId
        }).select('contrato_id').single();
        con = newCon;
      }
      if (con) contratosMap[c.cliente] = con.contrato_id;
    }
  }

  // 9. Inserción en incidencias_seguimiento (Exclusivo Licitaciones)
  await supabase.from('incidencias_seguimiento').delete().neq('incidencia_id', 0);

  const rowsToInsert = RAW_DATA.map(r => ({
    cliente_id: clientesMap[r.cliente],
    contrato_id: contratosMap[r.cliente] || null,
    situacion_id: situacionesMap[r.situacion.slice(0, 95)] || null,
    persona_id: personasMap[r.responsable] || null,
    estatus_id: estatusMap[r.semaforo] || estatusMap['PENDIENTE'],
    fecha_registro: new Date().toISOString().split('T')[0],
    fecha_cumplimiento: r.fecha_cumplimiento,
    comentario: r.comentario
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('incidencias_seguimiento')
    .insert(rowsToInsert)
    .select('*');

  if (insertError) {
    console.error('Error insertando incidencias_seguimiento:', insertError);
  } else {
    console.log(`🎉 ¡ÉXITO TOTAL! ${inserted.length} registros insertados en incidencias_seguimiento EXCLUSIVAMENTE para el seguimiento de Licitaciones.`);
  }
}

seed().catch(console.error);
