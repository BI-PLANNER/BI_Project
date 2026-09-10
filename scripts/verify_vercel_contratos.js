const { chromium } = require('playwright-core');

(async () => {
  console.log('--- VERIFICANDO CONTRATOS EN VERCEL EN VIVO ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  try {
    await page.goto('https://control-planner.vercel.app/login', { waitUntil: 'domcontentloaded' });
    const lennyBtn = await page.$('text=José Lenny Gómez');
    if (lennyBtn) await lennyBtn.click();
    await page.click('button:has-text("Ingresar")');
    await page.waitForTimeout(2000);

    await page.goto('https://control-planner.vercel.app/dashboard/contratos', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const shotPath = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2\\playwright_vercel_contratos_live.png';
    await page.screenshot({ path: shotPath });
    console.log('📸 Screenshot de Vercel en vivo guardado en:', shotPath);

  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
