const { chromium } = require('playwright-core');

(async () => {
  console.log('--- INSPECCIONANDO VERCEL EN VIVO (https://control-planner.vercel.app) ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('Navegando a https://control-planner.vercel.app/login ...');
    const response = await page.goto('https://control-planner.vercel.app/login', { waitUntil: 'domcontentloaded' });
    console.log('Status code:', response.status());

    // Iniciar sesión
    const lennyBtn = await page.$('text=José Lenny Gómez');
    if (lennyBtn) {
      console.log('Botón José Lenny Gómez detectado.');
      await lennyBtn.click();
      await page.waitForTimeout(300);
    }
    await page.click('button:has-text("Ingresar")');
    await page.waitForTimeout(3000);

    console.log('URL tras login:', page.url());

    // Captura de pantalla de Vercel en Vivo
    const screenshotPath = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2\\playwright_vercel_live_actual.png';
    await page.screenshot({ path: screenshotPath });
    console.log('📸 Captura de Vercel en vivo guardada en:', screenshotPath);

    // Revisar enlaces del sidebar en Vercel
    const links = await page.$$eval('aside nav a, aside nav button', elements => 
      elements.map(el => el.innerText.trim().replace(/\n/g, ' '))
    );
    console.log('Elementos en sidebar en Vercel:');
    links.forEach((l, i) => console.log(`   ${i + 1}. ${l}`));

  } catch (err) {
    console.error('Error inspeccionando Vercel:', err);
  } finally {
    await browser.close();
  }
})();
