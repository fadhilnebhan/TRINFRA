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
        `Mobile (${vp.width}px): Filter position is static (actual: ${filterInfo.position})`
      );
      assert(
        filterInfo.position !== 'sticky' && filterInfo.position !== 'fixed',
        `Mobile (${vp.width}px): Filter is strictly not sticky or fixed`
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

    // 2. Perform scroll down 300px
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
        position: cs.position
      };
    });

    console.log(`  Scrolled 300px: window.scrollY=${scroll300.scrollY}, filter rect.y=${scroll300.filterY.toFixed(1)}px`);
    if (vp.isMobile) {
      // In normal document flow, filter moves up exactly by 300px
      const delta = Math.abs((filterInfo.rectY - 300) - scroll300.filterY);
      assert(
        delta < 2,
        `Mobile (${vp.width}px): Filter moves naturally in document flow (y=${scroll300.filterY.toFixed(1)}px, delta=${delta.toFixed(1)}px)`
      );
    }

    // 3. Scroll until first opportunity card is clearly visible
    const scrollCardResult = await page.evaluate(() => {
      // Find first card
      const firstCard = document.querySelector('a[href^="/opportunities/"]');
      if (!firstCard) return { error: 'No opportunity card found' };

      // Scroll so first card top is comfortably in viewport (e.g., at y = 150px)
      const initialCardRect = firstCard.getBoundingClientRect();
      const targetScroll = window.scrollY + initialCardRect.top - 150;
      window.scrollTo(0, targetScroll);

      return { targetScroll };
    });

    await page.waitForTimeout(300);

    const cardState = await page.evaluate(() => {
      const searchBtn = document.getElementById('search-btn');
      const filterSection = searchBtn.closest('section');
      const filterRect = filterSection.getBoundingClientRect();
      const filterCs = window.getComputedStyle(filterSection);

      const firstCard = document.querySelector('a[href^="/opportunities/"]');
      const cardRect = firstCard ? firstCard.getBoundingClientRect() : null;

      // Check if filter section obscures the card
      let obscuresCard = false;
      if (cardRect && filterRect.bottom > 72 && filterRect.top < window.innerHeight) {
        // Filter is somewhere in the viewport
        if (!(filterRect.bottom <= cardRect.top || filterRect.top >= cardRect.bottom)) {
          obscuresCard = true;
        }
      }

      return {
        scrollY: window.scrollY,
        filterTop: filterRect.top,
        filterBottom: filterRect.bottom,
        cardTop: cardRect ? cardRect.top : null,
        cardBottom: cardRect ? cardRect.bottom : null,
        obscuresCard,
        filterPosition: filterCs.position
      };
    });

    console.log(`  Scrolled to Card: scrollY=${cardState.scrollY.toFixed(1)}px, filterBottom=${cardState.filterBottom.toFixed(1)}px, cardTop=${cardState.cardTop ? cardState.cardTop.toFixed(1) : 'null'}px`);

    if (vp.isMobile) {
      assert(
        cardState.filterBottom <= 72,
        `Mobile (${vp.width}px): Filter section has completely left the viewport (filterBottom: ${cardState.filterBottom.toFixed(1)}px <= 72px)`
      );
      assert(
        !cardState.obscuresCard,
        `Mobile (${vp.width}px): Opportunity card is 100% unobscured by filter section`
      );
    } else {
      assert(
        cardState.filterPosition === 'sticky',
        `Desktop (${vp.width}px): Filter position is sticky at top 72px as designed`
      );
    }

    // 4. Test interactivity when scrolling back to top
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

    // 5. Check horizontal overflow
    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    assert(
      overflowX <= 1,
      `Viewport (${vp.width}px): 0px horizontal overflow (actual: ${overflowX}px)`
    );

    // 6. Capture screenshot for 390px (mobile) and 1440px (desktop) when scrolled to card
    if (vp.width === 390 || vp.width === 1440) {
      await page.evaluate(() => {
        const firstCard = document.querySelector('a[href^="/opportunities/"]');
        if (firstCard) {
          const rect = firstCard.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top - 120);
        }
      });
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

  assert(consoleErrors.length === 0, `No console errors encountered across all tests`);

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
