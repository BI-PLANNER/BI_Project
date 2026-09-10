async function triggerDeploy() {
  const projectId = 'prj_PkI9zRVls0t3Ek6JCs0PLmYwGgJA';
  const hookToken = 'stk_pnH2DOdvxsiqmEwiTqpDmd';

  const urls = [
    `https://api.vercel.com/v1/integrations/deploy/${projectId}/${hookToken}`,
    `https://api.vercel.com/v1/integrations/deploy/${hookToken}`
  ];

  for (const url of urls) {
    console.log(`Intentando POST a ${url}...`);
    try {
      const res = await fetch(url, {
        method: 'POST'
      });
      const text = await res.text();
      console.log(`Respuesta [Status ${res.status}]:`, text);
      if (res.ok) {
        console.log('🎉 DESPLIEGUE EN VERCEL DISPARADO CON ÉXITO!');
        return;
      }
    } catch (err) {
      console.error('Error haciendo request:', err);
    }
  }
}

triggerDeploy();
