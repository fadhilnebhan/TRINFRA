const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'https://trinfra.vercel.app';
const ARTIFACT_DIR = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/0b880c18-f10c-475f-b8e2-42d0fee3706d');

const VIEWPORTS = [
  { width: 360, height: 800, name: '360x800 (Small Android)', isMobile: true },
  { width: 375, height: 812, name: '375x812 (iPhone X/11/12 mini)', isMobile: true },
  { width: 390, height: 844, name: '390x844 (iPhone 12/13/14)', isMobile: true },
  { width: 393, height: 852, name: '393x852 (iPhone 14/15 Pro)', isMobile: true },
  { width: 414, height: 896, name: '414x896 (iPhone XR/11)', isMobile: true },
  { width: 430, height: 932, name: '430x932 (iPhone 14/15 Pro Max)', isMobile: true },
  { width: 768, height: 1024, name: '768x1024 (iPad Portrait)', isMobile: false },
  { width: 1024, height: 768, name: '1024x768 (iPad Landscape / Tablet)', isMobile: false },
  { width: 1280, height: 800, name: '1280x800 (Laptop / Desktop)', isMobile: false },
  { width: 1440, height: 900, name: '1440x900 (Large Desktop)', isMobile: false }
];

async function verify() {
  console.log(`Starting Opportunities Mobile Filter Verification on: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failedTests++;
    }
  }

  for (const vp of VIEWPORTS) {
    console.log(`\n==================================================`);
    console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`==================================================`);

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'networkidle', timeout: 30000 });

    // 1. Check computed styles of filter section
    const filterInfo = await page.evaluate(() => {
      const searchBtn = document.getElementById('search-btn');
      if (!searchBtn) return { error: 'Search button not found' };
      const filterSection = searchBtn.closest('section');
      if (!filterSection) return { error: 'Filter section container not found' };

      const cs = window.getComputedStyle(filterSection);
      const rect = filterSection.getBoundingClientRect();

      return {
        position: cs.position,
        top: cs.top,
        zIndex: cs.zIndex,
        rectY: rect.y,
        rectTop: rect.top,
        rectHeight: rect.height,
        docScrollY: window.scrollY
      };
    });

    if (filterInfo.error) {
      assert(false, `Filter section lookup: ${filterInfo.error}`);
      continue;
    }

    console.log(`  Initial Filter Style: position=${filterInfo.position}, top=${filterInfo.top}, zIndex=${filterInfo.zIndex}, y=${filterInfo.rectY.toFixed(1)}px, height=${filterInfo.rectHeight.toFixed(1)}px`);

    if (vp.isMobile) {
      assert(
        filterInfo.position === 'static' || filterInfo.position === 'relative',
        `Mobile (${vp.width}px): Filter position is NOT sticky and NOT fixed (actual: ${filterInfo.position})`
      );
      assert(
        filterInfo.position !== 'sticky' && filterInfo.position !== 'fixed',
        `Mobile (${vp.width}px): Filter is definitely not sticky/fixed`
      );
    } else {
      assert(
        filterInfo.position === 'sticky',
        `Desktop/Tablet (${vp.width}px): Filter preserves sticky positioning (actual: ${filterInfo.position})`
      );
      assert(
        filterInfo.top === '72px',
        `Desktop/Tablet (${vp.width}px): Filter sticky top is 72px (actual: ${filterInfo.top})`
      );
    }

    // 2. Perform real scrolling test
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(200);

    const scroll300 = await page.evaluate(() => {
      const searchBtn = document.getElementById('search-btn');
      const filterSection = searchBtn.closest('section');
      const rect = filterSection.getBoundingClientRect();
      const cs = window.getComputedStyle(filterSection);
      return {
        scrollY: window.scrollY,
        filterY: rect.y,
        filterBottom: rect.bottom,
        position: cs.position
      };
    });

    console.log(`  Scrolled 300px: window.scrollY=${scroll300.scrollY}, filter rect.y=${scroll300.filterY.toFixed(1)}px`);

    // Scroll 700px down (past hero and filter)
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForTimeout(200);

    const scroll700 = await page.evaluate(() => {
      const searchBtn = document.getElementById('search-btn');
      const filterSection = searchBtn.closest('section');
      const rect = filterSection.getBoundingClientRect();
      const cs = window.getComputedStyle(filterSection);

      // Find first opportunity card
      const cards = Array.from(document.querySelectorAll('a[href^="/opportunities/"]'));
      const cardRects = cards.slice(0, 3).map(c => {
        const r = c.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, visible: r.bottom > 72 && r.top < window.innerHeight };
      });

      let overlapsCard = false;
      if (rect.bottom > 72 && rect.top < window.innerHeight) {
        for (const cr of cardRects) {
          if (cr.visible && !(rect.bottom <= cr.top || rect.top >= cr.bottom)) {
            overlapsCard = true;
          }
        }
      }

      return {
        scrollY: window.scrollY,
        filterY: rect.y,
        filterBottom: rect.bottom,
        filterInViewport: rect.bottom > 72 && rect.top < window.innerHeight,
        overlapsCard,
        firstCardTop: cardRects[0] ? cardRects[0].top : null,
        position: cs.position
      };
    });

    console.log(`  Scrolled 700px: window.scrollY=${scroll700.scrollY}, filter rect.bottom=${scroll700.filterBottom.toFixed(1)}px, filterInViewport=${scroll700.filterInViewport}`);

    if (vp.isMobile) {
      assert(
        scroll700.filterBottom <= 100,
        `Mobile (${vp.width}px): Filter scrolled away naturally (rect.bottom=${scroll700.filterBottom.toFixed(1)}px <= 100px)`
      );
      assert(
        !scroll700.overlapsCard,
        `Mobile (${vp.width}px): Filter does NOT overlap any opportunity card`
      );
    } else {
      assert(
        scroll700.position === 'sticky',
        `Desktop (${vp.width}px): Filter is sticky as intended at top 72px`
      );
    }

    // 3. Scroll back to top and test filter interactivity
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    const districtBtn = page.locator('#filter-district');
    await districtBtn.click();
    await page.waitForTimeout(200);

    const isDistrictDropdownOpen = await page.evaluate(() => {
      const listbox = document.querySelector('[role="listbox"]');
      return !!listbox;
    });

    assert(
      isDistrictDropdownOpen,
      `Viewport (${vp.width}px): District dropdown opens interactively on click`
    );

    // Close dropdown
    await districtBtn.click();
    await page.waitForTimeout(100);

    // 4. Check horizontal overflow
    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    assert(
      overflowX <= 1,
      `Viewport (${vp.width}px): 0px horizontal overflow (scrollWidth - innerWidth = ${overflowX}px)`
    );

    // 5. Capture screenshot for 390px (mobile) and 1440px (desktop) when scrolled to 700px
    if (vp.width === 390 || vp.width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 700));
      await page.waitForTimeout(300);
      const screenshotName = vp.isMobile ? 'opportunities_mobile_scrolled_fixed.png' : 'opportunities_desktop_scrolled_fixed.png';
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, screenshotName),
        fullPage: false
      });
      console.log(`  Captured screenshot: ${screenshotName}`);
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  }

  assert(consoleErrors.length === 0, `No console errors encountered (actual: ${consoleErrors.length})`);

  console.log(`\n==================================================`);
  console.log(`FINAL RESULT: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log(`==================================================`);

  await browser.close();
  process.exit(failedTests === 0 ? 0 : 1);
}

verify().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
