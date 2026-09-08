const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\0b880c18-f10c-475f-b8e2-42d0fee3706d';
const BASE_URL = 'https://trinfra.vercel.app';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Homepage with Choice Modal open
  console.log('Capturing Desktop Choice Modal...');
  const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskContext.newPage();
  await deskPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(1000);
  await deskPage.click('#hero-register-list-cta');
  await deskPage.waitForTimeout(600);
  await deskPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage_choice_modal_desktop.png'), fullPage: false });

  // 2. Mobile Homepage with Choice Modal open
  console.log('Capturing Mobile Choice Modal...');
  const mobContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobPage = await mobContext.newPage();
  await mobPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobPage.waitForTimeout(1000);
  await mobPage.click('#hero-register-list-cta');
  await mobPage.waitForTimeout(600);
  await mobPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage_choice_modal_mobile.png'), fullPage: false });

  // 3. Opportunities page with contextual "Register Your Land" CTA
  console.log('Capturing Opportunities contextual CTA...');
  await deskPage.goto(`${BASE_URL}/opportunities`, { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(1000);
  await deskPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'opportunities_contextual_land_cta.png'), fullPage: false });

  // 4. Residential page with contextual "List Your Property" CTA
  console.log('Capturing Residential contextual CTA...');
  await deskPage.goto(`${BASE_URL}/residential`, { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(1000);
  await deskPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'residential_contextual_list_cta.png'), fullPage: false });

  // 5. Residential Multi-Step Form on Desktop (logged in)
  console.log('Capturing Residential Multi-Step Form...');
  await deskPage.goto(`${BASE_URL}/seller/login?redirect=/seller/listings/new`, { waitUntil: 'networkidle' });
  await deskPage.fill('input[type="email"]', 'seller@trinfra.demo');
  await deskPage.fill('input[type="password"]', 'TRINFRA-SELLER-2026');
  await deskPage.click('button[type="submit"]');
  await deskPage.waitForSelector('#residential-property-area-input, h1:has-text("Property Type")', { timeout: 15000 });
  await deskPage.waitForTimeout(1000);
  await deskPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'residential_form_step1_desktop.png'), fullPage: false });

  // Advance to Step 3 (Specs & Area in sq ft)
  await deskPage.fill('input[placeholder*="Modern 3 BHK"]', 'Luxury 3 BHK Penthouse Marine Drive');
  await deskPage.click('#residential-next-btn');
  await deskPage.waitForTimeout(500);
  await deskPage.fill('input[placeholder*="Marine Drive, Kakkanad"]', 'Marine Drive Promenade');
  await deskPage.click('#residential-next-btn');
  await deskPage.waitForTimeout(500);
  await deskPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'residential_form_step3_specs_sqft.png'), fullPage: false });

  // 6. Mobile Multi-Step Form
  console.log('Capturing Mobile Residential Form...');
  await mobPage.goto(`${BASE_URL}/seller/login?redirect=/seller/listings/new`, { waitUntil: 'networkidle' });
  await mobPage.fill('input[type="email"]', 'seller@trinfra.demo');
  await mobPage.fill('input[type="password"]', 'TRINFRA-SELLER-2026');
  await mobPage.click('button[type="submit"]');
  await mobPage.waitForSelector('h1:has-text("Property Type")', { timeout: 15000 });
  await mobPage.waitForTimeout(1000);
  await mobPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'residential_form_mobile.png'), fullPage: false });

  await browser.close();
  console.log('✨ All feature screenshots captured successfully!');
}

capture().catch(console.error);
