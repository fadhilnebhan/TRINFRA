const { chromium } = require('playwright');

const TARGET_URL = 'https://trinfra.vercel.app';

const ROUTES = [
  {
    name: 'Opportunities',
    path: '/opportunities',
    linkText: 'Opportunities',
    pageIndicator: 'text=Investment-Ready Clusters',
  },
  {
    name: 'Projects',
    path: '/projects',
    linkText: 'Projects',
    pageIndicator: 'text=Active Land Pooling Projects',
  },
  {
    name: 'Residential',
    path: '/residential',
    linkText: 'Residential',
    pageIndicator: 'text=Verified Residential Properties',
  },
  {
    name: 'How It Works',
    path: '/how-it-works',
    linkText: 'How It Works',
    pageIndicator: 'text=The Land Pooling Process',
  },
  {
    name: 'Landowners',
    path: '/#landowners',
    linkText: 'Landowners',
    pageIndicator: '#landowners',
  },
  {
    name: 'Developers & Investors',
    path: '/#developers',
    linkText: 'Developers & Investors',
    pageIndicator: '#developers',
  },
  {
    name: 'Knowledge Centre',
    path: '/knowledge-centre/what-is-land-pooling',
    linkText: 'Knowledge Centre',
    pageIndicator: 'text=What is Land Pooling?',
  },
  {
    name: 'About',
    path: '/about',
    linkText: 'About',
    pageIndicator: 'text=Transforming Fragmented Land',
  },
];

async function measureExact() {
  const browser = await chromium.launch({ headless: true });

  const results = [];

  for (const route of ROUTES) {
    // 1. Cold Direct Navigation (Fresh Incognito Context)
    const coldContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const coldPage = await coldContext.newPage();
    const coldStart = Date.now();
    await coldPage.goto(`${TARGET_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
    await coldPage.waitForSelector(route.pageIndicator, { timeout: 15000 });
    const coldFmc = Date.now() - coldStart;
    await coldPage.waitForLoadState('networkidle');
    const coldTti = Date.now() - coldStart;
    await coldContext.close();

    // 2. Navbar Navigation (Warm context from home page)
    const warmContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const warmPage = await warmContext.newPage();
    await warmPage.goto(TARGET_URL, { waitUntil: 'networkidle' });

    const navLink = warmPage.locator(`nav a:has-text("${route.linkText}")`).first();
    const navStart = Date.now();
    await navLink.click();
    await warmPage.waitForSelector(route.pageIndicator, { timeout: 15000 });
    const navbarFmc = Date.now() - navStart;
    await warmPage.waitForLoadState('networkidle');
    const navbarTti = Date.now() - navStart;

    // 3. Repeat Navigation (navigate to /about, then click navbar link again)
    await warmPage.goto(`${TARGET_URL}/about`, { waitUntil: 'networkidle' });
    const repeatLink = warmPage.locator(`nav a:has-text("${route.linkText}")`).first();
    const repeatStart = Date.now();
    await repeatLink.click();
    await warmPage.waitForSelector(route.pageIndicator, { timeout: 15000 });
    const repeatFmc = Date.now() - repeatStart;

    // 4. Refresh Timing
    const refreshStart = Date.now();
    await warmPage.reload({ waitUntil: 'domcontentloaded' });
    await warmPage.waitForSelector(route.pageIndicator, { timeout: 15000 });
    const refreshFmc = Date.now() - refreshStart;

    await warmContext.close();

    console.log(`[${route.name}] Cold: ${coldFmc}ms | Navbar: ${navbarFmc}ms | Repeat: ${repeatFmc}ms | Refresh: ${refreshFmc}ms`);

    results.push({
      route: route.name,
      path: route.path,
      coldFmc,
      coldTti,
      navbarFmc,
      navbarTti,
      repeatFmc,
      refreshFmc,
    });
  }

  await browser.close();

  console.log('\n========================================================================');
  console.log('  EXACT BASELINE MEASUREMENTS (LIVE PRODUCTION https://trinfra.vercel.app)');
  console.log('========================================================================');
  console.table(results.map(r => ({
    'Route': r.route,
    'Cold FMC': `${r.coldFmc}ms`,
    'Navbar FMC': `${r.navbarFmc}ms`,
    'Repeat FMC': `${r.repeatFmc}ms`,
    'Refresh FMC': `${r.refreshFmc}ms`,
  })));
}

measureExact().catch(console.error);
