const { chromium } = require('playwright');

const BASE_URL = process.env.TEST_URL || 'https://trinfra.vercel.app';

const VIEWPORTS = [
  { width: 360, height: 740, name: '360px' },
  { width: 375, height: 667, name: '375px' },
  { width: 390, height: 844, name: '390px' },
  { width: 414, height: 896, name: '414px' },
  { width: 430, height: 932, name: '430px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1024, height: 768, name: '1024px' },
  { width: 1280, height: 800, name: '1280px' },
  { width: 1440, height: 900, name: '1440px' }
];

async function verify() {
  console.log('Starting District Bar & All Kerala Refinement Verification on', BASE_URL);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let allPassed = true;

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing Viewport ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/residential`, { waitUntil: 'networkidle', timeout: 30000 });

    // 1. Check selector element styles at top
    const selectorDetails = await page.evaluate(() => {
      // Find "All Kerala" button first
      const buttons = Array.from(document.querySelectorAll('button'));
      const allKeralaBtn = buttons.find(b => b.textContent?.includes('All Kerala'));
      const section = allKeralaBtn ? allKeralaBtn.closest('section') : null;
      if (!section) return { error: 'District selector section not found' };

      const computedStyle = window.getComputedStyle(section);
      const boundingInitial = section.getBoundingClientRect();

      let btnStyles = null;
      if (allKeralaBtn) {
        const btnComputed = window.getComputedStyle(allKeralaBtn);
        btnStyles = {
          boxShadow: btnComputed.boxShadow,
          outline: btnComputed.outline,
          border: btnComputed.border,
          className: allKeralaBtn.className
        };
      }

      return {
        position: computedStyle.position,
        top: computedStyle.top,
        zIndex: computedStyle.zIndex,
        initialBoundingY: boundingInitial.y,
        initialHeight: boundingInitial.height,
        btnStyles
      };
    });

    if (selectorDetails.error) {
      console.error(`❌ [FAIL] ${vp.name}: ${selectorDetails.error}`);
      allPassed = false;
      continue;
    }

    const isPositionNormal = selectorDetails.position === 'static' || selectorDetails.position === 'relative';
    console.log(`  Position computed: "${selectorDetails.position}" (normal document flow: ${isPositionNormal ? 'PASS' : 'FAIL'})`);
    if (!isPositionNormal) allPassed = false;

    // 2. Scroll test: scroll down 800px
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);

    const scrolledDetails = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const allKeralaBtn = buttons.find(b => b.textContent?.includes('All Kerala'));
      const section = allKeralaBtn ? allKeralaBtn.closest('section') : null;
      if (!section) return { error: 'Section not found after scroll' };

      const boundingScrolled = section.getBoundingClientRect();
      const scrollY = window.scrollY;

      return {
        scrollY,
        scrolledBoundingY: boundingScrolled.y,
        scrolledBottom: boundingScrolled.bottom
      };
    });

    console.log(`  After scrolling ${scrolledDetails.scrollY}px: section top is at ${scrolledDetails.scrolledBoundingY}px (leaves viewport naturally: ${scrolledDetails.scrolledBottom <= 100 ? 'YES' : 'NO'})`);
    const leftViewport = scrolledDetails.scrolledBoundingY < 0;
    if (!leftViewport) {
      console.error(`❌ [FAIL] ${vp.name}: District selector did not scroll away!`);
      allPassed = false;
    } else {
      console.log(`  ✅ [PASS] ${vp.name}: District selector leaves viewport naturally without sticking`);
    }

    // Check All Kerala button styling
    const btn = selectorDetails.btnStyles;
    if (btn) {
      const hasGoldGlow = btn.className.includes('ring-accent') || btn.boxShadow.includes('rgba(217,') || btn.boxShadow.includes('rgb(217,');
      const hasSubtleElevation = btn.boxShadow.includes('rgba(14, 33, 21') || btn.className.includes('shadow-');
      console.log(`  All Kerala class: "${btn.className}"`);
      console.log(`  All Kerala shadow: "${btn.boxShadow}"`);
      console.log(`  Gold glow removed: ${!hasGoldGlow ? 'YES (PASS)' : 'NO (FAIL)'}`);
      console.log(`  Subtle elevation shadow present: ${hasSubtleElevation ? 'YES (PASS)' : 'NO (FAIL)'}`);
      if (hasGoldGlow || !hasSubtleElevation) allPassed = false;
    } else {
      console.error(`❌ [FAIL] ${vp.name}: All Kerala button not found`);
      allPassed = false;
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const returnDetails = await page.evaluate(() => window.scrollY);
    console.log(`  Scroll back to top: scrollY = ${returnDetails}px (smooth return)`);
  }

  await browser.close();

  if (allPassed) {
    console.log('\n====================================================');
    console.log('🎉 ALL SCROLL AND VISUAL CHECKS PASSED ON ALL 9 VIEWPORTS!');
    console.log('====================================================');
  } else {
    console.error('\n❌ SOME CHECKS FAILED');
    process.exit(1);
  }
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
