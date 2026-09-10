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
    console.log('Chrome no encontrado directamente, intentando con msedge...');
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('📍 Navegando a http://localhost:3000/dashboard/contratos...');
  await page.goto('http://localhost:3000/dashboard/contratos', { waitUntil: 'networkidle' });

  const artifactDir = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2';
  const screenshot1 = path.join(artifactDir, 'playwright_contratos_initial.png');
  await page.screenshot({ path: screenshot1 });
  console.log('📸 Screenshot inicial capturado:', screenshot1);

  console.log('🖱️ Haciendo clic en "+ Nuevo Contrato"...');
  await page.click('button:has-text("Nuevo Contrato")');
  await page.waitForTimeout(800);

  const screenshot2 = path.join(artifactDir, 'playwright_modal_arriba.png');
  await page.screenshot({ path: screenshot2 });
  console.log('📸 Screenshot modal arriba capturado:', screenshot2);

  // Verificar campos del modal
  console.log('✍️ Completando formulario de prueba...');
  await page.fill('input[placeholder*="SM-022"]', 'CT-PLAYWRIGHT-2026');
  await page.fill('input[placeholder="0.00"]', '15000');
  await page.fill('input[placeholder*="Suministro de reactivos"]', 'Contrato Validación Playwright Top Modal');

  const screenshot3 = path.join(artifactDir, 'playwright_modal_filled.png');
  await page.screenshot({ path: screenshot3 });
  console.log('📸 Screenshot formulario completado:', screenshot3);

  console.log('💾 Guardando contrato...');
  await page.click('button:has-text("Guardar Contrato")');
  await page.waitForTimeout(2000);

  const screenshot4 = path.join(artifactDir, 'playwright_contrato_creado.png');
  await page.screenshot({ path: screenshot4 });
  console.log('📸 Screenshot contrato registrado en lista:', screenshot4);

  // Buscar el contrato creado y eliminarlo para limpieza
  console.log('🧹 Limpiando contrato de prueba...');
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  const deleteBtn = await page.$('div:has-text("CT-PLAYWRIGHT-2026") button[title="Eliminar Contrato"]');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    console.log('✅ Contrato de prueba eliminado limpiamente.');
  }

  await browser.close();
  console.log('🎉 ¡Prueba de Playwright finalizada con éxito!');
}

run().catch(err => {
  console.error('❌ Error en prueba Playwright:', err);
  process.exit(1);
});
