const { chromium } = require('playwright');

const TARGET_URL = 'https://trinfra.vercel.app';
const VIEWPORTS = [360, 375, 390, 393, 414, 430, 768, 1024, 1280, 1440];

async function testViewport(browser, width) {
  const context = await browser.newContext({
    viewport: { width, height: 800 },
  });
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  // Check horizontal overflow
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const hasOverflow = scrollWidth > clientWidth;

  const results = {
    viewport: width,
    hasOverflow,
    routes: {},
  };

  const testNav = async (name, href, selector) => {
    // If mobile (< 1280), open hamburger first
    if (width < 1280) {
      const hamburger = page.locator('button[aria-label*="navigation menu"]');
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(300);
      }
    }

    const link = page.locator(`a[href="${href}"]:visible`).first();
    const start = Date.now();
    await link.click();
    await page.waitForSelector(selector, { timeout: 10000 });
    const elapsed = Date.now() - start;
    results.routes[name] = elapsed;

    // Go back to home
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  };

  await testNav('Opportunities', '/opportunities', 'text=Discover Land');
  await testNav('Projects', '/projects', 'text=From Land Opportunity to');
  await testNav('Residential', '/residential', 'text=Find a Home');

  await context.close();
  return results;
}

async function run() {
  console.log('Testing responsive viewports on live production: ' + TARGET_URL);
  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  for (const w of VIEWPORTS) {
    process.stdout.write(`Testing ${w}px... `);
    const r = await testViewport(browser, w);
    console.log(`Overflow: ${r.hasOverflow ? 'FAIL' : 'PASS'} | Opps: ${r.routes.Opportunities}ms | Proj: ${r.routes.Projects}ms | Res: ${r.routes.Residential}ms`);
    allResults.push(r);
  }

  await browser.close();
  console.log('\n--- RESPONSIVE SUMMARY ---');
  console.table(allResults.map(r => ({
    Viewport: `${r.viewport}px`,
    Overflow: r.hasOverflow ? 'FAIL' : 'PASS',
    'Opps (ms)': r.routes.Opportunities,
    'Projects (ms)': r.routes.Projects,
    'Residential (ms)': r.routes.Residential,
  })));
}

run().catch(console.error);
