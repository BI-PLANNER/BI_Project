const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://control-planner.vercel.app/login');
  await page.click('text=José Lenny Gómez');
  await page.click('button:has-text("Ingresar")');
  await page.waitForTimeout(2000);

  await page.goto('https://control-planner.vercel.app/dashboard/contratos');
  await page.waitForTimeout(2000);

  await page.click('button:has-text("Nuevo Contrato")');
  await page.waitForTimeout(500);

  const parents = await page.evaluate(() => {
    const modalEl = document.querySelector('[class*="fixed inset-0"]');
    if (!modalEl) return ['modal not found'];
    const list = [];
    let curr = modalEl.parentElement;
    while (curr && curr !== document.body) {
      const style = window.getComputedStyle(curr);
      list.push({
        tag: curr.tagName,
        className: curr.className,
        transform: style.transform,
        filter: style.filter,
        backdropFilter: style.backdropFilter,
        perspective: style.perspective,
        contain: style.contain,
        willChange: style.willChange
      });
      curr = curr.parentElement;
    }
    return list;
  });

  console.log('Parents of modal:', JSON.stringify(parents, null, 2));
  await browser.close();
}

run().catch(console.error);
