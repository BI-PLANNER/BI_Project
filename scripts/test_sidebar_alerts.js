const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- TEST PLAYWRIGHT: SIDEBAR ALERTAS BOTON ---');
  
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  try {
    // 1. Ir a login
    console.log('1. Navegando a login en http://localhost:3008/login ...');
    await page.goto('http://localhost:3008/login', { waitUntil: 'networkidle', timeout: 20000 });

    // 2. Iniciar sesión como Lenny
    console.log('2. Iniciando sesión...');
    await page.fill('input[type="email"]', 'jose.gomez@labandmed.com');
    await page.fill('input[type="password"]', 'Planner2026*');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**', { timeout: 15000 });
    console.log('Login exitoso. URL actual:', page.url());

    await page.waitForTimeout(2000);

    // 3. Tomar captura del Sidebar con el nuevo botón de Alertas abajo de Dashboard Obligaciones
    const sidebarShotPath = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2\\playwright_sidebar_alertas.png';
    await page.screenshot({ path: sidebarShotPath, fullPage: false });
    console.log('Captura de sidebar guardada en:', sidebarShotPath);

    // 4. Hacer clic en el botón de Alertas en el Sidebar
    console.log('4. Clickeando el botón de Alertas en el sidebar...');
    const alertButton = page.locator('aside button[title*="Alertas"]');
    await alertButton.waitFor({ state: 'visible', timeout: 5000 });
    await alertButton.click();

    // 5. Esperar que se abra el modal del Centro de Alertas
    console.log('5. Esperando modal del Centro de Alertas...');
    await page.waitForSelector('text=Centro de Alertas: Oferta vs. Demanda', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // 6. Tomar captura del Centro de Alertas Abierto
    const modalShotPath = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2\\playwright_alertas_modal_opened.png';
    await page.screenshot({ path: modalShotPath, fullPage: false });
    console.log('Captura del modal de alertas abierta guardada en:', modalShotPath);

    console.log('--- TEST PLAYWRIGHT EXITOSO ---');
  } catch (err) {
    console.error('Error durante el test de Playwright:', err);
  } finally {
    await browser.close();
  }
})();
