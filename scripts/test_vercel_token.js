async function testVercelToken() {
  const token = 'stk_pnH2DOdvxsiqmEwiTqpDmd';
  const endpoints = [
    'https://api.vercel.com/v9/projects/control-planner',
    'https://api.vercel.com/v2/user',
    'https://api.vercel.com/v6/deployments'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log(`Endpoint: ${ep}`);
      console.log(`Status: ${res.status}`);
      console.log('Data:', JSON.stringify(data).slice(0, 200));
    } catch (e) {
      console.error('Error:', e);
    }
  }
}

testVercelToken();
