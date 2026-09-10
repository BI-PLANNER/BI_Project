const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function testSidebar() {
  console.log('--- TEST PLAYWRIGHT: SIDEBAR ORDER & STOCK BI ---');
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
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 30000 });

    const lennyBtn = await page.$('text=José Lenny Gómez');
    if (lennyBtn) {
      await lennyBtn.click();
      await page.waitForTimeout(300);
    }
    await page.click('button:has-text("Ingresar")');
    await page.waitForTimeout(2000);

    console.log('2. Navegando a /dashboard/contratos...');
    await page.goto(`${baseUrl}/dashboard/contratos`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Captura del sidebar completo
    const artifactDir = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2';
    const sidebarShotPath = path.join(artifactDir, 'playwright_sidebar_stock_abajo.png');
    await page.screenshot({ path: sidebarShotPath });
    console.log('📸 Screenshot guardado en:', sidebarShotPath);

    // Verificar orden de los elementos del sidebar
    const sidebarLinks = await page.$$eval('aside nav a', links => links.map(l => l.innerText.trim().replace(/\n/g, ' ')));
    console.log('📋 Elementos del sidebar en orden:');
    sidebarLinks.forEach((item, idx) => console.log(`   ${idx + 1}. ${item}`));

    console.log('--- TEST PLAYWRIGHT EXITOSO ---');
  } catch (err) {
    console.error('Error en test:', err);
  } finally {
    await browser.close();
  }
}

testSidebar();
