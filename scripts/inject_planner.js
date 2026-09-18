const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '../src/app/dashboard/planner/page.tsx');
let content = fs.readFileSync(pageFilePath, 'utf8');

// The new items to add
const newItemsStr = `,
  // --- INYECCIÓN AUTOMÁTICA DE ENTREGAS MATRIZ (30, 60, 90, 120 DÍAS) ---
  {
    id: 101,
    item_num: 101,
    incidencia_id: 101,
    cliente: 'ISSS (TODOS LOS HOSPITALES)',
    numero_contrato: 'LC26DM0050',
    tipo_pendiente: 'ENTREGA',
    situacion: 'ENTREGA FASE 1 (30 DÍAS) - SANGRE OCULTA, PCT Y ANTIDOPING',
    area: 'LOGISTICA',
    responsable: 'EQUIPO LOGÍSTICA',
    ubicacion: 'MULTIPLE (ALMACÉN CENTRAL)',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'Primera fase de entregas a los 30 días según cuadro matriz.',
    estatus: 'Verde'
  },
  {
    id: 102,
    item_num: 102,
    incidencia_id: 102,
    cliente: 'ISSS (TODOS LOS HOSPITALES)',
    numero_contrato: 'LC26DM0050',
    tipo_pendiente: 'ENTREGA',
    situacion: 'ENTREGA FASE 2 (60 DÍAS) - SANGRE OCULTA, PCT Y ANTIDOPING',
    area: 'LOGISTICA',
    responsable: 'EQUIPO LOGÍSTICA',
    ubicacion: 'MULTIPLE (ALMACÉN CENTRAL)',
    fecha_cumplimiento: '2026-09-30',
    comentario: 'Segunda fase de entregas a los 60 días según cuadro matriz.',
    estatus: 'Verde'
  },
  {
    id: 103,
    item_num: 103,
    incidencia_id: 103,
    cliente: 'ISSS (TODOS LOS HOSPITALES)',
    numero_contrato: 'LC26DM0050',
    tipo_pendiente: 'ENTREGA',
    situacion: 'ENTREGA FASE 3 (90 DÍAS) - SANGRE OCULTA, PCT Y ANTIDOPING',
    area: 'LOGISTICA',
    responsable: 'EQUIPO LOGÍSTICA',
    ubicacion: 'MULTIPLE (ALMACÉN CENTRAL)',
    fecha_cumplimiento: '2026-10-30',
    comentario: 'Tercera fase de entregas a los 90 días según cuadro matriz.',
    estatus: 'Verde'
  },
  {
    id: 104,
    item_num: 104,
    incidencia_id: 104,
    cliente: 'ISSS (TODOS LOS HOSPITALES)',
    numero_contrato: 'LC26DM0050',
    tipo_pendiente: 'ENTREGA',
    situacion: 'ENTREGA FASE 4 (120 DÍAS) - SANGRE OCULTA, PCT Y ANTIDOPING',
    area: 'LOGISTICA',
    responsable: 'EQUIPO LOGÍSTICA',
    ubicacion: 'MULTIPLE (ALMACÉN CENTRAL)',
    fecha_cumplimiento: '2026-11-29',
    comentario: 'Cuarta fase de entregas a los 120 días según cuadro matriz.',
    estatus: 'Verde'
  }
];`;

// Find the end of MASTER_LICITACIONES_PENDIENTES array.
// It looks like ` estatus: 'Verde'\n  }\n];`
const endOfArrayRegex = /estatus: '[^']+'\s*\}\s*\];/g;
let match;
let lastIndex = -1;
let lastMatchStr = '';

while ((match = endOfArrayRegex.exec(content)) !== null) {
  lastIndex = match.index;
  lastMatchStr = match[0];
}

if (lastIndex !== -1 && lastMatchStr) {
  const injection = lastMatchStr.replace(/\s*\];/, newItemsStr);
  content = content.substring(0, lastIndex) + injection + content.substring(lastIndex + lastMatchStr.length);
  fs.writeFileSync(pageFilePath, content, 'utf8');
  console.log('Successfully injected deliveries into planner array.');
} else {
  console.log('Could not find the end of the MASTER_LICITACIONES_PENDIENTES array.');
}
