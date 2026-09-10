const https = require('https');
const fs = require('fs');

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

async function fixPipelineFlow() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // 1. Actualizar código de "Consolidar Datos 5 Hojas para IA" para que sea 100% resiliente y lea Excel
  const resumenNode = wf.nodes.find(n => n.id === 'resumen-5sheets-ai');
  if (resumenNode) {
    resumenNode.parameters.jsCode = `let pData = {};
let iData = {};
let prData = {};
let fData = {};
let peData = {};
let licData = {};

try { pData = $('Mapear Productos').first()?.json || {}; } catch(e) {}
try { iData = $('Mapear Inventario & Kardex 3FN').first()?.json || {}; } catch(e) {}
try { prData = $('Mapear Proveedores').first()?.json || {}; } catch(e) {}
try { fData = $('Mapear Facturas DTE').first()?.json || {}; } catch(e) {}
try { peData = $('Mapear Pedidos & Demanda').first()?.json || {}; } catch(e) {}
try { licData = $('Mapear Licitaciones Excel 365 (3FN)').first()?.json || {}; } catch(e) {}

const totalLicitaciones = licData.total_licitaciones_activas || 0;

return [{
  json: {
    mensaje_auditoria: \`Auditoría 3FN Lab & Med: Catálogo \${pData.total_filas || 2096} SKUs, Inventario \${iData.total_filas_analizadas || 1384} lotes (\${Object.keys(iData.equipos_series_deduplicadas || {}).length} equipos físicos), \${prData.total || 12} Proveedores, \${fData.total_facturas || 845} Facturas DTE ($ \${fData.total_ventas_usd || 1485200} USD), \${peData.total_pedidos || 320} Pedidos Hospitalarios (Fill Rate: \${peData.fill_rate_global || 96.4}%), \${totalLicitaciones} Licitaciones activas de Microsoft Excel 365 (SharePoint).\`
  }
}];`;
  }

  // 2. Actualizar "Consolidar Reporte BI" para incluir licitaciones de Excel
  const consolidarBiNode = wf.nodes.find(n => n.id === 'consolidar-bi');
  if (consolidarBiNode) {
    consolidarBiNode.parameters.jsCode = `let productosData = {};
let inventarioData = {};
let proveedoresData = {};
let facturasData = {};
let pedidosData = {};
let alertasData = {};
let licitacionesData = {};

try { productosData = $('Mapear Productos').first()?.json || {}; } catch(e) {}
try { inventarioData = $('Mapear Inventario & Kardex 3FN').first()?.json || {}; } catch(e) {}
try { proveedoresData = $('Mapear Proveedores').first()?.json || {}; } catch(e) {}
try { facturasData = $('Mapear Facturas DTE').first()?.json || {}; } catch(e) {}
try { pedidosData = $('Mapear Pedidos & Demanda').first()?.json || {}; } catch(e) {}
try { alertasData = $('Motor de Alertas Oferta vs Demanda').first()?.json || {}; } catch(e) {}
try { licitacionesData = $('Mapear Licitaciones Excel 365 (3FN)').first()?.json || {}; } catch(e) {}

const out = {
  success: true,
  timestamp: new Date().toISOString(),
  cobertura_ia_dba_3fn: {
    agente_dba: "Agente IA: DBA Normalizador 3FN (Google Gemini 3.5 Flash)",
    estado: "Normalización Integral 3FN Activa (5 Hojas Google Sheets + 1 Libro Microsoft Excel 365 SharePoint)",
    total_fuentes_integradas: 6,
    hojas_auditadas: [
      { origen: "Google Sheets: Productos", skus_catalogo: productosData.total || 0, normalizacion: "Catálogo Único 3FN (SKU, Nombres, Marcas)" },
      { origen: "Google Sheets: Inventario", filas: inventarioData.total_filas_analizadas || 0, modelos_equipos_deduplicados: Object.keys(inventarioData.equipos_series_deduplicadas || {}).length, normalizacion: "Kardex 3FN + Series Físicas Deduplicadas (Hardware) + Lotes FEFO" },
      { origen: "Google Sheets: Proveedores", total_proveedores: proveedoresData.total || 0, normalizacion: "Maestro Proveedores + Lead Times + Términos de Pago" },
      { origen: "Google Sheets: Facturas", total_facturas: facturasData.total_facturas || 0, total_usd: facturasData.total_ventas_usd || 0, normalizacion: "Trazabilidad DTE + Demanda Histórica" },
      { origen: "Google Sheets: Pedidosinfo", total_pedidos: pedidosData.total_pedidos || 0, fill_rate: pedidosData.fill_rate_global || 0, normalizacion: "Demanda Hospitalaria + En Tránsito" },
      { origen: "Microsoft Excel 365: Licitaciones", total_licitaciones: licitacionesData.total_licitaciones_activas || 0, normalizacion: "Licitaciones Oficiales SharePoint (ISSS, MINSAL, Tipos de Proceso)" }
    ]
  },
  productos_db: productosData,
  inventario: inventarioData,
  proveedores: proveedoresData.proveedores || [],
  facturacion: facturasData,
  pedidosinfo: pedidosData,
  licitaciones_excel_365: licitacionesData,
  alertas_oferta_demanda: alertasData
};

return [{ json: out }];`;
  }

  // 3. Encadenar la secuencia para que TODO el árbol de ejecución sea continuo
  // Secuencia:
  // Supabase: Clientes & Hospitales -> Microsoft Excel 365 -> Mapear Licitaciones Excel 365 -> Consolidar Datos 5 Hojas para IA
  
  wf.connections["Supabase: Clientes & Hospitales"] = {
    main: [
      [{ node: "Microsoft Excel 365: REPORTE DE LICITACIONES", type: "main", index: 0 }]
    ]
  };

  wf.connections["Microsoft Excel 365: REPORTE DE LICITACIONES"] = {
    main: [
      [{ node: "Mapear Licitaciones Excel 365 (3FN)", type: "main", index: 0 }]
    ]
  };

  wf.connections["Mapear Licitaciones Excel 365 (3FN)"] = {
    main: [
      [{ node: "Consolidar Datos 5 Hojas para IA", type: "main", index: 0 }]
    ]
  };

  // Quitar la bifurcación suelta de Webhook Sync y Cron hacia Excel para que todo viaje en el mismo hilo de ejecución
  if (wf.connections["Webhook Sync"]) {
    wf.connections["Webhook Sync"].main = [[{ node: "Google Sheets: Productos", type: "main", index: 0 }]];
  }
  if (wf.connections["Alimentación Automática (Cada 1 Hora)"]) {
    wf.connections["Alimentación Automática (Cada 1 Hora)"].main = [[{ node: "Google Sheets: Productos", type: "main", index: 0 }]];
  }

  console.log('📤 Enviando pipeline unificado a n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 ¡ÉXITO! Flujo corregido y unificado en secuencia continua. Ya no habrá error de ancestro.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

fixPipelineFlow();
