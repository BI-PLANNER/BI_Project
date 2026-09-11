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

async function configureGenerousTimeouts() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // 1. Configurar timeout generoso en el nodo HTTP Supabase (5 minutos = 300000ms)
  const syncNode = wf.nodes.find(n => n.id === 'sync-supabase-licitaciones-diarias' || (n.name && n.name.includes('Licitaciones & Ofertas')));
  if (syncNode) {
    syncNode.parameters = {
      method: "POST",
      url: "https://control-planner.vercel.app/api/db",
      sendBody: true,
      specifyBody: "json",
      jsonBody: "={{ JSON.stringify({ action: 'sync_excel_licitaciones', table: 'sync_excel_licitaciones', licitaciones: $json.licitaciones }) }}",
      options: {
        timeout: 300000
      }
    };
    console.log('✅ Nodo HTTP Sync configurado con timeout de 300,000 ms (5 min).');
  }

  // 2. Configurar timeout en los nodos de sincronización de inventario y mensajería
  wf.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.httpRequest') {
      node.parameters.options = {
        ...(node.parameters.options || {}),
        timeout: 300000
      };
    }
  });

  // 3. Configuración de workflow soportada por n8n
  wf.settings = {
    executionOrder: "v1",
    saveDataSuccessExecution: "all",
    saveExecutionProgress: true,
    saveManualExecutions: true
  };

  // 4. Asegurar que el mapeo capture el 100% de las filas de BD Oferta
  const jsCode = `// ==========================================================================
// LIMPIEZA & NORMALIZACIÓN 3FN DE TODAS LAS OFERTAS DE BD OFERTA (EXCEL 365)
// ==========================================================================
const items = $input.all();
const licitaciones = [];

for (const item of items) {
  const row = item.json || {};
  
  const no_oferta = String(row['No. Oferta'] || row['No Oferta'] || row['Oferta'] || row['No. OFERTA'] || row['NO. OFERTA'] || '').trim();
  const nombre_oferta = String(row['Nombre Oferta'] || row['Nombre de Oferta'] || row['Descripción'] || row['DESCRIPCION'] || row['NOMBRE DE OFERTA'] || '').trim();
  const cliente = String(row['Cliente'] || row['CLIENTE'] || row['Institución'] || row['INS'] || '').trim();
  const institucion = String(row['INS'] || row['Institución'] || row['Institucion'] || 'MINSAL').trim().toUpperCase();
  const empresa = String(row['EMPR'] || row['Empresa'] || 'LAB&MED').trim().toUpperCase();
  const tipo_proceso = String(row['TIPO DE PROCESO'] || row['Tipo Proceso'] || 'LICITACION COMPETITIVA').trim().toUpperCase();
  const anio = String(row['AÑO'] || row['Año'] || row['ANIO'] || '2026').trim();
  const mes = String(row['Mes'] || row['MES'] || '').trim().toUpperCase();
  const presentacion = String(row['Presentación'] || row['Presentacion'] || '').trim();

  // Filtrar solo filas completamente vacías
  if (!no_oferta && !nombre_oferta && !cliente) continue;

  licitaciones.push({
    no_oferta: no_oferta || ('OFERTA-' + (licitaciones.length + 1)),
    nombre_oferta: nombre_oferta || 'Licitación / Oferta ' + no_oferta,
    cliente: cliente || 'MINSAL',
    institucion: institucion || 'MINSAL',
    empresa: empresa || 'LAB&MED',
    tipo_proceso: tipo_proceso || 'LICITACION COMPETITIVA',
    anio: anio || '2026',
    mes: mes || 'MARZO',
    presentacion: presentacion || '',
    fuente: 'Microsoft Excel 365 (SharePoint Lab&Med)'
  });
}

return [{
  json: {
    tipo: 'licitaciones_excel_365_3fn',
    total_licitaciones: licitaciones.length,
    licitaciones: licitaciones
  }
}];`;

  const mapNode = wf.nodes.find(n => n.id === 'transform-licitaciones-365');
  if (mapNode) {
    mapNode.parameters = {
      mode: 'runOnceForAllItems',
      jsCode: jsCode
    };
    console.log('✅ Nodo de Mapeo actualizado para capturar el 100% de registros válidos.');
  }

  console.log('📤 Enviando actualización de workflow a n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings
  });

  if (updateRes.status === 200) {
    console.log('🎉 Workflow actualizado con éxito con tiempos y timeouts extendidos.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

configureGenerousTimeouts();
