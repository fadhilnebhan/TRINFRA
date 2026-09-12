const { chromium } = require('playwright');

async function testSubmit() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err.message));

  page.on('response', async resp => {
    if (resp.url().includes('/api/register')) {
      console.log(`[API RESPONSE] ${resp.url()} -> Status: ${resp.status()}`);
      try {
        const body = await resp.text();
        console.log(`[API BODY] ${body}`);
      } catch (e) {
        console.log(`[API BODY ERROR] ${e.message}`);
      }
    }
  });

  console.log('Navigating to /register...');
  await page.goto('https://trinfra.vercel.app/register');
  await page.waitForLoadState('networkidle');

  // Step 0
  await page.click('button:has-text("Individual")');
  await page.click('#registration-next-btn');
  await page.waitForTimeout(500);

  // Step 1
  await page.fill('input#fullName', 'Gopalan Nambiar');
  await page.fill('input#phone', '9847198471');
  await page.fill('input#email', 'gopalan.nambiar@example.com');
  await page.click('button:has-text("Phone")');
  await page.click('#registration-next-btn');
  await page.waitForTimeout(500);

  // Step 2
  await page.click('button#district');
  await page.waitForTimeout(300);
  await page.click('ul#district-listbox li[role="option"]:has-text("Thiruvananthapuram")');
  await page.waitForTimeout(300);

  await page.click('button#localBody');
  await page.waitForTimeout(300);
  await page.click('ul#localBody-listbox li[role="option"]:has-text("Thiruvananthapuram Corporation")');
  await page.waitForTimeout(300);
  await page.fill('input#locality', 'Pattom');
  await page.click('#registration-next-btn');
  await page.waitForTimeout(500);

  // Step 3
  await page.fill('input#approximateArea', '2.5');
  await page.click('#ownership-sole, button:has-text("Sole Owner")');
  await page.click('#registration-next-btn');
  await page.waitForTimeout(500);

  // Step 4
  await page.click('#pooling-join, button:has-text("Join an Existing Opportunity")');
  await page.click('#registration-next-btn');
  await page.waitForTimeout(500);

  // Step 5
  console.log('On Step 5 Review. Checking consent box...');
  await page.locator('#consent-checkbox').check({ force: true });
  await page.waitForTimeout(500);

  console.log('Clicking Submit (#registration-next-btn)...');
  await page.click('#registration-next-btn');

  console.log('Waiting for success screen...');
  await page.waitForSelector('text=submitted successfully, text=Your Registration Reference', { timeout: 20000 });

  const text = await page.textContent('body');
  const hasSuccess = text.includes('Submitted') || text.includes('submitted successfully') || text.includes('TRI-');
  console.log('Has success text?', hasSuccess);
  const refMatch = text.match(/TRI-2026-\d{5}/) || text.match(/TRI-LAND-\d{6}-[A-Z0-9]{4}/);
  console.log('Ref Match:', refMatch ? refMatch[0] : 'None');

  await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/98f50ce8-5a99-4440-b5b7-9d5ae1491498/evidence_registration_submit_success.png' });

  if (refMatch) {
    const ref = refMatch[0];
    console.log(`Navigating to tracker for ref: ${ref}`);
    await page.goto(`https://trinfra.vercel.app/register/status?ref=${encodeURIComponent(ref)}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/98f50ce8-5a99-4440-b5b7-9d5ae1491498/evidence_tracker_verified.png' });
    const trackerText = await page.textContent('body');
    console.log('Tracker has status?', trackerText.includes('Under Review') || trackerText.includes('Status') || trackerText.includes('Submitted'));
  }

  await browser.close();
}

testSubmit().catch(console.error);
