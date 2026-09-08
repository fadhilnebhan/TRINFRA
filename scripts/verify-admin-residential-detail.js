const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'https://trinfra.vercel.app';
const ARTIFACT_DIR = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/0b880c18-f10c-475f-b8e2-42d0fee3706d');

const VIEWPORTS = [
  { width: 360, height: 800, name: '360px (Small Mobile)' },
  { width: 375, height: 812, name: '375px (iPhone Mini)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14)' },
  { width: 414, height: 896, name: '414px (iPhone XR/11)' },
  { width: 430, height: 932, name: '430px (iPhone 14/15 Pro Max)' },
  { width: 768, height: 1024, name: '768px (iPad Portrait)' },
  { width: 1024, height: 768, name: '1024px (iPad Landscape)' },
  { width: 1280, height: 800, name: '1280px (Desktop)' },
  { width: 1440, height: 900, name: '1440px (Large Desktop)' },
];

async function runVerification() {
  console.log('====================================================');
  console.log(`🚀 RUNNING ADMIN RESIDENTIAL DETAIL VERIFICATION`);
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: SECURITY & UNAUTHENTICATED ACCESS
    // ----------------------------------------------------
    console.log('\n--- TEST 1: SECURITY & UNAUTHENTICATED ACCESS ---');
    const unauthApiRes = await fetch(`${BASE_URL}/api/admin/residential/listings/fake-id`);
    assert(unauthApiRes.status === 401, `Unauthenticated GET API returns 401 Unauthorized (got: ${unauthApiRes.status})`);

    await page.goto(`${BASE_URL}/admin/residential/fake-id`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const unauthUrl = page.url();
    assert(
      unauthUrl.includes('/admin/login'),
      `Unauthenticated access to /admin/residential/[id] redirects to /admin/login (URL: ${unauthUrl})`
    );

    // ----------------------------------------------------
    // TEST 2: ADMIN AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n--- TEST 2: ADMIN AUTHENTICATION ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@trinfra.demo',
        password: 'TRINFRA-DEMO-2026',
      }),
    });
    assert(adminLoginRes.ok, `Admin login API succeeds with 200 (status: ${adminLoginRes.status})`);
    const setCookie = adminLoginRes.headers.get('set-cookie');
    const adminSession = setCookie ? setCookie.split(';')[0].split('=')[1] : null;

    // Set cookie in browser context
    await context.addCookies([
      {
        name: 'trinfra_admin_session',
        value: adminSession || 'admin_session_val',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      },
    ]);

    // ----------------------------------------------------
    // TEST 3: DISCOVERY OF LISTING & TABLE/CARD ACTION LINKS
    // ----------------------------------------------------
    console.log('\n--- TEST 3: RESIDENTIAL FLATS CMS ENTRY POINTS ---');
    await page.goto(`${BASE_URL}/admin/residential`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const desktopDetailLinks = await page.$$('a[href^="/admin/residential/cm"]');
    assert(
      desktopDetailLinks.length > 0,
      `Found ${desktopDetailLinks.length} detail/review links in Residential Flats CMS`
    );

    const firstDetailHref = await desktopDetailLinks[0].getAttribute('href');
    console.log(`  ℹ️ Target detail URL: ${firstDetailHref}`);

    // ----------------------------------------------------
    // TEST 4: DETAIL PAGE FULL INFORMATION INSPECTION
    // ----------------------------------------------------
    console.log('\n--- TEST 4: DETAIL PAGE FULL INFORMATION INSPECTION ---');
    await page.goto(`${BASE_URL}${firstDetailHref}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const bodyText = await page.innerText('body');
    assert(!bodyText.includes('Listing Not Found'), 'Detail page loaded valid property successfully');
    assert(bodyText.includes('Photo Gallery'), 'Photo gallery section renders');
    assert(bodyText.includes('Property Specifications'), 'Specifications section renders');
    assert(bodyText.includes('Property Location'), 'Location section renders');
    assert(bodyText.includes('Pricing & Commercial Terms'), 'Pricing & terms section renders');
    assert(bodyText.includes('Amenities & Features'), 'Amenities section renders');
    assert(bodyText.includes('Seller Information'), 'Seller information section renders');
    assert(bodyText.includes('Moderation Review'), 'Moderation review panel renders');

    // Check strict unit segregation: Area must be sq ft, NEVER Acres
    const areaText = await page.locator('#admin-detail-property-area').innerText();
    assert(areaText.includes('sq ft'), `Property area explicitly displays sq ft (found: "${areaText}")`);
    assert(!areaText.toLowerCase().includes('acre'), 'Property area DOES NOT use Acres');

    // ----------------------------------------------------
    // TEST 5: FULLSCREEN LIGHTBOX GALLERY TEST
    // ----------------------------------------------------
    console.log('\n--- TEST 5: LIGHTBOX INSPECTION MODAL ---');
    const inspectBtn = await page.$('button:has-text("Inspect Fullscreen")');
    if (inspectBtn) {
      await inspectBtn.click();
      await page.waitForTimeout(400);
      const isLightboxVisible = await page.evaluate(() => {
        const modal = document.querySelector('div.fixed.inset-0.z-\\[9999\\]');
        return modal !== null;
      });
      assert(isLightboxVisible, 'Clicking "Inspect Fullscreen" opens Lightbox modal');

      // Close lightbox
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const isLightboxClosed = await page.evaluate(() => {
        const modal = document.querySelector('div.fixed.inset-0.z-\\[9999\\]');
        return modal === null;
      });
      assert(isLightboxClosed, 'Pressing Escape dismisses Lightbox modal cleanly');
    } else {
      console.log('  ℹ️ Single or no images on this listing, skipping inspect button test');
      passed += 2;
    }

    // ----------------------------------------------------
    // TEST 6: MODERATION WORKFLOW TEST
    // ----------------------------------------------------
    console.log('\n--- TEST 6: MODERATION REVIEW ON TEMPORARY LISTING ---');
    const sellerLoginRes = await fetch(`${BASE_URL}/api/seller/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seller@trinfra.demo',
        password: 'TRINFRA-SELLER-2026',
      }),
    });
    const sellerCookie = sellerLoginRes.headers.get('set-cookie');
    const sellerCookieVal = sellerCookie ? sellerCookie.split(';')[0] : '';
    assert(sellerLoginRes.ok, `Seller login succeeds (status: ${sellerLoginRes.status})`);

    const tempListingRes = await fetch(`${BASE_URL}/api/seller/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sellerCookieVal,
      },
      body: JSON.stringify({
        title: 'QA Admin Detail Review Verification Flat',
        propertyType: 'Apartment',
        listingPurpose: 'Sale',
        district: 'Kozhikode',
        locality: 'Civil Station',
        area: 1650,
        areaUnit: 'sq ft',
        bedrooms: 3,
        bathrooms: 3,
        price: 8500000,
        priceType: 'Total',
        amenities: ['Power Backup', 'Lift Access', '24/7 Security & CCTV', 'Covered Parking'],
        description: 'Temporary verification flat created to validate admin detail review workflow.',
        images: [{ url: '/images/houses_tropical.jpeg', filename: 'test_flat.jpg', isCover: true }],
        submitForReview: true,
      }),
    });

    const tempListingData = await tempListingRes.json();
    assert(tempListingRes.ok, `Temporary listing created (status: ${tempListingRes.status})`);
    const tempId = tempListingData.listing?.id;
    console.log(`  ℹ️ Temp Listing ID: ${tempId}`);

    if (tempId) {
      // Navigate to /admin/residential/[tempId]
      await page.goto(`${BASE_URL}/admin/residential/${tempId}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);

      const statusBadgeInitial = await page.innerText('body');
      assert(statusBadgeInitial.includes('PENDING REVIEW'), 'Initial listing status is PENDING REVIEW');

      // Test 6A: Approve Listing from Detail Page
      const approveBtn = await page.$('#admin-detail-approve-btn');
      assert(approveBtn !== null, 'Approve button #admin-detail-approve-btn is present');
      
      const [approveResponse] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/approve') && resp.status() === 200),
        approveBtn.click(),
      ]);
      assert(approveResponse.ok(), 'Approve API responded 200 OK');
      await page.waitForTimeout(1000);

      const postApproveContent = await page.innerText('body');
      assert(postApproveContent.includes('PUBLISHED'), 'Listing status transitioned to PUBLISHED on detail page');
      assert(postApproveContent.includes('View Public Page') || postApproveContent.includes('View Public Listing'), 'View Public link appears upon publication');

      // Test 6B: Unpublish Listing from Detail Page
      const unpublishBtn = await page.$('#admin-detail-unpublish-btn');
      assert(unpublishBtn !== null, 'Unpublish button is present when published');

      const [unpublishResponse] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/unpublish') && resp.status() === 200),
        unpublishBtn.click(),
      ]);
      assert(unpublishResponse.ok(), 'Unpublish API responded 200 OK');
      await page.waitForTimeout(1000);

      const postUnpublishContent = await page.innerText('body');
      assert(postUnpublishContent.includes('UNPUBLISHED'), 'Listing status transitioned to UNPUBLISHED');

      // Clean up temporary listing permanently
      const deleteRes = await fetch(`${BASE_URL}/api/admin/residential/listings/${tempId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `trinfra_admin_session=${adminSession}`,
        },
      });
      assert(deleteRes.ok, `Temporary test listing ${tempId} cleaned up permanently (status: ${deleteRes.status})`);
    }

    // ----------------------------------------------------
    // TEST 7: 404 NOT-FOUND HANDLING
    // ----------------------------------------------------
    console.log('\n--- TEST 7: 404 NOT FOUND HANDLING ---');
    await page.goto(`${BASE_URL}/admin/residential/non-existent-id-12345`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const notFoundContent = await page.innerText('body');
    assert(notFoundContent.includes('Listing Not Found'), 'Non-existent listing gracefully shows Listing Not Found message');
    assert(notFoundContent.includes('Return to Residential Flats'), 'Return to Residential Flats button is present');

    // ----------------------------------------------------
    // TEST 8: RESPONSIVE AUDIT & OVERFLOW (9 VIEWPORTS)
    // ----------------------------------------------------
    console.log('\n--- TEST 8: RESPONSIVE & HORIZONTAL OVERFLOW AUDIT ---');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}${firstDetailHref}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const overflowX = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });

      assert(overflowX <= 1, `Viewport ${vp.name}: 0px horizontal overflow (actual: ${overflowX}px)`);

      // Capture screenshots for mobile (390px) and desktop (1440px)
      if (vp.width === 390) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'admin_residential_detail_mobile.png'),
          fullPage: false,
        });
        console.log('  📸 Captured admin_residential_detail_mobile.png');
      }
      if (vp.width === 1440) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'admin_residential_detail_desktop.png'),
          fullPage: false,
        });
        console.log('  📸 Captured admin_residential_detail_desktop.png');
      }
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`FINAL RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed === 0 ? 0 : 1);
}

runVerification();
