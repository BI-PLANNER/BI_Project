const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const pagesToAudit = [
  { url: '/dashboard/contratos', name: '01_contratos_raci', title: 'Contratos & RACI' },
  { url: '/dashboard/stock', name: '02_stock_inventario_bi', title: 'Stock & Inventario BI' },
  { url: '/dashboard/pedidos', name: '03_envios_mensajeria', title: 'Envíos & Mensajería BI' },
  { url: '/dashboard/obligaciones', name: '04_dashboard_obligaciones', title: 'Dashboard Obligaciones' },
  { url: '/dashboard/planner', name: '05_panel_planner', title: 'Panel Planner' },
  { url: '/dashboard/garantias', name: '06_garantias', title: 'Garantías' },
  { url: '/dashboard/tablas', name: '07_gestion_tablas', title: 'Gestión por Tablas (21)' },
  { url: '/dashboard/reporte', name: '08_reporte_actividades', title: 'Reporte de Actividades' }
];

async function captureDesignSystemTour() {
  console.log('--- AUDITORÍA & CAPTURA VISUAL DE DESIGN SYSTEM ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3008';
  const artifactDir = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2';

  try {
    // 1. Login
    console.log('Iniciando sesión como José Lenny Gómez...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    const lennyBtn = await page.$('text=José Lenny Gómez');
    if (lennyBtn) {
      await lennyBtn.click();
      await page.waitForTimeout(300);
    }
    await page.click('button:has-text("Ingresar")');
    await page.waitForTimeout(2000);

    // 2. Iterar sobre cada página y capturar
    for (const item of pagesToAudit) {
      console.log(`📸 Capturando página: ${item.title} (${item.url})...`);
      await page.goto(`${baseUrl}${item.url}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const shotPath = path.join(artifactDir, `ds_tour_${item.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`   Guardado: ds_tour_${item.name}.png`);
    }

    console.log('✨ Auditoría visual de Design System completada exitosamente.');
  } catch (err) {
    console.error('Error durante la auditoría:', err);
  } finally {
    await browser.close();
  }
}

captureDesignSystemTour();
