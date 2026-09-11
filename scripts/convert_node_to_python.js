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

async function convertExcelNodeToPython() {
  console.log('📥 Obteniendo workflow actual...');
  const wfRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  if (wfRes.status !== 200) {
    console.error('Error al obtener workflow:', wfRes.data);
    return;
  }

  const wf = wfRes.data;

  // Nodo Python para Mapear Licitaciones
  const pythonCode = `# ==========================================================================
# LIMPIEZA & NORMALIZACIÓN 3FN DE LICITACIONES (PYTHON EN N8N)
# ==========================================================================
items = _input.all()
licitaciones = []

for item in items:
    row = item.get("json", {})
    
    # Mapeo exacto de columnas del Excel Online de SharePoint:
    # A: AÑO, B: Mes, C: EMPR, D: INS, E: Cliente, F: TIPO DE PROCESO
    # G: No. Oferta, H: Nombre Oferta, I: Presentación
    no_oferta = str(row.get("No. Oferta") or row.get("No Oferta") or row.get("Oferta") or "").strip()
    nombre_oferta = str(row.get("Nombre Oferta") or row.get("Nombre de Oferta") or row.get("Descripción") or "").strip()
    cliente = str(row.get("Cliente") or row.get("CLIENTE") or "").strip()
    institucion = str(row.get("INS") or row.get("Institución") or row.get("Institucion") or "MINSAL").strip().upper()
    empresa = str(row.get("EMPR") or row.get("Empresa") or "LAB&MED").strip().upper()
    tipo_proceso = str(row.get("TIPO DE PROCESO") or row.get("Tipo Proceso") or "LICITACION COMPETITIVA").strip().upper()
    anio = str(row.get("AÑO") or row.get("Año") or row.get("ANIO") or "2026").strip()
    mes = str(row.get("Mes") or row.get("MES") or "").strip().upper()
    presentacion = str(row.get("Presentación") or row.get("Presentacion") or "").strip()
    
    if not no_oferta and not nombre_oferta and not cliente:
        continue
        
    licitaciones.append({
        "no_oferta": no_oferta,
        "nombre_oferta": nombre_oferta,
        "cliente": cliente,
        "institucion": institucion,
        "empresa": empresa,
        "tipo_proceso": tipo_proceso,
        "anio": anio,
        "mes": mes,
        "presentacion": presentacion,
        "fuente": "Microsoft Excel 365 (SharePoint Lab&Med)"
    })

return [{
    "json": {
        "tipo": "licitaciones_excel_365_3fn",
        "total_licitaciones": len(licitaciones),
        "licitaciones": licitaciones
    }
}]`;

  const mapNode = wf.nodes.find(n => n.id === 'transform-licitaciones-365');
  if (mapNode) {
    mapNode.parameters = {
      language: "python",
      pythonCode: pythonCode
    };
    console.log('✅ Nodo Mapear Licitaciones actualizado a lenguaje Python.');
  }

  console.log('📤 Enviando workflow actualizado a n8n...');
  const updateRes = await n8nRequest(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: "v1"
    }
  });

  if (updateRes.status === 200) {
    console.log('🎉 ¡ÉXITO! Nodo de Mapeo convertido a Python en n8n.');
  } else {
    console.error('Error al actualizar:', updateRes.data);
  }
}

convertExcelNodeToPython();
