const { chromium } = require('playwright');

const BASE_URL = process.env.TEST_URL || 'https://trinfra.vercel.app';

const VIEWPORTS = [
  { name: '360x740 (Small Android)', width: 360, height: 740 },
  { name: '375x667 (iPhone SE)', width: 375, height: 667 },
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '414x896 (iPhone XR/11)', width: 414, height: 896 },
  { name: '430x932 (iPhone 14/15 Pro Max)', width: 430, height: 932 },
  { name: '768x1024 (Tablet Portrait)', width: 768, height: 1024 },
  { name: '1024x768 (Tablet Landscape / Small Laptop)', width: 1024, height: 768 },
  { name: '1280x800 (Laptop)', width: 1280, height: 800 },
  { name: '1440x900 (Desktop)', width: 1440, height: 900 }
];

const ROUTES = [
  '/',
  '/opportunities',
  '/residential',
  '/residential/modern-2-bhk-urban-flat-kakkanad-infopark',
  '/register',
  '/seller',
  '/seller/login',
  '/admin/residential'
];

async function runAudit() {
  console.log('====================================================');
  console.log(`🚀 RUNNING RESPONSIVE VIEWPORT & OVERFLOW AUDIT`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Viewports: ${VIEWPORTS.length} | Routes: ${ROUTES.length}`);
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let totalTests = 0;
  let passedTests = 0;
  let failures = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Testing Viewport: ${vp.name} [${vp.width}x${vp.height}]`);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const route of ROUTES) {
      totalTests++;
      const fullUrl = `${BASE_URL}${route}`;
      try {
        await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // wait 1s for any dynamic layouts / hydration
        await page.waitForTimeout(1000);

        const metrics = await page.evaluate(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;
          const hasOverflow = scrollWidth > innerWidth || bodyScrollWidth > innerWidth;

          // Check broken images
          const images = Array.from(document.querySelectorAll('img'));
          const brokenImages = images.filter(img => img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:')).map(img => img.src);

          return {
            scrollWidth,
            innerWidth,
            bodyScrollWidth,
            hasOverflow,
            brokenImagesCount: brokenImages.length,
            brokenImages
          };
        });

        if (metrics.hasOverflow) {
          failures.push({
            viewport: vp.name,
            route,
            reason: `Horizontal overflow: scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth}, bodyScrollWidth=${metrics.bodyScrollWidth}`
          });
          console.log(`  ❌ [FAIL] ${route} -> Overflow detected (${metrics.scrollWidth}px > ${metrics.innerWidth}px)`);
        } else if (metrics.brokenImagesCount > 0) {
          failures.push({
            viewport: vp.name,
            route,
            reason: `Broken images: ${metrics.brokenImages.join(', ')}`
          });
          console.log(`  ❌ [FAIL] ${route} -> ${metrics.brokenImagesCount} broken images found`);
        } else {
          passedTests++;
          console.log(`  ✅ [PASS] ${route} -> 0px overflow, images OK (scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth})`);
        }
      } catch (err) {
        failures.push({
          viewport: vp.name,
          route,
          reason: `Navigation error: ${err.message}`
        });
        console.log(`  ❌ [ERROR] ${route} -> ${err.message}`);
      }
    }
  }

  await browser.close();

  console.log('\n====================================================');
  console.log(`AUDIT SUMMARY: ${passedTests}/${totalTests} PASSED`);
  if (failures.length > 0) {
    console.log(`FAILURES (${failures.length}):`);
    failures.forEach(f => console.log(`  - [${f.viewport}] ${f.route}: ${f.reason}`));
    process.exit(1);
  } else {
    console.log(`🎉 ALL VIEWPORTS & ROUTES HAVE 0 HORIZONTAL OVERFLOW & 0 BROKEN IMAGES!`);
    console.log('====================================================\n');
  }
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
