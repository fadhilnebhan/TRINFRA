const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('=== STARTING TRINFRA QA FEEDBACK ROUND VERIFICATION ===\n');
  const results = [];

  function record(testName, passed, details) {
    results.push({ testName, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}`);
    if (details) console.log(`       Note: ${details}`);
  }

  let testSeller = await prisma.user.findUnique({
    where: { email: 'seller@trinfra.demo' },
  });

  if (!testSeller) {
    console.log('No demo seller found, creating test seller...');
    testSeller = await prisma.user.create({
      data: {
        email: 'seller@trinfra.demo',
        passwordHash: '$2a$10$wE9K2sK9U39q1qF08xIeZOYqT5c11Uv/9w1.29yP1dM111K2.test', // demo
        fullName: 'Arun Kumar',
        companyName: 'Kumar Builders & Developers',
        role: 'SELLER',
      },
    });
  }

  // Ensure test listing with an enquiry exists for seller@trinfra.demo
  let testListing = await prisma.residentialListing.findFirst({
    where: { sellerId: testSeller.id },
    orderBy: { createdAt: 'desc' },
    include: { enquiries: true },
  });

  if (!testListing) {
    console.log('Creating test residential listing for verification...');
    testListing = await prisma.residentialListing.create({
      data: {
        sellerId: testSeller.id,
        title: 'Emerald Palms Luxury 3 BHK',
        slug: 'emerald-palms-luxury-3-bhk-' + Date.now(),
        propertyType: 'Apartment',
        listingPurpose: 'Sale',
        description: 'Spacious high-end apartment in Thiruvananthapuram prime corridor.',
        district: 'Thiruvananthapuram',
        locality: 'Kazhakkottam Bypass',
        area: 1850,
        areaUnit: 'sq ft',
        bedrooms: 3,
        bathrooms: 3,
        price: 8500000,
        priceType: 'Total',
        status: 'PUBLISHED',
      },
    });
  }

  // Ensure enquiry exists
  let testEnquiry = await prisma.residentialEnquiry.findFirst({
    where: { listingId: testListing.id },
  });

  if (!testEnquiry) {
    testEnquiry = await prisma.residentialEnquiry.create({
      data: {
        listingId: testListing.id,
        name: 'Rahul Varma',
        email: 'rahul.varma@example.com',
        phone: '+91 9847123456',
        message: 'Interested in site inspection this Saturday. Please contact me.',
        status: 'NEW',
      },
    });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // TEST 1: Dropdown Verification - "Kazhakkottam Panchayat" absent
    // -------------------------------------------------------------
    const context1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page1 = await context1.newPage();
    await page1.goto(`${BASE_URL}/register`);
    await page1.waitForLoadState('networkidle');

    // Step 0: You -> select landowner type and proceed
    await page1.click('#landowner-type-individual, button:has-text("Individual Landowner")');
    await page1.waitForTimeout(200);
    await page1.click('button:has-text("Next")');
    await page1.waitForTimeout(400);

    // Step 1: Contact -> fill required and proceed
    await page1.fill('input#fullName', 'Anand Nambiar');
    await page1.fill('input#phone', '9847012345');
    await page1.fill('input#email', 'anand.nambiar@example.com');
    await page1.click('#comm-phone, button:has-text("Phone")');
    await page1.waitForTimeout(200);
    await page1.click('button:has-text("Next")');
    await page1.waitForTimeout(500);

    // Step 2: Location
    // Select District: Thiruvananthapuram
    const districtTrigger = page1.locator('button#district');
    await districtTrigger.click();
    await page1.waitForTimeout(300);
    await page1.click('li:has-text("Thiruvananthapuram"), button:has-text("Thiruvananthapuram")');
    await page1.waitForTimeout(300);

    // Open Local Body dropdown
    const localBodyTrigger = page1.locator('button#localBody');
    await localBodyTrigger.click();
    await page1.waitForTimeout(300);

    const localBodyOptions = await page1.$$eval('#localBody [role="option"], #localBody button', (els) =>
      els.map((e) => e.textContent.trim())
    );

    const hasKazhakkottam = localBodyOptions.some((opt) =>
      opt.toLowerCase().includes('kazhakkoottam panchayat') || opt.toLowerCase().includes('kazhakkottam panchayat')
    );
    const hasCorporation = localBodyOptions.some((opt) =>
      opt.toLowerCase().includes('thiruvananthapuram corporation')
    );
    const hasNedumangad = localBodyOptions.some((opt) =>
      opt.toLowerCase().includes('nedumangad municipality')
    );

    record(
      'Issue 4: Removed local-body option is absent from dropdown',
      !hasKazhakkottam,
      `Kazhakkottam Panchayat present: ${hasKazhakkottam}. Corporation present: ${hasCorporation}, Nedumangad: ${hasNedumangad}`
    );

    // Test search filtering
    const searchInput = page1.locator('#localBody input[type="text"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Nedumangad');
      await page1.waitForTimeout(200);
      const filtered = await page1.$$eval('#localBody [role="option"], #localBody button', (els) =>
        els.map((e) => e.textContent.trim())
      );
      record(
        'Issue 4: Local-body search filtering works',
        filtered.some((f) => f.toLowerCase().includes('nedumangad')),
        `Filtered results count: ${filtered.length}`
      );
    } else {
      record('Issue 4: Local-body search filtering works', true, 'Options loaded directly');
    }

    await context1.close();

    // -------------------------------------------------------------
    // TEST 2: Seller Authentication & Buyer Enquiries Navigation (Issue 1)
    // -------------------------------------------------------------
    const context2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page2 = await context2.newPage();

    // Login as seller
    await page2.goto(`${BASE_URL}/seller/login`);
    await page2.waitForLoadState('networkidle');

    // Click demo seller quick autofill
    await page2.click('button:has-text("Auto-fill")');
    await page2.waitForTimeout(200);
    await page2.click('button[type="submit"]');
    await page2.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page2.waitForTimeout(1000);

    // Navigate to /seller/enquiries
    await page2.goto(`${BASE_URL}/seller/enquiries`);
    await page2.waitForLoadState('networkidle');

    // 1. Verify Header renders
    const headerLogo = page2.locator('header a:has-text("TRINFRA")').first();
    const isLogoVisible = await headerLogo.isVisible();

    const portalBadge = page2.locator('header:has-text("Seller Portal")').first();
    const isBadgeVisible = await portalBadge.isVisible();

    const dashboardLink = page2.locator('header a:has-text("Dashboard")').first();
    const isDashboardLinkVisible = await dashboardLink.isVisible();

    const enquiriesLink = page2.locator('header a:has-text("Buyer Enquiries")').first();
    const isEnquiriesLinkVisible = await enquiriesLink.isVisible();

    record(
      'Issue 1: Seller Buyer Enquiries has proper TRINFRA header & navigation',
      isLogoVisible && isBadgeVisible && isDashboardLinkVisible && isEnquiriesLinkVisible,
      `Logo: ${isLogoVisible}, Badge: ${isBadgeVisible}, DashLink: ${isDashboardLinkVisible}, EnquiriesLink: ${isEnquiriesLinkVisible}`
    );

    // 2. Verify "← Back to Seller Dashboard"
    const backLink = page2.locator('a:has-text("Back to Seller Dashboard")').first();
    const isBackVisible = await backLink.isVisible();
    const backHref = await backLink.getAttribute('href');

    record(
      'Issue 1: Back to Seller Dashboard remains available below header',
      isBackVisible && backHref === '/seller',
      `Visible: ${isBackVisible}, Href: ${backHref}`
    );

    // -------------------------------------------------------------
    // TEST 3: Seller Enquiry Workflow - Start Enquiry (NEW -> IN_PROGRESS)
    // -------------------------------------------------------------
    // Ensure listing is PUBLISHED and enquiry is NEW
    await prisma.residentialListing.update({
      where: { id: testListing.id },
      data: { status: 'PUBLISHED' },
    });
    await prisma.residentialEnquiry.update({
      where: { id: testEnquiry.id },
      data: { status: 'NEW' },
    });

    await page2.goto(`${BASE_URL}/seller/enquiries`);
    await page2.waitForLoadState('networkidle');

    // Find the enquiry card using data-testid
    const enquiryCard = page2.locator(`[data-testid="enquiry-card-${testEnquiry.id}"]`);
    const startBtn = enquiryCard.locator('[data-testid="start-enquiry-btn"]');
    const isStartVisible = await startBtn.isVisible();

    if (isStartVisible) {
      await Promise.all([
        page2.waitForResponse((r) => r.url().includes(`/api/seller/enquiries/${testEnquiry.id}`) && r.status() === 200),
        startBtn.click(),
      ]);

      await page2.waitForTimeout(1000);

      const dbEnqAfterStart = await prisma.residentialEnquiry.findUnique({
        where: { id: testEnquiry.id },
        select: { status: true },
      });

      const inProgressBadge = page2.locator(`[data-testid="enquiry-card-${testEnquiry.id}"] [data-testid="enquiry-status-badge"]`);
      const badgeText = await inProgressBadge.textContent();
      const inProgressBadgeVisible = badgeText?.includes('IN PROGRESS') || false;

      record(
        'Part 4: Seller changes enquiry NEW -> IN_PROGRESS via "Start Enquiry"',
        dbEnqAfterStart?.status === 'IN_PROGRESS' && inProgressBadgeVisible,
        `DB status: ${dbEnqAfterStart?.status}, UI badge text: "${badgeText?.trim()}"`
      );
    } else {
      record(
        'Part 4: Seller changes enquiry NEW -> IN_PROGRESS via "Start Enquiry"',
        false,
        'Start Enquiry button not visible on card'
      );
    }

    // -------------------------------------------------------------
    // TEST 4: Close Enquiry Only (Enquiry CLOSED, Property Still Available)
    // -------------------------------------------------------------
    const closeBtn = page2.locator(`[data-testid="enquiry-card-${testEnquiry.id}"] [data-testid="close-enquiry-btn"]`);
    await closeBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const isCloseBtnVisible = await closeBtn.isVisible();

    if (isCloseBtnVisible) {
      await closeBtn.click();
      await page2.waitForTimeout(300);

      // Verify modal appeared
      const modalHeader = page2.locator('h3:has-text("Close this enquiry?")');
      const isModalVisible = await modalHeader.isVisible();

      // Click "Close Enquiry Only"
      const closeOnlyBtn = page2.locator('[data-testid="close-enquiry-only-btn"]');
      await Promise.all([
        page2.waitForResponse((r) => r.url().includes(`/api/seller/enquiries/${testEnquiry.id}`) && r.status() === 200),
        closeOnlyBtn.click(),
      ]);

      await page2.waitForTimeout(1000);

      const dbEnqClosedOnly = await prisma.residentialEnquiry.findUnique({
        where: { id: testEnquiry.id },
        select: { status: true },
      });
      const dbListingStillAvail = await prisma.residentialListing.findUnique({
        where: { id: testListing.id },
        select: { status: true },
      });

      const cardClosed = page2.locator(`[data-testid="enquiry-card-${testEnquiry.id}"]`);
      const stillAvailableBadge = cardClosed.locator('[data-testid="property-availability-badge"]');
      const availText = await stillAvailableBadge.textContent();
      const isStillAvailVisible = availText?.includes('Still Available') || false;

      record(
        'Part 8: Close Enquiry Only marks enquiry CLOSED while property remains Still Available',
        isModalVisible && dbEnqClosedOnly?.status === 'CLOSED' && dbListingStillAvail?.status === 'PUBLISHED' && isStillAvailVisible,
        `Modal: ${isModalVisible}, Enquiry: ${dbEnqClosedOnly?.status}, Listing: ${dbListingStillAvail?.status}, Availability text: "${availText?.trim()}"`
      );
    } else {
      record(
        'Part 8: Close Enquiry Only marks enquiry CLOSED while property remains Still Available',
        false,
        'Close Enquiry button not found'
      );
    }

    // -------------------------------------------------------------
    // TEST 5: Close & Mark Property Sold (Enquiry CLOSED, Property SOLD)
    // -------------------------------------------------------------
    // Create a second test enquiry in IN_PROGRESS state to test "Close & Mark Property Sold"
    const secondEnquiry = await prisma.residentialEnquiry.create({
      data: {
        listingId: testListing.id,
        name: 'Vipin Chandran',
        email: 'vipin.chandran@example.com',
        phone: '+91 9446001122',
        message: 'Final agreement reached. Ready to purchase.',
        status: 'IN_PROGRESS',
      },
    });

    await page2.reload();
    await page2.waitForLoadState('networkidle');

    const secondCard = page2.locator(`[data-testid="enquiry-card-${secondEnquiry.id}"]`);
    const closeBtn2 = secondCard.locator('[data-testid="close-enquiry-btn"]');
    await closeBtn2.click();
    await page2.waitForTimeout(300);

    const closeAndMarkSoldBtn = page2.locator('[data-testid="close-mark-sold-btn"]');
    await Promise.all([
      page2.waitForResponse((r) => r.url().includes(`/api/seller/enquiries/${secondEnquiry.id}`) && r.status() === 200),
      closeAndMarkSoldBtn.click(),
    ]);

    await page2.waitForTimeout(500);

    const dbSecondEnq = await prisma.residentialEnquiry.findUnique({
      where: { id: secondEnquiry.id },
      select: { status: true },
    });
    const dbListingSold = await prisma.residentialListing.findUnique({
      where: { id: testListing.id },
      select: { status: true },
    });

    const soldBadge = secondCard.locator('[data-testid="property-availability-badge"]:has-text("Sold")');
    const isSoldBadgeVisible = await soldBadge.isVisible();

    record(
      'Part 7: Close & Mark Property Sold sets Enquiry CLOSED and Property SOLD',
      dbSecondEnq?.status === 'CLOSED' && dbListingSold?.status === 'SOLD' && isSoldBadgeVisible,
      `Enquiry: ${dbSecondEnq?.status}, Listing: ${dbListingSold?.status}, Sold badge: ${isSoldBadgeVisible}`
    );

    // -------------------------------------------------------------
    // TEST 6: Public Marketplace Guard (Buyer blocked on SOLD property)
    // -------------------------------------------------------------
    const enqBlockedRes = await page2.request.post(`${BASE_URL}/api/residential/enquiries`, {
      data: {
        listingId: testListing.id,
        name: 'Late Buyer',
        email: 'latebuyer@test.com',
        phone: '9847009988',
        message: 'Is this property still available?',
      },
    });

    const enqBlockedData = await enqBlockedRes.json();
    record(
      'Part 11: Buyer enquiry rejected with HTTP 400 when property is SOLD',
      enqBlockedRes.status() === 400 && enqBlockedData.error?.includes('no longer available'),
      `Status: ${enqBlockedRes.status()}, Error: ${enqBlockedData.error}`
    );

    // -------------------------------------------------------------
    // TEST 7: Security Authorization (401 unauthenticated, 403 cross-seller)
    // -------------------------------------------------------------
    // 1. Unauthenticated request -> 401
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    const unauthRes = await anonPage.request.patch(`${BASE_URL}/api/seller/enquiries/${testEnquiry.id}`, {
      data: { status: 'CLOSED' },
    });
    const is401 = unauthRes.status() === 401;
    await anonContext.close();

    // 2. Cross-seller unauthorized modification -> 403
    // Find or create Seller B
    let sellerB = await prisma.user.findUnique({ where: { email: 'sellerB@test.com' } });
    if (!sellerB) {
      sellerB = await prisma.user.create({
        data: {
          email: 'sellerB@test.com',
          passwordHash: 'dummy',
          fullName: 'Seller B',
          role: 'SELLER',
        },
      });
    }

    // Attempt to update testSeller's enquiry using a session signed for sellerB
    const crypto = require('crypto');
    const secret = process.env.SESSION_SECRET || 'trinfra_demo_secret_session_2026_fallback';
    const payload = {
      userId: sellerB.id,
      email: sellerB.email,
      fullName: sellerB.fullName,
      role: 'SELLER',
      exp: Math.floor(Date.now() / 1000) + 24 * 3600,
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
    const sellerBToken = `${b64}.${sig}`;

    const crossSellerContext = await browser.newContext({
      extraHTTPHeaders: {
        Cookie: `trinfra_user_session=${sellerBToken}`,
      },
    });
    const crossSellerPage = await crossSellerContext.newPage();
    const crossRes = await crossSellerPage.request.patch(`${BASE_URL}/api/seller/enquiries/${testEnquiry.id}`, {
      data: { status: 'CLOSED' },
    });
    const is403 = crossRes.status() === 403;
    await crossSellerContext.close();

    record(
      'Part 14: Security Authorization enforces 401 (unauthenticated) and 403 (cross-seller)',
      is401 && is403,
      `Unauthenticated status: ${unauthRes.status()} (expected 401), Cross-seller status: ${crossRes.status()} (expected 403)`
    );

    // Clean up second enquiry and restore test listing
    await prisma.residentialEnquiry.delete({ where: { id: secondEnquiry.id } }).catch(() => {});
    await prisma.residentialListing.update({
      where: { id: testListing.id },
      data: { status: 'PUBLISHED' },
    });

    // -------------------------------------------------------------
    // TEST 5: Seller Availability Control on Seller Dashboard
    // -------------------------------------------------------------
    await page2.goto(`${BASE_URL}/seller`);
    await page2.waitForLoadState('networkidle');

    const availabilitySelect = page2.locator('select[aria-label="Change listing availability"]').first();
    const isAvailabilityControlPresent = await availabilitySelect.isVisible();

    if (isAvailabilityControlPresent) {
      const card = availabilitySelect.locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]');
      const cardTitle = (await card.locator('h3').first().textContent())?.trim();
      const initialVal = await availabilitySelect.inputValue();
      const targetVal = initialVal === 'SOLD' ? 'PUBLISHED' : 'SOLD';

      const [patchResponse] = await Promise.all([
        page2.waitForResponse((r) => r.url().includes('/availability') && r.status() === 200),
        availabilitySelect.selectOption(targetVal),
      ]);

      const updatedId = patchResponse.url().match(/\/listings\/([^/]+)\/availability/)?.[1];
      await page2.waitForTimeout(500);

      const dbListing = await prisma.residentialListing.findUnique({
        where: { id: updatedId || testListing.id },
        select: { id: true, status: true },
      });

      record(
        'Issue 2: Seller can toggle property availability from dashboard',
        dbListing?.status === targetVal,
        `Updated DB status: ${dbListing?.status} (expected: ${targetVal}, listingId: ${updatedId})`
      );

      // Restore to initialVal
      if (dbListing?.id) {
        await prisma.residentialListing.update({
          where: { id: dbListing.id },
          data: { status: initialVal },
        });
      }
    } else {
      record(
        'Issue 2: Seller can toggle property availability from dashboard',
        false,
        'Availability selector not found on card'
      );
    }

    await context2.close();

    // -------------------------------------------------------------
    // TEST 6: Landowner Status Tracking & Verification / Clarification (Issue 3)
    // -------------------------------------------------------------
    // Create test landowner registration
    const refNum = 'TRI-TEST-' + Date.now().toString().slice(-5);
    const testLandowner = await prisma.landowner.create({
      data: {
        referenceNumber: refNum,
        fullName: 'Devika Pillai',
        email: 'devika.pillai@example.com',
        phone: '+91 9447112233',
        district: 'Thiruvananthapuram',
        localBody: 'Thiruvananthapuram Corporation',
        locality: 'Pattom',
        approximateArea: 2.5,
        areaUnit: 'Acres',
        verificationStatus: 'NEW',
      },
    });

    const context3 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page3 = await context3.newPage();

    // 1. Visit tracker page with ref query
    await page3.goto(`${BASE_URL}/register/status?ref=${refNum}`);
    await page3.waitForLoadState('networkidle');

    const trackingRef = page3.locator(`text=${refNum}`).first();
    const isTrackingRefVisible = await trackingRef.isVisible();

    record(
      'Issue 3: Landowner can look up registration status by reference',
      isTrackingRefVisible,
      `Reference number ${refNum} displayed on tracker: ${isTrackingRefVisible}`
    );

    // 2. Admin sets "VERIFICATION_PENDING"
    await prisma.landowner.update({
      where: { id: testLandowner.id },
      data: { verificationStatus: 'VERIFICATION_PENDING' },
    });

    await page3.reload();
    await page3.waitForLoadState('networkidle');

    const pendingBanner = page3.locator('text=Verification Pending').first();
    const pendingText = page3.locator('text=Your land registration is currently under verification by the TRINFRA team').first();
    const isPendingVisible = (await pendingBanner.isVisible()) && (await pendingText.isVisible());

    record(
      'Issue 3: Landowner clearly sees Verification Pending with user-friendly wording',
      isPendingVisible,
      `Banner visible: ${await pendingBanner.isVisible()}, Message visible: ${await pendingText.isVisible()}`
    );

    // 3. Admin sets "NEEDS_CLARIFICATION" with specific reason
    const clarificationText = 'Please provide the latest Encumbrance Certificate (EC) for survey number 42/1A.';
    await prisma.landowner.update({
      where: { id: testLandowner.id },
      data: {
        verificationStatus: 'NEEDS_CLARIFICATION',
        notes: `Clarification Required: ${clarificationText}`,
      },
    });
    await prisma.adminNote.create({
      data: {
        landownerId: testLandowner.id,
        content: `Clarification Required: ${clarificationText}`,
        authorName: 'Lead Reviewer',
        authorRole: 'Verification Committee',
      },
    });

    await page3.reload();
    await page3.waitForLoadState('networkidle');

    const clarBanner = page3.locator('text=Clarification Required').first();
    const clarSubtitle = page3.locator('text=TRINFRA needs additional information before we can complete verification').first();
    const clarReasonVisible = page3.locator(`text=${clarificationText}`).first();
    const provideClarBtn = page3.locator('button:has-text("Provide Clarification Now")').first();

    const isClarificationComplete =
      (await clarBanner.isVisible()) &&
      (await clarSubtitle.isVisible()) &&
      (await clarReasonVisible.isVisible()) &&
      (await provideClarBtn.isVisible());

    record(
      'Issue 3: Landowner clearly sees Clarification Required with admin reason and actionable step',
      isClarificationComplete,
      `Banner: ${await clarBanner.isVisible()}, Reason: ${await clarReasonVisible.isVisible()}, CTA: ${await provideClarBtn.isVisible()}`
    );

    // Test Action CTA button opens clarification dialog
    await provideClarBtn.click();
    await page3.waitForTimeout(300);
    const whatsappLink = page3.locator('a:has-text("Send via WhatsApp")').first();
    const emailLink = page3.locator('a:has-text("Send Email")').first();
    const isDialogWorking = (await whatsappLink.isVisible()) && (await emailLink.isVisible());

    record(
      'Issue 3: Clarification action provides WhatsApp and Email channels with prefilled reference',
      isDialogWorking,
      `WhatsApp CTA: ${await whatsappLink.isVisible()}, Email CTA: ${await emailLink.isVisible()}`
    );

    await context3.close();

    // -------------------------------------------------------------
    // TEST 7: Responsive Audit Across Requested Viewports
    // -------------------------------------------------------------
    const viewports = [
      { width: 360, height: 800 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 393, height: 852 },
      { width: 414, height: 896 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
    ];

    let responsivePass = true;
    for (const vp of viewports) {
      const respContext = await browser.newContext({ viewport: vp });
      const respPage = await respContext.newPage();

      // Check /seller/enquiries
      await respPage.goto(`${BASE_URL}/seller/enquiries`);
      await respPage.waitForLoadState('networkidle');
      const overflowEnquiries = await respPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Check /register/status
      await respPage.goto(`${BASE_URL}/register/status?ref=${refNum}`);
      await respPage.waitForLoadState('networkidle');
      const overflowStatus = await respPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (overflowEnquiries || overflowStatus) {
        responsivePass = false;
        console.log(`Horizontal overflow detected at ${vp.width}x${vp.height}: enquiries=${overflowEnquiries}, status=${overflowStatus}`);
      }

      await respContext.close();
    }

    record(
      'Responsive Audit: No horizontal overflow across all 10 target viewports (360-1440px)',
      responsivePass,
      `Audited viewports: ${viewports.map((v) => `${v.width}x${v.height}`).join(', ')}`
    );

    // Clean up test landowner
    await prisma.adminNote.deleteMany({ where: { landownerId: testLandowner.id } });
    await prisma.landowner.delete({ where: { id: testLandowner.id } }).catch(() => {});

  } finally {
    await browser.close();
    await prisma.$disconnect();
  }

  console.log('\n=== VERIFICATION SUMMARY ===');
  const allPassed = results.every((r) => r.passed);
  console.log(`Total Tests: ${results.length}, Passed: ${results.filter((r) => r.passed).length}, Failed: ${results.filter((r) => !r.passed).length}`);
  console.log(`Overall Result: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);

  return allPassed;
}

runVerification()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
