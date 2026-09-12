const { chromium } = require('playwright');

const TARGET_URL = 'https://trinfra.vercel.app';

const TEST_ROUTES = [
  { name: 'Opportunities', path: '/opportunities', selector: 'text=Discover Land', isHash: false },
  { name: 'Projects', path: '/projects', selector: 'text=From Land Opportunity to', isHash: false },
  { name: 'Residential', path: '/residential', selector: 'text=Find a Home', isHash: false },
  { name: 'How It Works', path: '/how-it-works', selector: 'text=SIMPLE. STRUCTURED. TRANSPARENT.', isHash: false },
  { name: 'Landowners', path: '/#landowners', selector: '#landowners', isHash: true },
  { name: 'Developers & Investors', path: '/#developers', selector: '#developers', isHash: true },
  { name: 'Knowledge Centre', path: '/knowledge-centre', selector: 'text=What is Land Pooling?', isHash: false },
  { name: 'About', path: '/about', selector: 'text=Building Better Communities', isHash: false },
];

async function measureColdDirect(browser, route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const start = Date.now();
  let firstResponseTime = 0;

  page.on('response', () => {
    if (!firstResponseTime) firstResponseTime = Date.now() - start;
  });

  const url = `${TARGET_URL}${route.path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const domTime = Date.now() - start;

  await page.waitForSelector(route.selector, { timeout: 15000 });
  const fmcTime = Date.now() - start;

  await page.waitForLoadState('networkidle');
  const ttiTime = Date.now() - start;

  await context.close();

  return {
    firstResponse: firstResponseTime || domTime,
    domContent: domTime,
    meaningfulContent: fmcTime,
    interactive: ttiTime,
  };
}

async function measureNavbarNav(page, route) {
  // Go to homepage first
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  let navSelector = '';
  if (route.isHash) {
    navSelector = `nav a[href="${route.path}"], a:has-text("${route.name.split(' ')[0]}")`;
  } else {
    navSelector = `nav a[href^="${route.path}"], a:has-text("${route.name}")`;
  }

  const navLink = page.locator(navSelector).first();
  const exists = await navLink.count() > 0;
  if (!exists) {
    return { firstResponse: 0, meaningfulContent: 0, interactive: 0 };
  }

  const start = Date.now();
  let firstResponseTime = 0;

  const onResponse = () => {
    if (!firstResponseTime) firstResponseTime = Date.now() - start;
  };
  page.on('response', onResponse);

  await navLink.click();
  await page.waitForSelector(route.selector, { timeout: 15000 });
  const fmcTime = Date.now() - start;

  page.off('response', onResponse);
  const ttiTime = Date.now() - start;

  return {
    firstResponse: firstResponseTime || fmcTime,
    meaningfulContent: fmcTime,
    interactive: ttiTime,
  };
}

async function measureRepeatNav(page, route) {
  // Navigate away to /about, then back to route
  if (route.path !== '/about') {
    await page.goto(`${TARGET_URL}/about`, { waitUntil: 'networkidle' });
  } else {
    await page.goto(`${TARGET_URL}/how-it-works`, { waitUntil: 'networkidle' });
  }

  const navSelector = route.isHash
    ? `nav a[href="${route.path}"], a:has-text("${route.name.split(' ')[0]}")`
    : `nav a[href^="${route.path}"], a:has-text("${route.name}")`;

  const navLink = page.locator(navSelector).first();
  if (await navLink.count() === 0) {
    return { firstResponse: 0, meaningfulContent: 0, interactive: 0 };
  }

  const start = Date.now();
  let firstResponseTime = 0;
  const onResponse = () => {
    if (!firstResponseTime) firstResponseTime = Date.now() - start;
  };
  page.on('response', onResponse);

  await navLink.click();
  await page.waitForSelector(route.selector, { timeout: 15000 });
  const fmcTime = Date.now() - start;

  page.off('response', onResponse);
  return {
    firstResponse: firstResponseTime || fmcTime,
    meaningfulContent: fmcTime,
    interactive: Date.now() - start,
  };
}

async function run() {
  console.log('===============================================================');
  console.log(`  PHASE 1: LIVE PRODUCTION PERFORMANCE BASELINE`);
  console.log(`  Target: ${TARGET_URL}`);
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const warmContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const warmPage = await warmContext.newPage();

  const report = [];

  for (const r of TEST_ROUTES) {
    process.stdout.write(`Testing ${r.name}... `);

    // A. Cold Direct (Incognito)
    const cold = await measureColdDirect(browser, r);

    // B. Navbar Navigation
    const navbar = await measureNavbarNav(warmPage, r);

    // C. Repeat Navigation
    const repeat = await measureRepeatNav(warmPage, r);

    console.log(`Cold: ${cold.meaningfulContent}ms | Navbar: ${navbar.meaningfulContent}ms | Repeat: ${repeat.meaningfulContent}ms`);

    report.push({
      route: r.name,
      path: r.path,
      coldResponse: cold.firstResponse,
      coldFmc: cold.meaningfulContent,
      coldTti: cold.interactive,
      navResponse: navbar.firstResponse,
      navFmc: navbar.meaningfulContent,
      navTti: navbar.interactive,
      repeatFmc: repeat.meaningfulContent,
    });
  }

  await warmContext.close();
  await browser.close();

  console.log('\n===============================================================');
  console.log('  PHASE 1 BASELINE MEASUREMENTS COMPLETE');
  console.log('===============================================================');
  console.table(report.map(row => ({
    'Route': row.route,
    'Cold FMC (ms)': row.coldFmc,
    'Cold TTI (ms)': row.coldTti,
    'Navbar FMC (ms)': row.navFmc,
    'Navbar TTI (ms)': row.navTti,
    'Repeat FMC (ms)': row.repeatFmc,
  })));

  return report;
}

run().catch(console.error);
