const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🚀 Iniciando prueba automatizada con Playwright...');
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
  } catch (err) {
    console.log('Intentando con msedge...');
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const baseUrl = 'https://control-planner.vercel.app';
  console.log(`📍 Navegando a ${baseUrl}/login...`);
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 30000 });

  // Seleccionar perfil rápido "José Lenny Gómez" y dar click en Ingresar
  console.log('🔑 Iniciando sesión como José Lenny Gómez...');
  const lennyBtn = await page.$('text=José Lenny Gómez');
  if (lennyBtn) {
    await lennyBtn.click();
    await page.waitForTimeout(300);
  }

  await page.click('button:has-text("Ingresar")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1500);

  console.log('📍 Navegando a /dashboard/contratos...');
  await page.goto(`${baseUrl}/dashboard/contratos`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  const artifactDir = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2';
  const screenshot1 = path.join(artifactDir, 'playwright_contratos_page.png');
  await page.screenshot({ path: screenshot1 });
  console.log('📸 Screenshot contratos dashboard capturado:', screenshot1);

  console.log('🖱️ Haciendo clic en "+ Nuevo Contrato"...');
  await page.click('button:has-text("Nuevo Contrato")');
  await page.waitForTimeout(1000);

  const screenshot2 = path.join(artifactDir, 'playwright_modal_arriba.png');
  await page.screenshot({ path: screenshot2 });
  console.log('📸 Screenshot modal arriba capturado:', screenshot2);

  // Llenar formulario de prueba
  console.log('✍️ Completando formulario de prueba...');
  await page.fill('input[placeholder*="SM-022"]', 'CT-PLAYWRIGHT-TOP');
  await page.fill('input[placeholder="0.00"]', '35000');
  await page.fill('input[placeholder*="Suministro de reactivos"]', 'Prueba automatizada de modal alineado arriba');

  const screenshot3 = path.join(artifactDir, 'playwright_modal_filled.png');
  await page.screenshot({ path: screenshot3 });
  console.log('📸 Screenshot formulario completado:', screenshot3);

  await browser.close();
  console.log('🎉 ¡Validación de Playwright finalizada con éxito!');
}

run().catch(err => {
  console.error('❌ Error en prueba Playwright:', err);
  process.exit(1);
});
