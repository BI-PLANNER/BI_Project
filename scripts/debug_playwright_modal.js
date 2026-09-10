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
  await page.waitForTimeout(1000);

  const modalInfo = await page.evaluate(() => {
    const modalEl = document.querySelector('[class*="fixed inset-0"]');
    if (!modalEl) return { found: false };
    const rect = modalEl.getBoundingClientRect();
    const card = modalEl.querySelector('div');
    const cardRect = card ? card.getBoundingClientRect() : null;
    return {
      found: true,
      modalRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      cardRect: cardRect ? { top: cardRect.top, left: cardRect.left, width: cardRect.width, height: cardRect.height } : null,
      html: card ? card.innerHTML.substring(0, 200) : null
    };
  });

  console.log('Modal Info:', JSON.stringify(modalInfo, null, 2));

  await page.screenshot({ path: 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2\\debug_modal.png' });

  await browser.close();
}

run().catch(console.error);
