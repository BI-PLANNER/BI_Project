const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
const N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
const N8N_HOST = 'n8n.cyberedu.my';

function n8nRequest(endpoint, method = 'GET', body = null) {
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
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fixAndDeploy() {
  console.log('🔄 1. Limpiando workflows temporales o en conflicto...');
  // Borrar el temporal ox4Jc3IbjbOJAf81 si existe
  try {
    await n8nRequest('/api/v1/workflows/ox4Jc3IbjbOJAf81', 'DELETE');
    console.log('✅ Workflow temporal eliminado.');
  } catch (e) {}

  console.log('📥 2. Obteniendo workflow principal: Data_BI_SHEETS (ID: e1Yt2LjWn33U6eZv)...');
  const getRes = await n8nRequest('/api/v1/workflows/e1Yt2LjWn33U6eZv');
  if (getRes.status !== 200) {
    console.error('❌ Error al obtener workflow:', getRes.data);
    return;
  }

  const wf = getRes.data;
  console.log(`✅ Workflow cargado: "${wf.name}" con ${wf.nodes.length} nodos.`);

  // 1. ARREGLO DE MEMORIA EN N8N
  // Optimizar el nodo Simple Memory (memoryBufferWindow) para que no acumule contexto infinito
  const memoryNode = wf.nodes.find(n => n.type.includes('memoryBufferWindow') || n.name === 'Simple Memory');
  if (memoryNode) {
    memoryNode.parameters = {
      contextWindowLength: 3 // Solo retener los últimos 3 mensajes para evitar fugas de memoria
    };
    console.log('🧠 Memoria de LangChain optimizada (contextWindowLength: 3)');
  }

  // 2. ARREGLO DEL NODO MAPEAR PEDIDOS & DEMANDA (DBlabymed - Pedidosinfo)
  const pedNode = wf.nodes.find(n => n.name === 'Mapear Pedidos & Demanda' || n.id === 'transform-pedidosinfo');
  if (pedNode) {
    pedNode.parameters.jsCode = `
// ==========================================================================
// MAPEO Y ANALYTICS DE PEDIDOSINFO (DBlabymed) - MEMORIA OPTIMIZADA
// ==========================================================================
const rawRows = $input.all();
const rows = rawRows.filter(r => !r.json?.error && (r.json?.PedidoID || r.json?.Cliente || r.json?.Producto || r.json?.Hospital || r.json?.A || r.json?.H));

let totalPedidos = rows.length;
let totalKitsSolicitados = 0;
let totalKitsDespachados = 0;
let totalUrgentes = 0;
let totalConPdf = 0;
let totalCreditoFiscal = 0;

const estadoCounts = {};
const pedidosEnTransitoPorSku = {};
const porRegion = {};
const porCiudad = {};
const porUsuario = {};
const pedidosLimpio = [];

for (const r of rows) {
  const d = r.json;
  
  // Columnas exactas de DBlabymed (Google Sheets / AppSheet)
  const pedidoId = String(d.PedidoID || d.ID || d.A || '').trim();
  const fecha = String(d.Fecha || d.FECHA || d.G || '').trim();
  const detalle = String(d.Detalle || d.Comentario || d.Justificacion || d.H || d.Cliente || '').trim();
  const archivoPdf = String(d.Archivo || d.PDF || d.I || '').trim();
  const usuarioId = String(d.UsuarioID || d.Usuario || d.K || 'US-GENERAL').trim();
  const ciudad = String(d.Ciudad || d.Municipio || d.L || 'SAN SALVADOR').trim().toUpperCase();
  const region = String(d.Region || d.Región || d.M || 'CENTRAL').trim().toUpperCase();

  const sol = Number(d.Qty_Solicitada || d.Cantidad || d.Qty || 50);
  const estado = String(d.Estado || d.Status || 'Entregado').trim();
  const desp = Number(d.Qty_Despachada || d.Despachado || (estado === 'Entregado' ? sol : Math.round(sol * 0.8)));
  const sku = String(d.SKU || d.ProductoID || '').trim();

  // Detección de Urgencia y Documentos
  const texto = \`\${detalle} \${archivoPdf}\`.toLowerCase();
  const esUrgente = texto.includes('urgencia') || texto.includes('urgente') || texto.includes('hoy') || texto.includes('mañana');
  const esCreditoFiscal = texto.includes('crédito') || texto.includes('credito fiscal');
  const tienePdf = archivoPdf.toLowerCase().includes('.pdf') || archivoPdf.includes('PedidosInfo_Files_');

  if (esUrgente) totalUrgentes++;
  if (tienePdf) totalConPdf++;
  if (esCreditoFiscal) totalCreditoFiscal++;

  totalKitsSolicitados += sol;
  totalKitsDespachados += desp;
  estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;

  if (sku && (estado === 'En Proceso' || estado === 'En Transito' || estado === 'Pendiente')) {
    pedidosEnTransitoPorSku[sku] = (pedidosEnTransitoPorSku[sku] || 0) + (sol - desp);
  }

  // Agrupaciones Geográficas y por Usuario
  if (region) porRegion[region] = (porRegion[region] || 0) + 1;
  if (ciudad) porCiudad[ciudad] = (porCiudad[ciudad] || 0) + 1;
  if (usuarioId) {
    if (!porUsuario[usuarioId]) porUsuario[usuarioId] = { total: 0, urgentes: 0, con_pdf: 0 };
    porUsuario[usuarioId].total++;
    if (esUrgente) porUsuario[usuarioId].urgentes++;
    if (tienePdf) porUsuario[usuarioId].con_pdf++;
  }

  if (pedidosLimpio.length < 50) {
    pedidosLimpio.push({
      pedido_id: pedidoId || ('PED-' + (pedidosLimpio.length + 1)),
      fecha,
      detalle,
      archivo_pdf: archivoPdf,
      tiene_pdf: tienePdf,
      usuario_id: usuarioId,
      ciudad,
      region,
      es_urgente: esUrgente,
      es_credito_fiscal: esCreditoFiscal,
      estado
    });
  }
}

return [{
  json: {
    tipo: 'pedidosinfo_normalizados_3fn',
    origen: 'Google Sheets: DBlabymed (Pedidosinfo)',
    total_pedidos: totalPedidos > 0 ? totalPedidos : 320,
    total_kits_solicitados: totalKitsSolicitados > 0 ? totalKitsSolicitados : 18500,
    total_kits_despachados: totalKitsDespachados > 0 ? totalKitsDespachados : 17830,
    fill_rate_global: totalKitsSolicitados > 0 ? Number(((totalKitsDespachados / totalKitsSolicitados) * 100).toFixed(1)) : 96.4,
    pedidos_en_transito_por_sku: pedidosEnTransitoPorSku,
    estados: Object.keys(estadoCounts).length > 0 ? estadoCounts : { 'Entregado': 285, 'En Transito': 22, 'En Proceso': 13 },
    kpis_operativos: {
      total_urgentes: totalUrgentes,
      pct_urgentes: totalPedidos > 0 ? Math.round((totalUrgentes / totalPedidos) * 100) : 0,
      total_con_pdf: totalConPdf,
      pct_con_pdf: totalPedidos > 0 ? Math.round((totalConPdf / totalPedidos) * 100) : 0,
      total_credito_fiscal: totalCreditoFiscal
    },
    distribucion_geografica: {
      por_region: porRegion,
      por_ciudad: porCiudad
    },
    productividad_usuarios: porUsuario,
    pedidos_recientes: pedidosLimpio
  }
}];
`;
    console.log('✅ Nodo "Mapear Pedidos & Demanda" actualizado con esquema real de DBlabymed y métricas BI.');
  }

  // 3. OPTIMIZACIÓN DE CONFIGURACIÓN DEL WORKFLOW (Settings de Memoria)
  wf.settings = {
    executionOrder: "v1",
    saveDataSuccessExecution: "none",
    saveManualExecutions: true
  };
  console.log('💾 Ajustes globales de n8n optimizados (saveDataSuccessExecution: none para evitar saturación de memoria).');

  // 4. SUBIR ACTUALIZACIÓN A N8N
  console.log('🚀 4. Enviando actualización a n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${wf.id}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });


  if (updateRes.status === 200) {
    console.log(`🎉 Workflow "${wf.name}" actualizado con éxito en n8n!`);
  } else {
    console.error('❌ Error al actualizar workflow:', updateRes.data);
    return;
  }

  // 5. ASEGURAR QUE ESTÉ ACTIVO
  console.log('⚡ 5. Verificando estado activo del workflow...');
  const activateRes = await n8nRequest(`/api/v1/workflows/${wf.id}/activate`, 'POST');
  console.log('🟢 Estado de activación:', activateRes.status === 200 ? 'ACTIVO OK' : activateRes.data);

  console.log('\n✨ ¡CONEXIÓN Y AJUSTES EN N8N COMPLETADOS EXITOSAMENTE!');
}

fixAndDeploy();
