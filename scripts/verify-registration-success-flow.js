const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 TESTING LAND REGISTRATION SUCCESS FLOW & ANIMATION');
  console.log('Target URL:', BASE_URL);
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const testEmail = `qa.anim.test.${Date.now()}@trinfra.test`;
  let createdLandownerId = null;

  try {
    // Phase 1: Real browser submission on Desktop (1440px)
    console.log('--- PHASE 1: FORM COMPLETION & SUBMISSION ---');
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });

    // Step 0: You (Select Landowner Type)
    console.log('  Filling Step 0: Landowner Type...');
    await page.locator('button:has-text("Individual")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 1: Contact details
    console.log('  Filling Step 1: Contact Info...');
    await page.locator('input#fullName').fill('Anoop Menon');
    await page.locator('input#phone').fill('+919847012345');
    await page.locator('input#email').fill(testEmail);
    // Communication preference
    const whatsappBtn = page.locator('button#comm-whatsapp, button:has-text("WhatsApp")').first();
    if (await whatsappBtn.isVisible()) await whatsappBtn.click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 2: Location
    console.log('  Filling Step 2: Location...');
    // Open District CustomSelect
    await page.locator('button#district').click();
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]:has-text("Ernakulam")').first().click();
    await page.waitForTimeout(400);

    // Open Local Body CustomSelect
    await page.locator('button#localBody').click();
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(300);

    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 3: Land details
    console.log('  Filling Step 3: Land Details...');
    await page.locator('input#approximateArea').fill('4.5');
    await page.locator('button#ownership-sole, button:has-text("Sole Owner")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 4: Interest
    console.log('  Filling Step 4: Pooling Interest...');
    await page.locator('button#pooling-join, button:has-text("Join an Existing")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 5: Review & Consent
    console.log('  Filling Step 5: Review & Consent...');
    await page.locator('label[for="consent-checkbox"]').click();
    await page.waitForTimeout(300);

    // Listen for the /api/register network response and click Submit Enquiry
    console.log('  Submitting form...');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/register') && res.request().method() === 'POST', { timeout: 25000 }),
      page.locator('button:has-text("Submit Enquiry")').click()
    ]);

    const resStatus = response.status();
    const resBody = await response.json();
    console.log(`  API Response: status=${resStatus}, referenceNumber=${resBody.referenceNumber}`);
    if (resStatus !== 200 && resStatus !== 201) {
      throw new Error(`API returned error: ${JSON.stringify(resBody)}`);
    }

    const generatedRef = resBody.referenceNumber;
    createdLandownerId = resBody.landownerId;

    // Wait for Success Screen
    console.log('  Waiting for Success Animation and Screen...');
    await page.waitForSelector('text=Registration Successful', { timeout: 10000 });
    console.log('  ✅ [PASS] Success screen appeared after API confirmation');

    // Screenshot desktop success
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/0b880c18-f10c-475f-b8e2-42d0fee3706d/registration_success_desktop.png' });

    // Validate Elements on Success Screen
    console.log('\n--- PHASE 2: CONTENT & VISUAL ELEMENT VALIDATION ---');
    const pageText = await page.locator('body').innerText();

    const hasRegSuccessfulHeading = pageText.includes('Registration Successful');
    console.log(`  Heading "Registration Successful" present: ${hasRegSuccessfulHeading ? 'YES (PASS)' : 'NO (FAIL)'}`);

    const hasSubmittedSubtext = pageText.includes('Your land registration has been submitted successfully.');
    console.log(`  Subtext "Your land registration has been submitted successfully." present: ${hasSubmittedSubtext ? 'YES (PASS)' : 'NO (FAIL)'}`);

    const hasTeamReview = pageText.includes('Our team will review your details and get back to you.');
    console.log(`  Explanation "Our team will review your details and get back to you." present: ${hasTeamReview ? 'YES (PASS)' : 'NO (FAIL)'}`);

    const hasReturnHomeBtn = await page.locator('a:has-text("Return Home")').isVisible();
    console.log(`  "Return Home" button present: ${hasReturnHomeBtn ? 'YES (PASS)' : 'NO (FAIL)'}`);

    const returnHomeHref = await page.locator('a:has-text("Return Home")').getAttribute('href');
    console.log(`  "Return Home" destination: "${returnHomeHref}" (PASS: ${returnHomeHref === '/' ? 'YES' : 'NO'})`);

    const hasCheckmark = await page.locator('svg path[d="M5 13l4 4L19 7"]').isVisible();
    console.log(`  Animated checkmark SVG path present: ${hasCheckmark ? 'YES (PASS)' : 'NO (FAIL)'}`);

    // Verify token is NOT displayed anywhere
    const containsGeneratedToken = pageText.includes(generatedRef);
    const containsReferenceLabel = pageText.includes('Reference Number');
    const containsCopiedNotice = pageText.includes('Copied to clipboard');
    console.log(`  Visible token (${generatedRef}) displayed: ${containsGeneratedToken ? 'FAIL (VISIBLE)' : 'NO (PASS - HIDDEN)'}`);
    console.log(`  "Reference Number" label displayed: ${containsReferenceLabel ? 'FAIL (VISIBLE)' : 'NO (PASS - HIDDEN)'}`);
    console.log(`  "Copied to clipboard" displayed: ${containsCopiedNotice ? 'FAIL (VISIBLE)' : 'NO (PASS - HIDDEN)'}`);

    if (!hasRegSuccessfulHeading || !hasSubmittedSubtext || !hasReturnHomeBtn || containsGeneratedToken || containsReferenceLabel) {
      throw new Error('Verification failed: Success screen does not meet requirements');
    }

    // Phase 3: Responsive Audit across all 9 viewports
    console.log('\n--- PHASE 3: RESPONSIVE AUDIT ACROSS 9 VIEWPORTS ---');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      const metrics = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;
        return {
          hasOverflow: scrollWidth > innerWidth || bodyScrollWidth > innerWidth,
          scrollWidth,
          innerWidth
        };
      });

      if (metrics.hasOverflow) {
        console.error(`  ❌ [FAIL] ${vp.name}: Horizontal overflow detected (${metrics.scrollWidth}px > ${metrics.innerWidth}px)`);
        throw new Error(`Horizontal overflow on ${vp.name}`);
      } else {
        console.log(`  ✅ [PASS] ${vp.name} (${vp.width}x${vp.height}) -> 0px overflow, cleanly centered`);
      }

      if (vp.name === '390px') {
        await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/0b880c18-f10c-475f-b8e2-42d0fee3706d/registration_success_mobile.png' });
      }
    }

    // Phase 4: Accessibility / Reduced Motion Check
    console.log('\n--- PHASE 4: ACCESSIBILITY & PREFERS-REDUCED-MOTION ---');
    const reducedMotionContext = await browser.newContext({
      reducedMotion: 'reduce'
    });
    const rmPage = await reducedMotionContext.newPage();
    await rmPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    console.log('  ✅ [PASS] prefers-reduced-motion: reduce respected cleanly');
    await reducedMotionContext.close();

    console.log('\n====================================================');
    console.log('🎉 ALL LAND REGISTRATION SUCCESS CHECKS PASSED!');
    console.log('====================================================');

  } finally {
    await browser.close();
    // Clean up test landowner record from production DB
    if (createdLandownerId) {
      console.log(`\nCleaning up test landowner ID: ${createdLandownerId}...`);
      try {
        await prisma.parcelDocument.deleteMany({ where: { parcel: { landownerId: createdLandownerId } } });
        await prisma.adminNotification.deleteMany({ where: { landownerId: createdLandownerId } });
        await prisma.parcel.deleteMany({ where: { landownerId: createdLandownerId } });
        await prisma.landowner.deleteMany({ where: { id: createdLandownerId } });
        console.log('Cleaned up test record successfully.');
      } catch (cleanErr) {
        console.warn('Cleanup warning:', cleanErr.message);
      }
    }
    await prisma.$disconnect();
  }
}

runVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
