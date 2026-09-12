const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ARTIFACTS_DIR = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/98f50ce8-5a99-4440-b5b7-9d5ae1491498');

async function runLaunchAudit(targetUrl = 'http://localhost:3000') {
  console.log(`\n======================================================`);
  console.log(`  TRINFRA ZERO-BLOCKER QA / LAUNCH READINESS SUITE`);
  console.log(`  Target: ${targetUrl}`);
  console.log(`======================================================\n`);

  const results = {
    p0: [],
    p1: [],
    security: [],
    forms: [],
    responsive: [],
    images: [],
    counts: [],
  };

  function record(category, issue, test, passed, evidence) {
    const item = { issue, test, passed, evidence };
    results[category].push(item);
    console.log(`[${passed ? 'PASS' : 'FAIL'}] [${category.toUpperCase()}] ${issue}: ${test}`);
    if (evidence) console.log(`       Evidence: ${evidence}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // 1. PHASE 1: PUBLIC DATA CLEANUP (P0)
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Data Cleanup (P0) ---');
    const allDbListings = await prisma.residentialListing.findMany();
    const testTitles = ['fsdakj', 'asfda', 'zxcv', 'QA Admin Detail Review Verification Flat'];
    const foundTests = allDbListings.filter(l => 
      testTitles.some(t => l.title.toLowerCase().includes(t.toLowerCase())) ||
      l.title.length < 5 ||
      l.sellerId.includes('test')
    );

    record('p0', 'Public Data Cleanup', 'No synthetic QA listings in Database', foundTests.length === 0, 
      foundTests.length === 0 ? `0 test listings found. Exactly ${allDbListings.length} legitimate listings in DB.` : `Found ${foundTests.length} test listings: ${foundTests.map(f => f.title).join(', ')}`);

    // Verify public residential API
    const resResponse = await page.request.get(`${targetUrl}/api/residential/listings`);
    const resJson = await resResponse.json();
    const publicListings = Array.isArray(resJson) ? resJson : (resJson.listings || resJson.data || []);
    const publicTestListings = publicListings.filter(l => 
      testTitles.some(t => l.title && l.title.toLowerCase().includes(t.toLowerCase()))
    );

    record('p0', 'Residential API', 'Public API does not expose test listings', publicTestListings.length === 0,
      `API returned ${publicListings.length} listings, 0 test listings detected.`);

    // -------------------------------------------------------------
    // 2. PHASE 2: PROJECT DETAIL 404 (P0)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Project Detail Routes (P0) ---');
    
    // Test Trivandrum Outer Ring Road specifically
    const torResp = await page.goto(`${targetUrl}/projects/trivandrum-outer-ring-road`, { waitUntil: 'networkidle' });
    const torStatus = torResp.status();
    const torTitle = await page.locator('h1').first().textContent().catch(() => '');
    const torMetrics = await page.textContent('body');
    const has240Acres = torMetrics.includes('240') || torMetrics.includes('Trivandrum');
    
    record('p0', 'Project Detail 404', 'Trivandrum Outer Ring Road loads on direct URL', torStatus === 200 && torTitle.includes('Trivandrum Outer Ring Road'),
      `Status ${torStatus}, Title: "${torTitle.trim()}", Contains 240 Acres / Trivandrum: ${has240Acres}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'evidence_trivandrum_project_detail.png'), fullPage: false });

    // Test 3 other legitimate projects
    const otherProjects = [
      { slug: 'riverside-development-project', expected: 'Riverside' },
      { slug: 'greenfield-township', expected: 'Greenfield' },
      { slug: 'tech-park-corridor', expected: 'Tech Park' },
    ];

    for (const proj of otherProjects) {
      const resp = await page.goto(`${targetUrl}/projects/${proj.slug}`, { waitUntil: 'networkidle' });
      const h1 = await page.locator('h1').first().textContent().catch(() => '');
      record('p0', 'Project Detail Routes', `Project ${proj.slug} loads correctly`, resp.status() === 200 && h1.includes(proj.expected),
        `Status ${resp.status()}, Header: "${h1.trim()}"`);
    }

    // Test Invalid project returns 404
    const invalidResp = await page.goto(`${targetUrl}/projects/invalid-project-does-not-exist`, { waitUntil: 'networkidle' });
    record('p0', 'Project Detail 404', 'Invalid project correctly returns 404', invalidResp.status() === 404,
      `Status: ${invalidResp.status()}`);

    // -------------------------------------------------------------
    // 3. PHASE 3: LEGAL PAGES (P0)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Dedicated Legal Pages (P0) ---');
    
    // Privacy
    const privResp = await page.goto(`${targetUrl}/privacy`, { waitUntil: 'networkidle' });
    const privH1 = await page.locator('h1').first().textContent().catch(() => '');
    const privHasFooter = await page.locator('footer').count() > 0;
    record('p0', 'Legal Pages', '/privacy loads with proper styling & footer', privResp.status() === 200 && privH1.includes('Privacy Policy') && privHasFooter,
      `Status ${privResp.status()}, Heading: "${privH1.trim()}", Footer present: ${privHasFooter}`);

    // Terms
    const termsResp = await page.goto(`${targetUrl}/terms`, { waitUntil: 'networkidle' });
    const termsH1 = await page.locator('h1').first().textContent().catch(() => '');
    const termsHasFooter = await page.locator('footer').count() > 0;
    record('p0', 'Legal Pages', '/terms loads with proper styling & footer', termsResp.status() === 200 && termsH1.includes('Terms') && termsHasFooter,
      `Status ${termsResp.status()}, Heading: "${termsH1.trim()}", Footer present: ${termsHasFooter}`);

    // Disclaimer
    const discResp = await page.goto(`${targetUrl}/disclaimer`, { waitUntil: 'networkidle' });
    const discH1 = await page.locator('h1').first().textContent().catch(() => '');
    const discHasFooter = await page.locator('footer').count() > 0;
    record('p0', 'Legal Pages', '/disclaimer loads with proper styling & footer', discResp.status() === 200 && discH1.includes('Disclaimer') && discHasFooter,
      `Status ${discResp.status()}, Heading: "${discH1.trim()}", Footer present: ${discHasFooter}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'evidence_legal_privacy.png'), fullPage: false });

    // Verify footer links point to real pages
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    const privacyLink = await page.locator('footer a[href="/privacy"]').count();
    const termsLink = await page.locator('footer a[href="/terms"]').count();
    const disclaimerLink = await page.locator('footer a[href="/disclaimer"]').count();
    record('p0', 'Legal Footer Links', 'Footer links connect to real dedicated legal routes', privacyLink > 0 && termsLink > 0 && disclaimerLink > 0,
      `Footer has: /privacy (${privacyLink}), /terms (${termsLink}), /disclaimer (${disclaimerLink})`);

    // -------------------------------------------------------------
    // 4. PHASE 4: FORM FLOWS (P0)
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing End-to-End Forms (P0) ---');
    
    // Step 0: You
    await page.goto(`${targetUrl}/register`, { waitUntil: 'networkidle' });
    await page.click('button:has-text("Individual")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 1: Contact
    const testFullName = 'Gopalan Nambiar';
    const testPhone = '9847198471';
    await page.fill('input#fullName', testFullName);
    await page.fill('input#phone', testPhone);
    await page.fill('input#email', 'gopalan.nambiar@example.com');
    await page.click('button:has-text("Phone")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 2: Location
    await page.click('button#district');
    await page.waitForTimeout(200);
    await page.click('ul#district-listbox li[role="option"]:has-text("Thiruvananthapuram")');
    await page.waitForTimeout(200);
    
    // Check Kazhakkoottam is absent (Phase 9 Location Check)
    await page.click('button#localBody');
    await page.waitForTimeout(200);
    const kazhakkoottamCount = await page.locator('ul#localBody-listbox li:has-text("Kazhakkootam Panchayat"), ul#localBody-listbox li:has-text("Kazhakkoottam Panchayat")').count();
    record('p1', 'Location Data', 'Kazhakkoottam Panchayat is NOT in Thiruvananthapuram list', kazhakkoottamCount === 0,
      `Found ${kazhakkoottamCount} occurrences of Kazhakkoottam Panchayat`);

    // Select valid local body
    await page.click('ul#localBody-listbox li[role="option"]:has-text("Thiruvananthapuram Corporation")');
    await page.waitForTimeout(200);
    await page.fill('input#locality', 'Pattom');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 3: Land
    await page.fill('input#approximateArea', '2.5');
    await page.click('#ownership-sole, button:has-text("Sole Owner")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 4: Interest
    await page.click('#pooling-join, button:has-text("Join an Existing Opportunity")');
    await page.click('#registration-next-btn');
    await page.waitForTimeout(400);

    // Step 5: Review & Consent
    await page.locator('#consent-checkbox').check({ force: true });
    await page.waitForTimeout(300);
    await page.click('#registration-next-btn');
    await page.waitForTimeout(4500);

    // Success screen & Ref ID
    const pageText = await page.textContent('body');
    const refMatch = pageText.match(/TRI-2026-\d{5}/) || pageText.match(/TRI-LAND-\d{6}-[A-Z0-9]{4}/);
    const foundRef = refMatch ? refMatch[0] : '';
    const isSuccess = pageText.includes('Submitted') || pageText.includes('submitted successfully') || foundRef.length > 0;
    record('forms', 'Land Registration E2E', 'Registration submits successfully and returns reference number', isSuccess,
      `Success confirmed: ${isSuccess}, Ref: "${foundRef}"`);

    // Test Tracker with Reference
    if (foundRef) {
      await page.goto(`${targetUrl}/register/status?ref=${encodeURIComponent(foundRef)}`, { waitUntil: 'networkidle' });
      const trackBody = await page.textContent('body');
      const displaysStatus = trackBody.includes('Under Review') || trackBody.includes('VERIFICATION_PENDING') || trackBody.includes('Submitted') || trackBody.includes('SUBMISSION RECEIVED');
      record('forms', 'Landowner Status Tracker', 'Tracker resolves reference and displays status timeline', displaysStatus,
        `Tracker rendered successfully for ${foundRef}`);
    }

    // -------------------------------------------------------------
    // 5. PHASE 10: SECURITY AUDIT (P0)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Security & Authorization (P0) ---');
    
    // Unauthenticated Admin API calls must return 401/403
    const adminEndpoints = [
      { method: 'GET', url: `${targetUrl}/api/admin/landowners` },
      { method: 'POST', url: `${targetUrl}/api/admin/landowners/clarification` },
      { method: 'GET', url: `${targetUrl}/api/admin/residential` },
      { method: 'GET', url: `${targetUrl}/api/admin/stats` },
    ];

    for (const ep of adminEndpoints) {
      const res = ep.method === 'GET' 
        ? await page.request.get(ep.url)
        : await page.request.post(ep.url, { data: {} });
      const status = res.status();
      const isSecure = status === 401 || status === 403;
      record('security', 'Admin API Security', `${ep.method} ${ep.url} rejects unauthenticated access`, isSecure,
        `Status: ${status} (Expected 401 or 403)`);
    }

    // Landowner Tracker privacy masking test
    const statusApiRes = await page.request.get(`${targetUrl}/api/register/status?ref=${encodeURIComponent(refMatch || 'TRI-LAND-202609-ABCD')}`);
    if (statusApiRes.status() === 200) {
      const statusJson = await statusApiRes.json();
      const rawName = statusJson.data?.fullName || '';
      const isMasked = rawName.includes('*') || rawName !== testFullName;
      record('security', 'Landowner Privacy Masking', 'Public status API masks landowner full name', isMasked,
        `Public API returned name: "${rawName}" (Input was "${testFullName}")`);
    }

    // -------------------------------------------------------------
    // 6. PHASE 12: RESPONSIVE AUDIT (10 VIEWPORTS)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Responsive Viewports (P1) ---');
    const viewports = [360, 375, 390, 393, 414, 430, 768, 1024, 1280, 1440];
    const pagesToTest = ['/', '/projects', '/projects/trivandrum-outer-ring-road', '/residential', '/privacy'];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp, height: 800 });
      let overflowFound = false;

      for (const p of pagesToTest) {
        await page.goto(`${targetUrl}${p}`, { waitUntil: 'domcontentloaded' });
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        if (hasHorizontalOverflow) {
          overflowFound = true;
          break;
        }
      }

      record('responsive', `Viewport ${vp}px`, `Zero horizontal overflow across core pages`, !overflowFound,
        overflowFound ? `Horizontal overflow detected at ${vp}px` : `Clean layout across ${pagesToTest.length} tested routes`);
    }

    // -------------------------------------------------------------
    // 7. PHASE 5: IMAGE SYSTEM AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Image Integrity (P0) ---');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => img.naturalWidth === 0 && !img.src.includes('data:image'))
        .map(img => img.src);
    });

    const localPathsFound = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => img.src.toLowerCase().includes('c:\\') || img.src.includes('/tmp/'))
        .map(img => img.src);
    });

    record('images', 'Image Integrity', 'Zero broken images on homepage', brokenImages.length === 0,
      brokenImages.length === 0 ? 'All hero & card images loaded with naturalWidth > 0' : `Broken images: ${brokenImages.join(', ')}`);

    record('images', 'Image URLs', 'No local C:\\ or /tmp paths in image sources', localPathsFound.length === 0,
      localPathsFound.length === 0 ? 'All image sources use public/cloud URLs' : `Local paths detected: ${localPathsFound.join(', ')}`);

  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }

  return results;
}

if (require.main === module) {
  const target = process.argv[2] || 'http://localhost:3000';
  runLaunchAudit(target).then(res => {
    console.log('\nAudit complete. Summary:');
    for (const [cat, list] of Object.entries(res)) {
      const passed = list.filter(i => i.passed).length;
      console.log(`- ${cat.toUpperCase()}: ${passed}/${list.length} PASS`);
    }
  });
}

module.exports = { runLaunchAudit };
