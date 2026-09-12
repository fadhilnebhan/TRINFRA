const { chromium } = require('playwright');

const TARGET_URL = process.argv[2] || 'https://trinfra.vercel.app';

const ROUTES = [
  { name: 'Opportunities', path: '/opportunities', selector: 'text=Investment-Ready Clusters, h1:has-text("Opportunities"), text=Land Pooling Opportunities' },
  { name: 'Projects', path: '/projects', selector: 'h1:has-text("Projects"), text=Active Land Pooling Projects, text=Development Portfolio' },
  { name: 'Residential', path: '/residential', selector: 'h1:has-text("Residential"), text=Verified Residential Properties, text=Find Verified Homes' },
  { name: 'How It Works', path: '/how-it-works', selector: 'h1:has-text("How It Works"), text=The Land Pooling Process' },
  { name: 'Landowners', path: '/landowners', selector: 'h1:has-text("Landowners"), text=Empowering Kerala Landowners, text=Landowners' },
  { name: 'Developers & Investors', path: '/developers-investors', selector: 'h1:has-text("Developers"), text=Institutional Grade, text=Development Partners' },
  { name: 'Knowledge Centre', path: '/knowledge-centre', selector: 'h1:has-text("Knowledge"), text=Land Pooling Knowledge, text=Knowledge Base' },
  { name: 'About', path: '/about', selector: 'h1:has-text("About"), text=About Trinfra, text=Transforming Land' },
];

async function measureRoute(browser, route) {
  // 1. Cold Direct Navigation (Fresh incognito context)
  const coldContext = await browser.newContext();
  const coldPage = await coldContext.newPage();
  
  const coldStart = Date.now();
  await coldPage.goto(`${TARGET_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
  const coldDom = Date.now() - coldStart;
  
  // Wait for meaningful content
  try {
    await coldPage.waitForSelector(route.selector, { timeout: 15000 });
  } catch (e) {
    // fallback wait
    await coldPage.waitForLoadState('networkidle');
  }
  const coldComplete = Date.now() - coldStart;
  await coldContext.close();

  // 2. Navbar Navigation (Warm context starting from homepage)
  const warmContext = await browser.newContext();
  const warmPage = await warmContext.newPage();
  await warmPage.goto(TARGET_URL, { waitUntil: 'networkidle' });

  // Find navbar link
  const linkSelector = `nav a[href="${route.path}"], header a[href="${route.path}"], a:has-text("${route.name}")`;
  const navLink = warmPage.locator(linkSelector).first();
  
  let navbarTime = 0;
  let repeatTime = 0;

  if (await navLink.count() > 0) {
    const navStart = Date.now();
    await Promise.all([
      warmPage.waitForURL(`**${route.path}**`),
      navLink.click()
    ]);
    try {
      await warmPage.waitForSelector(route.selector, { timeout: 15000 });
    } catch (e) {
      await warmPage.waitForLoadState('networkidle');
    }
    navbarTime = Date.now() - navStart;

    // 3. Repeat Navigation (back to home, then click again)
    await warmPage.goto(TARGET_URL, { waitUntil: 'networkidle' });
    const repeatLink = warmPage.locator(linkSelector).first();
    const repeatStart = Date.now();
    await Promise.all([
      warmPage.waitForURL(`**${route.path}**`),
      repeatLink.click()
    ]);
    try {
      await warmPage.waitForSelector(route.selector, { timeout: 15000 });
    } catch (e) {
      await warmPage.waitForLoadState('networkidle');
    }
    repeatTime = Date.now() - repeatStart;
  } else {
    // If link not in top nav directly, simulate client navigation
    const navStart = Date.now();
    await warmPage.evaluate((path) => window.location.href = path, route.path);
    await warmPage.waitForLoadState('networkidle');
    navbarTime = Date.now() - navStart;
    repeatTime = navbarTime;
  }

  await warmContext.close();

  return {
    route: route.path,
    name: route.name,
    coldDom,
    coldComplete,
    navbarTime,
    repeatTime
  };
}

async function run() {
  console.log(`Starting real performance baseline measurement on ${TARGET_URL}...\n`);
  const browser = await chromium.launch({ headless: true });

  const results = [];
  for (const route of ROUTES) {
    process.stdout.write(`Measuring ${route.name} (${route.path})... `);
    const m = await measureRoute(browser, route);
    console.log(`Cold: ${m.coldComplete}ms | Navbar: ${m.navbarTime}ms | Repeat: ${m.repeatTime}ms`);
    results.push(m);
  }

  await browser.close();

  console.log('\n=============================================================');
  console.log('  BASELINE PRODUCTION NAVIGATION PERFORMANCE');
  console.log('=============================================================');
  console.table(results.map(r => ({
    'Route': r.route,
    'Cold Direct (ms)': r.coldComplete,
    'Navbar Nav (ms)': r.navbarTime,
    'Repeat Nav (ms)': r.repeatTime,
  })));

  return results;
}

run().catch(console.error);
