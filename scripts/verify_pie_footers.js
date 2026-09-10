const { chromium } = require('playwright-core');

async function testPieFooters() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const page = await browser.newPage({ viewport: { width: 1550, height: 1000 } });

  await page.goto('https://control-planner.vercel.app/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Ingresar")');
  await page.waitForTimeout(2000);

  await page.goto('https://control-planner.vercel.app/dashboard/stock', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const inventarioTab = page.locator('button:has-text("Inventario & Lotes")').first();
  if (await inventarioTab.count() > 0) {
    await inventarioTab.click();
    await page.waitForTimeout(2500);
  }

  // Scroll down to see full charts and footers
  await page.evaluate(() => window.scrollBy(0, 680));
  await page.waitForTimeout(1000);

  const screenshotPath = 'C:\\Users\\JosèLenyGòmezEnrique\\.gemini\\antigravity-ide\\brain\\dbf09ad8-5f16-40d7-a4ff-ba55ffe0cce2\\playwright_pie_footers_full.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
}

testPieFooters().catch(console.error);
