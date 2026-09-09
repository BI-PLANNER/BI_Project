const https = require('https');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno si existen
let N8N_API_KEY = process.env.N8N_API_KEY || '';
const N8N_HOST = process.env.N8N_HOST || 'n8n.cyberedu.my';

if (!N8N_API_KEY) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/N8N_API_KEY\s*=\s*(.+)/);
    if (match) {
      N8N_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {}
}

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
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (err) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function deploy() {
  console.log('🚀 Iniciando despliegue de Workflow en n8n:', `https://${N8N_HOST}`);
  
  if (!N8N_API_KEY) {
    console.error('❌ Error: Falta la API Key de n8n (X-N8N-API-KEY).');
    console.log('ℹ️ Para generarla: Entra a https://n8n.cyberedu.my -> Settings (⚙️) -> n8n API -> Create API Key.');
    console.log('Luego pásame la clave o agrégala a .env.local como N8N_API_KEY=...');
    process.exit(1);
  }

  try {
    // 1. Verificar conexión
    console.log('🔍 1. Validando autenticación con n8n API...');
    const listRes = await n8nRequest('/api/v1/workflows?limit=10');
    
    if (listRes.status !== 200) {
      console.error(`❌ Error de autenticación (${listRes.status}):`, listRes.data);
      process.exit(1);
    }

    console.log('✅ Autenticación exitosa con n8n!');
    const workflows = listRes.data.data || [];
    console.log(`📋 Workflows existentes encontrados: ${workflows.length}`);

    // 2. Cargar archivo local de workflow
    const workflowPath = path.join(__dirname, 'workflow_n8n_master_etl_dashboards.json');
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

    const targetName = workflowData.name;
    const existing = workflows.find(w => w.name === targetName || w.name.includes('ETL DBlabymed'));

    let workflowId = null;

    if (existing) {
      console.log(`🔄 2. Actualizando workflow existente [ID: ${existing.id} - ${existing.name}]...`);
      const updateRes = await n8nRequest(`/api/v1/workflows/${existing.id}`, 'PUT', {
        name: targetName,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || {}
      });

      if (updateRes.status === 200) {
        console.log('✅ Workflow actualizado exitosamente!');
        workflowId = existing.id;
      } else {
        console.error('❌ Error al actualizar workflow:', updateRes.data);
      }
    } else {
      console.log(`✨ 2. Creando nuevo workflow [${targetName}] en n8n...`);
      const createRes = await n8nRequest('/api/v1/workflows', 'POST', {
        name: targetName,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || {}
      });

      if (createRes.status === 200 || createRes.status === 201) {
        workflowId = createRes.data.id;
        console.log(`✅ Workflow creado exitosamente! [ID: ${workflowId}]`);
      } else {
        console.error('❌ Error al crear workflow:', createRes.data);
      }
    }

    // 3. Activar Workflow
    if (workflowId) {
      console.log(`⚡ 3. Activando workflow [ID: ${workflowId}]...`);
      const activateRes = await n8nRequest(`/api/v1/workflows/${workflowId}/activate`, 'POST');
      if (activateRes.status === 200) {
        console.log('🟢 Workflow ACTIVO y listo para procesar ejecuciones.');
      } else {
        console.log('ℹ️ Estado de activación:', activateRes.data);
      }
    }

    console.log('\n🎉 Proceso de sincronización completado.');

  } catch (error) {
    console.error('❌ Excepción durante el despliegue:', error.message);
  }
}

deploy();
