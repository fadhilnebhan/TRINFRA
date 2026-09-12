const { chromium } = require('playwright');
const path = require('path');

async function captureTracker() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Navigating to tracker for TRI-2026-00017...');
  await page.goto('https://trinfra.vercel.app/register/status?ref=TRI-2026-00017', { waitUntil: 'networkidle' });

  await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/98f50ce8-5a99-4440-b5b7-9d5ae1491498/evidence_tracker_verified.png' });
  console.log('Screenshot saved to evidence_tracker_verified.png');

  const text = await page.textContent('body');
  console.log('Includes TRI-2026-00017?', text.includes('TRI-2026-00017'));
  console.log('Includes Thiruvananthapuram?', text.includes('Thiruvananthapuram'));
  console.log('Includes Under Review / Submitted?', text.includes('Submitted') || text.includes('Under Review') || text.includes('Verification'));

  await browser.close();
}

captureTracker().catch(console.error);
