const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';
const WORKFLOW_ID = 'e1Yt2LjWn33U6eZv';

async function n8nRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: N8N_HOST,
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function addExcelNode() {
  console.log(`📥 1. Obteniendo workflow ${WORKFLOW_ID} desde n8n...`);
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('❌ Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;
  console.log(`✅ Workflow obtenido: ${wf.name} con ${wf.nodes.length} nodos.`);

  // 2. Definir el nodo de Microsoft Excel 365
  const excelNode = {
    parameters: {
      resource: "worksheet",
      operation: "getRows",
      workbook: "REPORTE DE LICITACIONES.xlsx",
      worksheet: "Hoja1",
      options: {
        headerRow: 1
      }
    },
    id: "excel-licitaciones-365",
    name: "Microsoft Excel 365: REPORTE DE LICITACIONES",
    type: "n8n-nodes-base.microsoftExcel",
    typeVersion: 2,
    position: [64, -200],
    credentials: {
      microsoftExcelOAuth2Api: {
        id: "v8LmpDEejUNLVHGA",
        name: "Microsoft Excel - Lab&Med"
      }
    },
    continueOnFail: true,
    notes: "Lee en tiempo real el archivo REPORTE DE LICITACIONES.xlsx desde SharePoint / OneDrive (labandmedsv-my.sharepoint.com)"
  };

  // 3. Definir el nodo de transformación y limpieza 3FN de Licitaciones
  const transformLicitacionesNode = {
    parameters: {
      jsCode: `// ==========================================================================
// LIMPIEZA & NORMALIZACIÓN 3FN DE LICITACIONES (EXCEL ONLINE SHAREPOINT)
// ==========================================================================
const rawRows = $input.all();
const rows = rawRows.filter(r => !r.json?.error && (r.json?.['No. Oferta'] || r.json?.['Nombre Oferta'] || r.json?.Cliente || r.json?.AÑO));

const licitacionesNormalizadas = [];
let totalLicitaciones = 0;
const porInstitucion = {};
const porTipoProceso = {};

for (const r of rows) {
  const d = r.json;
  
  // Mapeo exacto de columnas del Excel Online:
  // A: AÑO (2026)
  // B: Mes (MARZO, ABRIL)
  // C: EMPR (LAB&MED)
  // D: INS (ISSS, MINSAL, etc.)
  // E: Cliente (INSTITUTO SALVADOREÑO DEL SEGURO SOCIAL, HOSPITAL NACIONAL...)
  // F: TIPO DE PROCESO (LICITACION COMPETITIVA, SUBASTA ELECTRONICA INVERSA, BAJA CUANTIA)
  // G: No. Oferta (LC26DM0050, LC26DM0076, SIE No. 01-2026, BAJAS CUANTIA)
  // H: Nombre Oferta (SUMINISTRO DE REACTIVOS, COMPRA DE REACTIVOS...)
  // I: Presentación / Estado
  
  const anio = String(d['AÑO'] || d['Año'] || d['ANIO'] || '2026').trim();
  const mes = String(d['Mes'] || d['MES'] || '').trim().toUpperCase();
  const empresa = String(d['EMPR'] || d['Empresa'] || 'LAB&MED').trim().toUpperCase();
  const institucion = String(d['INS'] || d['Institución'] || d['Institucion'] || 'MINSAL').trim().toUpperCase();
  const cliente = String(d['Cliente'] || d['CLIENTE'] || '').trim();
  const tipoProceso = String(d['TIPO DE PROCESO'] || d['Tipo Proceso'] || 'LICITACION COMPETITIVA').trim().toUpperCase();
  const noOferta = String(d['No. Oferta'] || d['No Oferta'] || d['Oferta'] || '').trim();
  const nombreOferta = String(d['Nombre Oferta'] || d['Nombre de Oferta'] || d['Descripción'] || '').trim();
  const presentacion = String(d['Presentación'] || d['Presentacion'] || '').trim();

  if (!noOferta && !nombreOferta && !cliente) continue;

  totalLicitaciones++;
  porInstitucion[institucion] = (porInstitucion[institucion] || 0) + 1;
  porTipoProceso[tipoProceso] = (porTipoProceso[tipoProceso] || 0) + 1;

  licitacionesNormalizadas.push({
    anio,
    mes,
    empresa,
    institucion,
    cliente,
    tipo_proceso: tipoProceso,
    no_oferta: noOferta,
    nombre_oferta: nombreOferta,
    presentacion,
    fuente: 'SharePoint Excel: REPORTE DE LICITACIONES',
    timestamp_sync: new Date().toISOString()
  });
}

return [{
  json: {
    tipo: 'licitaciones_excel_365_3fn',
    origen: 'Microsoft Excel 365 (SharePoint Lab&Med)',
    total_licitaciones_activas: totalLicitaciones,
    distribucion_institucion: porInstitucion,
    distribucion_tipo_proceso: porTipoProceso,
    licitaciones: licitacionesNormalizadas
  }
}];`
    },
    id: "transform-licitaciones-365",
    name: "Mapear Licitaciones Excel 365 (3FN)",
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: [304, -200]
  };

  // 4. Filtrar si ya existían para reemplazarlos limpiamente
  wf.nodes = wf.nodes.filter(n => n.id !== 'excel-licitaciones-365' && n.id !== 'transform-licitaciones-365');
  wf.nodes.push(excelNode);
  wf.nodes.push(transformLicitacionesNode);

  // 5. Conectar con los disparadores (Alimentación Automática y Webhook)
  wf.connections = wf.connections || {};
  
  // Conectar Webhook Sync -> Excel
  if (wf.connections["Webhook Sync"] && wf.connections["Webhook Sync"].main) {
    const existing = wf.connections["Webhook Sync"].main[0] || [];
    if (!existing.some(c => c.node === excelNode.name)) {
      existing.push({ node: excelNode.name, type: "main", index: 0 });
    }
  }

  // Conectar Alimentación Automática -> Excel
  if (wf.connections["Alimentación Automática (Cada 1 Hora)"] && wf.connections["Alimentación Automática (Cada 1 Hora)"].main) {
    const existing = wf.connections["Alimentación Automática (Cada 1 Hora)"].main[0] || [];
    if (!existing.some(c => c.node === excelNode.name)) {
      existing.push({ node: excelNode.name, type: "main", index: 0 });
    }
  }

  // Conectar Excel Node -> Transform Node
  wf.connections[excelNode.name] = {
    main: [
      [{ node: transformLicitacionesNode.name, type: "main", index: 0 }]
    ]
  };

  // Conectar Transform Node -> Consolidar Datos 5 Hojas para IA o Resumen
  wf.connections[transformLicitacionesNode.name] = {
    main: [
      [{ node: "Consolidar Datos 5 Hojas para IA", type: "main", index: 0 }]
    ]
  };

  console.log(`📤 2. Enviando workflow actualizado a n8n...`);
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 ¡ÉXITO! Nodos de Microsoft Excel 365 y Transformación Licitaciones agregados correctamente al Workflow Data_BI_SHEETS en n8n.');
  } else {
    console.error('❌ Error al actualizar workflow en n8n:', updateRes.data);
  }
}

addExcelNode().catch(console.error);
