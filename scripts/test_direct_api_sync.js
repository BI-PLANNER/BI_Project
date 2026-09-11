const https = require('https');

async function testEndpointSync() {
  const payload = {
    action: 'sync_excel_licitaciones',
    table: 'sync_excel_licitaciones',
    licitaciones: [
      {
        no_oferta: "LC 01/2025",
        nombre_oferta: "SUMINISTRO DE REACTIVOS E INSUMOS DE LABORATORIO AÑO 2025.",
        cliente: "HOSPITAL NACIONAL \"DR. JORGE MAZZINI VILLACORTA\", SONSONATE.",
        institucion: "MINSAL",
        empresa: "LABYMED",
        tipo_proceso: "LICITACION COMPETITIVA",
        anio: "2025",
        mes: "MARZO",
        presentacion: "45726",
        producto: "HEPATITIS B",
        marca: "ABBOTT",
        precio_unitario: 1.1,
        cantidad: 500,
        total_ofertado: 550,
        estatus_item: "ADJUDICADA"
      },
      {
        no_oferta: "LC 01/2025",
        nombre_oferta: "SUMINISTRO DE REACTIVOS E INSUMOS DE LABORATORIO AÑO 2025.",
        cliente: "HOSPITAL NACIONAL \"DR. JORGE MAZZINI VILLACORTA\", SONSONATE.",
        institucion: "MINSAL",
        empresa: "LABYMED",
        tipo_proceso: "LICITACION COMPETITIVA",
        anio: "2025",
        mes: "MARZO",
        presentacion: "45726",
        producto: "HEPATITIS C",
        marca: "ABBOTT",
        precio_unitario: 1.2,
        cantidad: 500,
        total_ofertado: 600,
        estatus_item: "ADJUDICADA"
      }
    ]
  };

  const postData = JSON.stringify(payload);

  const req = https.request('https://control-planner.vercel.app/api/db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('Status code:', res.statusCode);
      console.log('Response body:', data);
    });
  });

  req.write(postData);
  req.end();
}

testEndpointSync();
