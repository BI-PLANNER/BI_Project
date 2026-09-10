const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🚀 Iniciando prueba automatizada con Playwright en localhost:3008...');
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

  const baseUrl = 'http://localhost:3008';
  console.log(`📍 Navegando a ${baseUrl}/login...`);
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 30000 });

  // Iniciar sesión
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
  await page.fill('input[placeholder*="SM-022"]', 'CT-PLAYWRIGHT-TOP-001');
  await page.fill('input[placeholder="0.00"]', '45000');
  await page.fill('input[placeholder*="Suministro de reactivos"]', 'Prueba automatizada de modal posicionado arriba');

  const screenshot3 = path.join(artifactDir, 'playwright_modal_filled.png');
  await page.screenshot({ path: screenshot3 });
  console.log('📸 Screenshot formulario completado:', screenshot3);

  // Guardar contrato
  console.log('💾 Guardando contrato...');
  await page.click('button:has-text("Guardar Contrato")');
  await page.waitForTimeout(2000);

  const screenshot4 = path.join(artifactDir, 'playwright_contrato_guardado.png');
  await page.screenshot({ path: screenshot4 });
  console.log('📸 Screenshot contrato registrado:', screenshot4);

  // Limpiar contrato de prueba
  console.log('🧹 Limpiando contrato de prueba...');
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  const deleteBtn = await page.$('div:has-text("CT-PLAYWRIGHT-TOP-001") button[title="Eliminar Contrato"]');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    console.log('✅ Contrato de prueba eliminado limpiamente.');
  }

  await browser.close();
  console.log('🎉 ¡Validación completa con Playwright exitosa!');
}

run().catch(err => {
  console.error('❌ Error en prueba Playwright:', err);
  process.exit(1);
});
