const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdpqrxvsiejjbrjquoxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSeed() {
  console.log('--- Iniciando carga de datos en Supabase ---');

  // 1. Roles
  const roles = [
    { nombre: 'Gerente', descripcion: 'Gerencia general. Acceso total, aprobación de pedidos y reportes.' },
    { nombre: 'PM', descripcion: 'Project Manager. Gestión de proyectos, asignación de tareas y supervisión.' },
    { nombre: 'Planner', descripcion: 'Planificación. Cronograma inverso, generación de tickets y planificación.' },
    { nombre: 'IT', descripcion: 'Tecnología de Información. Infraestructura tecnológica y cotizaciones informáticas.' },
    { nombre: 'Soporte Tecnico', descripcion: 'Soporte Técnico. Instalación, mantenimiento y adecuaciones de equipos.' },
    { nombre: 'Soporte de Aplicaciones', descripcion: 'Soporte de Aplicaciones. Configuración de software, integraciones y soporte de sistemas.' },
    { nombre: 'Comercial', descripcion: 'Área Comercial. Seguimiento de licitaciones y relación con clientes gubernamentales.' },
    { nombre: 'Logistica', descripcion: 'Logística. Control de pedidos, despacho y coordinación de entregas.' }
  ];

  for (const r of roles) {
    await supabase.from('roles').upsert(r, { onConflict: 'nombre' });
  }
  console.log('✓ Roles asegurados');

  const { data: dbRoles } = await supabase.from('roles').select('id, nombre');
  const roleMap = {};
  dbRoles.forEach(r => { roleMap[r.nombre] = r.id; });

  // 2. Usuarios
  const users = [
    { id: 'a0000001-0000-0000-0000-000000000001', nombre: 'Luis', apellido: 'Orellana', email: 'luis.orellana@labandmed.com', rol_id: roleMap['Gerente'], departamento: 'Gerencia General' },
    { id: 'a0000001-0000-0000-0000-000000000002', nombre: 'Roberto', apellido: 'Gómez', email: 'roberto.gomez@labandmed.com', rol_id: roleMap['PM'], departamento: 'Gestión de Proyectos' },
    { id: 'a0000001-0000-0000-0000-000000000003', nombre: 'Nelson', apellido: 'Alvarado', email: 'nelson.alvarado@labandmed.com', rol_id: roleMap['Planner'], departamento: 'Planificación' },
    { id: 'a0000001-0000-0000-0000-000000000004', nombre: 'Edgar', apellido: 'Martínez', email: 'edgar.martinez@labandmed.com', rol_id: roleMap['Soporte de Aplicaciones'], departamento: 'Aplicaciones' },
    { id: 'a0000001-0000-0000-0000-000000000005', nombre: 'Moisés', apellido: 'Hernández', email: 'moises.hernandez@labandmed.com', rol_id: roleMap['Soporte Tecnico'], departamento: 'Ingeniería Biomédica' },
    { id: 'a0000001-0000-0000-0000-000000000006', nombre: 'Dennis', apellido: 'Flores', email: 'dennis.flores@labandmed.com', rol_id: roleMap['Comercial'], departamento: 'Facturación y Cobros' },
    { id: 'a0000001-0000-0000-0000-000000000007', nombre: 'Juan Carlos', apellido: 'Pineda', email: 'juancarlos.pineda@labandmed.com', rol_id: roleMap['Logistica'], departamento: 'Abastecimiento y Despacho' },
    { id: 'a0000001-0000-0000-0000-000000000008', nombre: 'Juan José', apellido: 'Rivas', email: 'juanjose.rivas@labandmed.com', rol_id: roleMap['PM'], departamento: 'Gestión de Reactivos' },
    { id: 'a0000001-0000-0000-0000-000000000009', nombre: 'Julio', apellido: 'César', email: 'julio.cesar@labandmed.com', rol_id: roleMap['PM'], departamento: 'Gestión de Contratos' },
    { id: 'a0000001-0000-0000-0000-000000000010', nombre: 'Marisela', apellido: 'Sánchez', email: 'marisela.sanchez@labandmed.com', rol_id: roleMap['Logistica'], departamento: 'Importaciones' },
    { id: 'a0000001-0000-0000-0000-000000000011', nombre: 'Vanesa', apellido: 'López', email: 'vanesa.lopez@labandmed.com', rol_id: roleMap['Comercial'], departamento: 'Recuperación de Cobros' },
    { id: 'a0000001-0000-0000-0000-000000000012', nombre: 'Andrea', apellido: 'Morales', email: 'andrea.morales@labandmed.com', rol_id: roleMap['Soporte de Aplicaciones'], departamento: 'Documentación y Hojas de Seguridad' },
    { id: 'a0000001-0000-0000-0000-000000000013', nombre: 'Diego', apellido: 'Polanco', email: 'diego.polanco@labandmed.com', rol_id: roleMap['Logistica'], departamento: 'Almacén y Bodega' },
    { id: 'a0000001-0000-0000-0000-000000000014', nombre: 'Coordinador', apellido: 'IT', email: 'coordinador.it@labandmed.com', rol_id: roleMap['IT'], departamento: 'Tecnología e Infraestructura' }
  ];

  for (const u of users) {
    // Create auth user if not exists
    await supabase.auth.admin.createUser({
      id: u.id,
      email: u.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { nombre: `${u.nombre} ${u.apellido}` }
    }).catch(() => {});

    const { error: userErr } = await supabase.from('users').upsert({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      apellido: u.apellido,
      rol_id: u.rol_id,
      departamento: u.departamento,
      activo: true
    }, { onConflict: 'id' });
    if (userErr) console.log('User upsert error:', userErr);
  }
  console.log('✓ Usuarios insertados');

  // 3. Proyectos
  const projects = [
    { id: 'b0000001-0000-0000-0000-000000000001', cliente: 'ISSS', contrato_num: 'SM-022/2024', nombre: 'Suministro de Reactivos Eritropoyetina e Insumos ISSS', descripcion: 'Contrato de reactivos e insumos para el Instituto Salvadoreño del Seguro Social', fecha_adjudicacion: '2024-02-15', fecha_inicio: '2024-03-01', fecha_fin_estimada: '2026-12-31', fecha_entrega_max: '2026-11-30', estado: 'En Ejecucion', presupuesto: 450000.00, created_by: 'a0000001-0000-0000-0000-000000000002' },
    { id: 'b0000001-0000-0000-0000-000000000002', cliente: 'Hospital Santa Ana', contrato_num: 'CT No 16/2026', nombre: 'Equipamiento Química Emergencia Atellica CI Siemens - Santa Ana', descripcion: 'Contrato Hospital Nacional San Juan de Dios de Santa Ana, Renglones 1 al 34', fecha_adjudicacion: '2026-01-10', fecha_inicio: '2026-02-01', fecha_fin_estimada: '2026-12-31', fecha_entrega_max: '2026-10-15', estado: 'En Ejecucion', presupuesto: 280000.00, created_by: 'a0000001-0000-0000-0000-000000000002' },
    { id: 'b0000001-0000-0000-0000-000000000003', cliente: 'Hospital Militar', contrato_num: 'CT No 13-BS-2026', nombre: 'Gases Arteriales EPOC, F200 y Mini Cube - Hospital Militar Central', descripcion: 'Suministro de equipos y pruebas rápidas hospitalarias', fecha_adjudicacion: '2026-01-20', fecha_inicio: '2026-02-15', fecha_fin_estimada: '2026-12-31', fecha_entrega_max: '2026-09-30', estado: 'En Ejecucion', presupuesto: 195000.00, created_by: 'a0000001-0000-0000-0000-000000000002' },
    { id: 'b0000001-0000-0000-0000-000000000004', cliente: 'ISBM', contrato_num: 'CT No AD-014/2026-ISBM', nombre: 'Electrolitos EXIAS e1 e Insumos Médicos - ISBM', descripcion: 'Instituto Salvadoreño de Bienestar Magisterial, suministro de reactivos y equipos', fecha_adjudicacion: '2026-02-01', fecha_inicio: '2026-02-20', fecha_fin_estimada: '2026-12-31', fecha_entrega_max: '2026-10-31', estado: 'En Ejecucion', presupuesto: 160000.00, created_by: 'a0000001-0000-0000-0000-000000000002' }
  ];

  for (const p of projects) {
    const { error: pErr } = await supabase.from('projects').upsert(p, { onConflict: 'contrato_num' });
    if (pErr) console.log('Project error:', pErr);
  }
  console.log('✓ Proyectos reales insertados');

  // 4. Kardex
  const kardexList = [
    { proyecto_id: 'b0000001-0000-0000-0000-000000000001', descripcion: 'Entrega de reactivo eritropoyetina con vigencia >18 meses', ubicacion: 'Almacén Central ISSS', fecha_cumplimiento: '2026-09-03', responsable_id: 'a0000001-0000-0000-0000-000000000007', prioridad: 'Urgente', notas: 'Lote en aduana listo para desaduanaje' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000001', descripcion: 'Verificación y conexión de respaldo UPS para analizador', ubicacion: 'Hospital General ISSS', fecha_cumplimiento: '2026-09-05', responsable_id: 'a0000001-0000-0000-0000-000000000005', prioridad: 'Alta', notas: 'Pendiente confirmación de técnico en sitio' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000002', descripcion: 'Instalación y adecuación equipo Atellica CI Siemens', ubicacion: 'Hospital San Juan de Dios - Laboratorio', fecha_cumplimiento: '2026-09-06', responsable_id: 'a0000001-0000-0000-0000-000000000005', prioridad: 'Urgente', notas: 'Mesa y punto eléctrico listos' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000002', descripcion: 'Inscripción en programa de Control de Calidad Externo', ubicacion: 'Laboratorio Santa Ana', fecha_cumplimiento: '2026-09-12', responsable_id: 'a0000001-0000-0000-0000-000000000008', prioridad: 'Media', notas: 'Esperando confirmación del fabricante' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000003', descripcion: 'Adecuación de aire acondicionado y mesa para gases arteriales EPOC', ubicacion: 'Hospital Militar - Hematología', fecha_cumplimiento: '2026-09-04', responsable_id: 'a0000001-0000-0000-0000-000000000005', prioridad: 'Alta', notas: 'Pendiente inspección técnica final' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000003', descripcion: 'Entrega de manuales e insertos técnicos en físico', ubicacion: 'Hospital Militar - Dirección', fecha_cumplimiento: '2026-09-18', responsable_id: 'a0000001-0000-0000-0000-000000000004', prioridad: 'Media', notas: 'Documentos impresos y foliados' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000004', descripcion: 'Controles de tercera opinión para electrolitos EXIAS e1', ubicacion: 'Clínica Central ISBM', fecha_cumplimiento: '2026-09-07', responsable_id: 'a0000001-0000-0000-0000-000000000009', prioridad: 'Urgente', notas: 'Ya solicitados a casa matriz' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000004', descripcion: 'Capacitación y recopilación de firmas con personal de laboratorio', ubicacion: 'ISBM San Salvador', fecha_cumplimiento: '2026-09-25', responsable_id: 'a0000001-0000-0000-0000-000000000004', prioridad: 'Media', notas: 'Programado con jefe de servicio' },
    { proyecto_id: 'b0000001-0000-0000-0000-000000000001', descripcion: 'Emisión de facturación mensual y entrega de actas firmadas', ubicacion: 'Oficinas Centrales ISSS', fecha_cumplimiento: '2026-09-28', responsable_id: 'a0000001-0000-0000-0000-000000000006', prioridad: 'Media', notas: 'Coordinado con administrador de contrato' }
  ];

  for (const k of kardexList) {
    await supabase.from('kardex_pendientes').insert(k);
  }
  console.log('✓ Kardex operativo insertado');

  // 5. Stock Items
  const stockItems = [
    { codigo: 'REACT-ERI-01', nombre: 'Reactivo Eritropoyetina 2000 UI', categoria: 'Reactivos', stock_actual: 120, stock_minimo: 30, unidad_medida: 'Frasco', precio_referencia: 45.00, ubicacion_bodega: 'Bodega Fría Labandmed' },
    { codigo: 'REACT-ERI-02', nombre: 'Reactivo Eritropoyetina 4000 UI', categoria: 'Reactivos', stock_actual: 80, stock_minimo: 25, unidad_medida: 'Frasco', precio_referencia: 75.00, ubicacion_bodega: 'Bodega Fría Labandmed' },
    { codigo: 'EQ-EPOC-01', nombre: 'Analizador de Gases Arteriales EPOC', categoria: 'Equipos', stock_actual: 4, stock_minimo: 1, unidad_medida: 'Unidad', precio_referencia: 12500.00, ubicacion_bodega: 'Bodega Central' },
    { codigo: 'EQ-ATELLICA-01', nombre: 'Sistema de Química Clínica Atellica CI', categoria: 'Equipos', stock_actual: 2, stock_minimo: 1, unidad_medida: 'Unidad', precio_referencia: 45000.00, ubicacion_bodega: 'Bodega Central' },
    { codigo: 'EQ-EXIAS-01', nombre: 'Analizador de Electrolitos EXIAS e1', categoria: 'Equipos', stock_actual: 6, stock_minimo: 2, unidad_medida: 'Unidad', precio_referencia: 8200.00, ubicacion_bodega: 'Bodega Central' },
    { codigo: 'CTRL-3RA-01', nombre: 'Controles de Tercera Opinión Bio-Rad', categoria: 'Insumos', stock_actual: 15, stock_minimo: 10, unidad_medida: 'Kit', precio_referencia: 120.00, ubicacion_bodega: 'Bodega Refrigerada' },
    { codigo: 'UPS-ONLINE-01', nombre: 'Sistema UPS Online 3kVA Grado Médico', categoria: 'Informatica', stock_actual: 8, stock_minimo: 3, unidad_medida: 'Unidad', precio_referencia: 850.00, ubicacion_bodega: 'Bodega IT' },
    { codigo: 'INS-CALIB-01', nombre: 'Pack de Calibradores y Soluciones de Limpieza', categoria: 'Insumos', stock_actual: 40, stock_minimo: 15, unidad_medida: 'Kit', precio_referencia: 65.00, ubicacion_bodega: 'Bodega Central' }
  ];

  for (const s of stockItems) {
    await supabase.from('stock_items').upsert(s, { onConflict: 'codigo' });
  }
  console.log('✓ Stock de inventario insertado');

  console.log('--- Proceso completado con éxito ---');
}

runSeed().catch(console.error);
