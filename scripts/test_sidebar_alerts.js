const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('--- TEST PLAYWRIGHT: SIDEBAR DEDICATED ALERTAS WIDGET ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3008';

  try {
    console.log('1. Navegando a login...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

    const lennyBtn = await page.$('text=José Lenny Gómez');
    if (lennyBtn) {
      await lennyBtn.click();
      await page.waitForTimeout(300);
    }
    await page.click('button:has-text("Ingresar")');
    await page.waitForTimeout(2000);

    console.log('2. Navegando a /dashboard/contratos...');
    await page.goto(`${baseUrl}/dashboard/contratos`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const artifactDir = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2';
    const sidebarShotPath = path.join(artifactDir, 'playwright_sidebar_alertas_widget.png');
    await page.screenshot({ path: sidebarShotPath });
    console.log('📸 Screenshot sidebar con botón Alertas guardado en:', sidebarShotPath);

    console.log('3. Haciendo clic en el widget de Alertas en el Sidebar...');
    const alertBtn = page.locator('aside button[title*="Alertas"]');
    await alertBtn.waitFor({ state: 'visible', timeout: 5000 });
    await alertBtn.click();
    await page.waitForTimeout(1500);

    const modalShotPath = path.join(artifactDir, 'playwright_modal_alertas_opened.png');
    await page.screenshot({ path: modalShotPath });
    console.log('📸 Screenshot modal abierto guardado en:', modalShotPath);

    console.log('--- TEST PLAYWRIGHT EXITOSO ---');
  } catch (err) {
    console.error('Error en test:', err);
  } finally {
    await browser.close();
  }
})();
