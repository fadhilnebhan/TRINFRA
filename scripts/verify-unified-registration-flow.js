const { chromium } = require('playwright');

const BASE_URL = process.env.TEST_URL || 'https://trinfra.vercel.app';

async function runTest() {
  console.log('====================================================');
  console.log('🚀 RUNNING UNIFIED REGISTRATION & LISTING FLOW E2E');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: HOMEPAGE UNIFIED CTA & CHOICE MODAL
    // ----------------------------------------------------
    console.log('--- TEST 1: HOMEPAGE UNIFIED CTA & SELECTION MODAL ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const heroCta = await page.$('#hero-register-list-cta');
    assert(heroCta !== null, 'Homepage primary CTA #hero-register-list-cta exists');

    const heroCtaText = await heroCta.innerText();
    assert(heroCtaText.includes('Register / List Property'), `CTA text is "Register / List Property" (found: "${heroCtaText.trim()}")`);

    // Click CTA to open modal
    await heroCta.click();
    await page.waitForTimeout(600);

    const landChoice = await page.$('#choice-register-land-btn');
    const residentialChoice = await page.$('#choice-list-property-btn');
    assert(landChoice !== null, 'Choice Modal contains 🌿 "Register Your Land" option');
    assert(residentialChoice !== null, 'Choice Modal contains 🏠 "List Your Property" option');

    const landChoiceText = await landChoice.innerText();
    const resChoiceText = await residentialChoice.innerText();
    assert(landChoiceText.includes('Register Your Land'), 'Land card displays "Register Your Land"');
    assert(resChoiceText.includes('List Your Property'), 'Residential card displays "List Your Property"');

    // Click Land Choice -> verifies direct navigation to /register
    await landChoice.click();
    await page.waitForURL('**/register', { timeout: 15000 });
    assert(page.url().includes('/register'), `Land choice navigates to /register (URL: ${page.url()})`);

    // ----------------------------------------------------
    // TEST 2: OPPORTUNITIES CONTEXTUAL LAND BUTTON
    // ----------------------------------------------------
    console.log('\n--- TEST 2: OPPORTUNITIES CONTEXTUAL LAND CTA ---');
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const oppLandCta = await page.$('#opportunities-register-land-cta');
    assert(oppLandCta !== null, 'Opportunities page contextual CTA #opportunities-register-land-cta exists');

    const oppCtaText = await oppLandCta.innerText();
    assert(oppCtaText.includes('Register Your Land'), `Opportunities CTA text is "Register Your Land" (found: "${oppCtaText.trim()}")`);

    // Clicking directly navigates to /register without choice modal
    await oppLandCta.click();
    await page.waitForURL('**/register', { timeout: 15000 });
    assert(page.url().includes('/register'), 'Opportunities CTA navigates directly to /register without modal');

    // Step through Land Registration to verify Area = Acres and Ownership = Sole Owner
    console.log('\n--- VERIFYING LAND REGISTRATION UNITS (ACRES) & OWNERSHIP ---');
    // Step 0: You -> select Individual
    await page.click('button:has-text("Individual")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 1: Contact
    await page.fill('input[id="fullName"]', 'Test Landowner');
    await page.fill('input[id="phone"]', '9876543210');
    await page.fill('input[id="email"]', 'landowner@test.com');
    await page.click('button:has-text("WhatsApp")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 2: Location
    await page.click('button#district');
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]:has-text("Ernakulam")').first().click();
    await page.waitForTimeout(300);

    await page.click('button#localBody');
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(300);

    await page.click('#registration-next-btn');
    await page.waitForTimeout(500);

    // Step 3: Land
    const landPageContent = await page.content();
    assert(landPageContent.includes('Acres'), 'Land Registration unit includes Acres');
    assert(landPageContent.includes('Sole Owner'), 'Land Registration ownership contains "Sole Owner"');

    // ----------------------------------------------------
    // TEST 3: RESIDENTIAL CONTEXTUAL LIST PROPERTY BUTTON
    // ----------------------------------------------------
    console.log('\n--- TEST 3: RESIDENTIAL CONTEXTUAL LIST PROPERTY CTA ---');
    await page.goto(`${BASE_URL}/residential`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const resListCta = await page.$('#residential-list-property-cta');
    assert(resListCta !== null, 'Residential page contextual CTA #residential-list-property-cta exists');

    const resCtaText = await resListCta.innerText();
    assert(resCtaText.includes('List Your Property'), `Residential CTA text is "List Your Property" (found: "${resCtaText.trim()}")`);

    // Click List Your Property: if unauthenticated, redirects to seller login with redirect param
    await resListCta.click();
    await page.waitForURL(url => url.pathname.includes('/seller/'), { timeout: 10000 }).catch(() => {});
    const redirectedUrl = page.url();
    assert(
      redirectedUrl.includes('/seller/login') || redirectedUrl.includes('/seller/listings/new'),
      `Clicking "List Your Property" routes to seller login or new listing flow (URL: ${redirectedUrl})`
    );

    // ----------------------------------------------------
    // TEST 4: SELLER AUTHENTICATION & MULTI-STEP FLOW
    // ----------------------------------------------------
    console.log('\n--- TEST 4: SELLER AUTHENTICATION & MULTI-STEP RESIDENTIAL FORM ---');
    await page.goto(`${BASE_URL}/seller/login?redirect=/seller/listings/new`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Sign in using demo seller credentials
    await page.fill('input[type="email"]', 'seller@trinfra.demo');
    await page.fill('input[type="password"]', 'TRINFRA-SELLER-2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('h1:has-text("Property Type")', { timeout: 15000 });

    assert(page.url().includes('/seller/listings/new'), `Authenticated seller redirected to /seller/listings/new (URL: ${page.url()})`);

    // Verify Step 1: Property Type
    const step1Heading = await page.innerText('h1');
    assert(step1Heading.includes('Property Type'), `Step 1 header matches (found: "${step1Heading}")`);

    await page.fill('input[placeholder*="Modern 3 BHK"]', 'Panoramic Penthouse Marine Drive');
    await page.click('#residential-next-btn');
    await page.waitForTimeout(500);

    // Verify Step 2: Location
    const step2Heading = await page.innerText('h1');
    assert(step2Heading.includes('Property Location'), `Advanced to Step 2: Location (found: "${step2Heading}")`);

    await page.fill('input[placeholder*="Marine Drive, Kakkanad"]', 'Marine Drive Promenade');
    await page.click('#residential-next-btn');
    await page.waitForTimeout(500);

    // Verify Step 3: Specs & Area (CRITICAL: sq ft only)
    const step3Heading = await page.innerText('h1');
    assert(step3Heading.includes('Property Specifications'), `Advanced to Step 3: Specifications (found: "${step3Heading}")`);

    const areaInput = await page.$('#residential-property-area-input');
    assert(areaInput !== null, 'Property Area input #residential-property-area-input exists');

    const step3Content = await page.content();
    assert(step3Content.includes('sq ft'), 'Property area unit explicitly displays "sq ft"');
    assert(!step3Content.includes('Acres'), 'Residential specifications form DOES NOT contain "Acres"');

    await page.fill('#residential-property-area-input', '2450');
    await page.click('#residential-next-btn');
    await page.waitForTimeout(500);

    // Verify Step 4: Pricing
    const step4Heading = await page.innerText('h1');
    assert(step4Heading.includes('Pricing & Availability'), `Advanced to Step 4: Pricing (found: "${step4Heading}")`);

    await page.fill('input[placeholder="8500000"]', '17500000');
    await page.click('#residential-next-btn');
    await page.waitForTimeout(500);

    // Verify Step 5: Photos & Amenities
    const step5Heading = await page.innerText('h1');
    assert(step5Heading.includes('Photos & Amenities'), `Advanced to Step 5: Photos (found: "${step5Heading}")`);

    // ----------------------------------------------------
    // TEST 5: API SUBMISSION, MODERATION & SUCCESS STATE
    // ----------------------------------------------------
    console.log('\n--- TEST 5: RESIDENTIAL SUBMISSION, PENDING_REVIEW & SUCCESS STATE ---');
    const cookies = await context.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const testPayload = {
      title: 'E2E Verified Luxury Sky Villa Marine Drive',
      propertyType: 'Penthouse',
      listingPurpose: 'Sale',
      description: 'Ultra-exclusive 3 BHK sea-facing penthouse with panoramic views of Cochin Port and Marine Drive walkway.',
      district: 'Ernakulam',
      locality: 'Marine Drive Waterfront',
      address: 'Tower 4, Marine Drive Promenade',
      pincode: '682031',
      area: 2850,
      areaUnit: 'sq ft',
      bedrooms: 3,
      bathrooms: 4,
      floor: 18,
      totalFloors: 24,
      furnishedStatus: 'Fully Furnished',
      parking: '2 Covered',
      balcony: 3,
      propertyAge: 'Ready to Move',
      facing: 'West',
      price: 24500000,
      priceType: 'Total',
      negotiable: true,
      amenities: ['Swimming Pool', 'Gymnasium', '24/7 Security & CCTV', 'Power Backup', 'Sea / River View'],
      images: [
        {
          storageKey: 'test-e2e-cover',
          url: 'https://hbongewkewhjovhfpxqb.supabase.co/storage/v1/object/public/residential-images/residential/test-cover.jpg',
          filename: 'sky-villa-cover.jpg',
          mimeType: 'image/jpeg',
          size: 154200,
          isCover: true,
        },
      ],
      submitForReview: true,
    };

    const submitRes = await fetch(`${BASE_URL}/api/seller/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(testPayload),
    });

    const submitJson = await submitRes.json();
    assert(submitRes.status === 200, `POST /api/seller/listings returns 200 (status: ${submitRes.status})`);
    assert(submitJson.success === true, 'Listing created successfully');
    assert(submitJson.listing?.status === 'PENDING_REVIEW', `Listing initial status is PENDING_REVIEW (got: "${submitJson.listing?.status}")`);
    assert(submitJson.listing?.areaUnit === 'sq ft', `Listing areaUnit is "sq ft" (got: "${submitJson.listing?.areaUnit}")`);
    assert(submitJson.listing?.area === 2850, `Listing area is 2850 sq ft (got: ${submitJson.listing?.area})`);

    const createdListingId = submitJson.listing?.id;
    console.log(`  ℹ️ Created Listing ID: ${createdListingId}`);

    // Verify Admin Moderation: Approve the listing
    console.log('\n--- TEST 6: ADMIN MODERATION & PUBLICATION ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@trinfra.demo',
        password: 'TRINFRA-DEMO-2026',
      }),
    });
    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    const setCookieHeader = adminLoginRes.headers.get('set-cookie');
    const adminAuthCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';

    const approveRes = await fetch(`${BASE_URL}/api/admin/residential/listings/${createdListingId}/approve`, {
      method: 'POST',
      headers: {
        'Cookie': adminAuthCookie,
      },
    });

    const approveJson = await approveRes.json();
    assert(approveRes.status === 200, `Admin approval returns 200 OK (status: ${approveRes.status})`);
    assert(approveJson.success === true, 'Listing approved successfully');
    assert(approveJson.listing?.status === 'PUBLISHED', `Listing transitioned to PUBLISHED (status: ${approveJson.listing?.status})`);

    // Verify published listing appears in Residential Marketplace API
    const marketRes = await fetch(`${BASE_URL}/api/residential/listings?district=Ernakulam&search=Verified`);
    const marketJson = await marketRes.json();
    const found = (marketJson.listings || []).some(l => l.id === createdListingId);
    assert(found, 'Newly published listing appears in Kerala Residential Marketplace');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`FINAL RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTest();
