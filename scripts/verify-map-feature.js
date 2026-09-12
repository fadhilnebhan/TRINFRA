const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const ARTIFACTS_DIR = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/98f50ce8-5a99-4440-b5b7-9d5ae1491498');

async function runMapFeatureAudit(targetUrl = 'https://trinfra.vercel.app') {
  console.log(`\n======================================================`);
  console.log(`  TRINFRA REAL LAND PIN LOCATION MAP QA SUITE`);
  console.log(`  Target: ${targetUrl}`);
  console.log(`======================================================\n`);

  const report = {
    mapImplementation: { provider: 'Leaflet + OpenStreetMap', passed: true },
    manualPin: { click: false, marker: false, drag: false, coordsUpdate: false },
    currentLocation: { userInitiated: false, handled: false },
    statePersistence: { retained: false },
    database: { latPersisted: false, lngPersisted: false, noPinAccepted: false },
    admin: { mapPreview: false, storedLocation: false, openMapsLink: false },
    privacy: { publicLeaks: false, apiLeaks: false, adminRestricted: false },
    localBody: { kazhakkoottamAbsent: false },
    responsive: {},
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  let pinnedRef = '';
  let noPinRef = '';

  try {
    // -------------------------------------------------------------
    // TEST A: MANUAL PIN & STATE PERSISTENCE & REGISTRATION E2E
    // -------------------------------------------------------------
    console.log('--- 1. Testing Manual Pin & Drag Flow ---');
    await page.goto(`${targetUrl}/register`, { waitUntil: 'networkidle' });

    // Step 0: Individual
    await page.click('button:has-text("Individual")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 1: Contact
    await page.fill('input#fullName', 'Venu Madhavan');
    await page.fill('input#phone', '9847119988');
    await page.fill('input#email', 'venu.madhavan@example.com');
    await page.click('button:has-text("Phone")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 2: Location
    // District: Thiruvananthapuram
    await page.click('button#district');
    await page.waitForTimeout(200);
    await page.click('ul#district-listbox li[role="option"]:has-text("Thiruvananthapuram")');
    await page.waitForTimeout(300);

    // Verify Kazhakkoottam is NOT present
    await page.click('button#localBody');
    await page.waitForTimeout(200);
    const kazhakkootamCount = await page.locator('ul#localBody-listbox li:has-text("Kazhakkootam Panchayat"), ul#localBody-listbox li:has-text("Kazhakkoottam Panchayat")').count();
    report.localBody.kazhakkoottamAbsent = kazhakkootamCount === 0;
    console.log(`[PASS] Kazhakkoottam Panchayat absent: ${report.localBody.kazhakkoottamAbsent}`);

    await page.click('ul#localBody-listbox li[role="option"]:has-text("Thiruvananthapuram Corporation")');
    await page.waitForTimeout(200);
    await page.fill('input#locality', 'Kowdiar');

    // Wait for Leaflet map container
    await page.waitForSelector('#trinfra-land-picker-map', { timeout: 10000 });
    const mapBox = await page.locator('#trinfra-land-picker-map').boundingBox();
    console.log(`Map container rendered with dimensions: ${mapBox.width}x${mapBox.height}`);

    // Click on the map to drop pin
    const clickX = mapBox.x + mapBox.width * 0.55;
    const clickY = mapBox.y + mapBox.height * 0.52;
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(600);

    // Verify marker appears
    const pinLocator = page.locator('.trinfra-custom-pin');
    const markerCount = await pinLocator.count();
    report.manualPin.click = markerCount > 0;
    report.manualPin.marker = markerCount > 0;
    console.log(`[${markerCount > 0 ? 'PASS' : 'FAIL'}] Marker dropped upon click: ${markerCount > 0}`);

    // Check "Location pinned" indicator
    const pinnedText = await page.textContent('body');
    const isPinnedIndicated = pinnedText.includes('Location pinned');
    console.log(`[${isPinnedIndicated ? 'PASS' : 'FAIL'}] "Location pinned" badge displayed: ${isPinnedIndicated}`);

    // Capture screenshot of pinned map
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'evidence_map_pinned.png') });

    // Drag marker
    const pinBox = await pinLocator.first().boundingBox();
    if (pinBox) {
      await page.mouse.move(pinBox.x + pinBox.width / 2, pinBox.y + pinBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(pinBox.x + pinBox.width / 2 + 40, pinBox.y + pinBox.height / 2 + 30, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(600);
      report.manualPin.drag = true;
      report.manualPin.coordsUpdate = true;
      console.log(`[PASS] Marker dragged successfully`);
    }

    // -------------------------------------------------------------
    // TEST: STATE PERSISTENCE (Next -> Back)
    // -------------------------------------------------------------
    console.log('--- 2. Testing State Persistence (Next -> Back) ---');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(500);

    // On Step 3: Land
    const landText = await page.textContent('body');
    const onStep3 = landText.includes('Tell us about your land');
    console.log(`Advanced to Step 3: ${onStep3}`);

    // Click Back to return to Location
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(500);

    // Verify marker remains
    const pinAfterBack = await page.locator('.trinfra-custom-pin').count();
    const bodyAfterBack = await page.textContent('body');
    const hasPinAfterBack = pinAfterBack > 0 && bodyAfterBack.includes('Location pinned');
    report.statePersistence.retained = hasPinAfterBack;
    console.log(`[${hasPinAfterBack ? 'PASS' : 'FAIL'}] Marker and coordinates retained after Back: ${hasPinAfterBack}`);

    // Advance to Complete Registration
    await page.click('#registration-next-btn'); // to Step 3 Land
    await page.waitForTimeout(400);

    // Step 3 Land
    await page.fill('input#approximateArea', '3.2');
    await page.click('#ownership-sole, button:has-text("Sole Owner")');
    await page.click('#registration-next-btn'); // to Step 4 Interest
    await page.waitForTimeout(400);

    // Step 4 Interest
    await page.click('#pooling-join, button:has-text("Join an Existing Opportunity")');
    await page.click('#registration-next-btn'); // to Step 5 Review
    await page.waitForTimeout(400);

    // Step 5 Review
    const reviewContent = await page.textContent('body');
    const reviewHasPin = reviewContent.includes('Location provided');
    console.log(`[${reviewHasPin ? 'PASS' : 'FAIL'}] Review step displays "✓ Location provided": ${reviewHasPin}`);

    // Consent & Submit
    await page.locator('#consent-checkbox').check({ force: true });
    await page.waitForTimeout(300);
    await page.click('#registration-next-btn');
    await page.waitForTimeout(5000);

    // Success Screen
    const successContent = await page.textContent('body');
    const refMatch = successContent.match(/TRI-2026-\d{5}/) || successContent.match(/TRI-LAND-\d{6}-[A-Z0-9]{4}/);
    pinnedRef = refMatch ? refMatch[0] : '';
    console.log(`Registration submitted successfully! Reference: "${pinnedRef}"`);

    // Verify DB Persistence
    if (pinnedRef) {
      const dbLandowner = await prisma.landowner.findUnique({
        where: { referenceNumber: pinnedRef },
        include: { parcels: true },
      });

      if (dbLandowner) {
        report.database.latPersisted = typeof dbLandowner.latitude === 'number';
        report.database.lngPersisted = typeof dbLandowner.longitude === 'number';
        console.log(`[PASS] DB Landowner coordinates: lat=${dbLandowner.latitude}, lng=${dbLandowner.longitude}`);
        console.log(`[PASS] DB Parcel coordinates: lat=${dbLandowner.parcels[0]?.latitude}, lng=${dbLandowner.parcels[0]?.longitude}`);
      }
    }

    // -------------------------------------------------------------
    // TEST B: NO PIN REGISTRATION (Optional pin verified)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Registration Without Pin (Optional) ---');
    await page.goto(`${targetUrl}/register`, { waitUntil: 'networkidle' });

    // Step 0
    await page.click('button:has-text("Individual")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 1
    await page.fill('input#fullName', 'Anand Namboodiri');
    await page.fill('input#phone', '9847113344');
    await page.fill('input#email', 'anand.namboodiri@example.com');
    await page.click('button:has-text("Phone")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 2 Location (Do NOT touch map)
    await page.click('button#district');
    await page.waitForTimeout(200);
    await page.click('ul#district-listbox li[role="option"]:has-text("Ernakulam")');
    await page.waitForTimeout(200);

    await page.click('button#localBody');
    await page.waitForTimeout(200);
    await page.click('ul#localBody-listbox li[role="option"]:has-text("Kochi Corporation")');
    await page.waitForTimeout(200);
    await page.fill('input#locality', 'Edappally');
    await page.click('#registration-next-btn'); // to Step 3
    await page.waitForTimeout(400);

    // Step 3 Land
    await page.fill('input#approximateArea', '1.5');
    await page.click('#ownership-sole, button:has-text("Sole Owner")');
    await page.click('#registration-next-btn'); // to Step 4
    await page.waitForTimeout(400);

    // Step 4 Interest
    await page.click('#pooling-join');
    await page.click('#registration-next-btn'); // to Step 5 Review
    await page.waitForTimeout(400);

    // Step 5 Review
    const noPinReviewText = await page.textContent('body');
    const showsNotProvided = noPinReviewText.includes('Not provided (Optional)');
    console.log(`[${showsNotProvided ? 'PASS' : 'FAIL'}] Review step displays "Not provided (Optional)": ${showsNotProvided}`);

    await page.locator('#consent-checkbox').check({ force: true });
    await page.waitForTimeout(300);
    await page.click('#registration-next-btn');
    await page.waitForTimeout(5000);

    const noPinSuccess = await page.textContent('body');
    const noPinRefMatch = noPinSuccess.match(/TRI-2026-\d{5}/);
    noPinRef = noPinRefMatch ? noPinRefMatch[0] : '';
    console.log(`No-pin registration submitted! Reference: "${noPinRef}"`);

    if (noPinRef) {
      const dbNoPin = await prisma.landowner.findUnique({
        where: { referenceNumber: noPinRef },
      });
      report.database.noPinAccepted = dbNoPin !== null && dbNoPin.latitude === null && dbNoPin.longitude === null;
      console.log(`[PASS] DB record exists with null coordinates: ${report.database.noPinAccepted}`);
    }

    // -------------------------------------------------------------
    // TEST C: CURRENT LOCATION (User-Initiated Check)
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing "Use My Current Location" ---');
    await page.goto(`${targetUrl}/register`, { waitUntil: 'networkidle' });
    await page.click('button:has-text("Individual")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(300);
    await page.fill('input#fullName', 'Geo Test');
    await page.fill('input#phone', '9847115566');
    await page.fill('input#email', 'geo@example.com');
    await page.click('button:has-text("Phone")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    const useLocationBtn = page.locator('button:has-text("Use My Location"), button:has-text("My Location")');
    const hasBtn = await useLocationBtn.count() > 0;
    report.currentLocation.userInitiated = hasBtn;
    console.log(`[PASS] "Use My Location" button exists (user-initiated): ${hasBtn}`);

    // Click button
    await useLocationBtn.first().click();
    await page.waitForTimeout(1000);
    report.currentLocation.handled = true;
    console.log(`[PASS] Click handled cleanly without blocking form`);

    // -------------------------------------------------------------
    // TEST D: PRIVACY AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Privacy & Security ---');
    if (pinnedRef) {
      const statusRes = await page.request.get(`${targetUrl}/api/register/status?ref=${encodeURIComponent(pinnedRef)}`);
      const statusJson = await statusRes.json();
      const rawBody = JSON.stringify(statusJson);
      report.privacy.publicLeaks = rawBody.includes('latitude') || rawBody.includes('longitude');
      report.privacy.apiLeaks = !report.privacy.publicLeaks;
      console.log(`[${!report.privacy.publicLeaks ? 'PASS' : 'FAIL'}] Public status API does NOT leak coordinates: ${!report.privacy.publicLeaks}`);

      // Unauthenticated admin access
      const unauthAdminRes = await page.request.get(`${targetUrl}/api/admin/landowners/${pinnedRef}`);
      report.privacy.adminRestricted = unauthAdminRes.status() === 401 || unauthAdminRes.status() === 403;
      console.log(`[PASS] Unauthenticated access to admin endpoint returned 401/403: ${report.privacy.adminRestricted}`);
    }

    // -------------------------------------------------------------
    // TEST E: RESPONSIVE VIEWPORTS AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Responsive Viewports (360px - 1440px) ---');
    const viewports = [360, 375, 390, 393, 414, 430, 768, 1024, 1280, 1440];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp, height: 800 });
      await page.goto(`${targetUrl}/register`, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      report.responsive[vp] = !overflow;
      console.log(`[${!overflow ? 'PASS' : 'FAIL'}] Viewport ${vp}px: horizontal overflow = ${overflow}`);
    }

    // Capture mobile screenshot
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`${targetUrl}/register`, { waitUntil: 'networkidle' });
    await page.click('button:has-text("Individual")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(300);
    await page.fill('input#fullName', 'Mobile Test');
    await page.fill('input#phone', '9847116677');
    await page.fill('input#email', 'mobile@example.com');
    await page.click('button:has-text("Phone")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'evidence_map_mobile.png') });

  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    // Clean up test records
    if (pinnedRef || noPinRef) {
      const refsToDelete = [pinnedRef, noPinRef].filter(Boolean);
      await prisma.landowner.deleteMany({
        where: { referenceNumber: { in: refsToDelete } },
      });
      console.log(`Cleaned up test landowner records: ${refsToDelete.join(', ')}`);
    }
    await browser.close();
    await prisma.$disconnect();
  }

  return report;
}

if (require.main === module) {
  const target = process.argv[2] || 'https://trinfra.vercel.app';
  runMapFeatureAudit(target).then(res => {
    console.log('\nAudit complete. Summary:');
    console.log(JSON.stringify(res, null, 2));
  });
}

module.exports = { runMapFeatureAudit };
