const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ARTIFACT_DIR = 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/98f50ce8-5a99-4440-b5b7-9d5ae1491498';
const BASE_URL = 'http://localhost:3000';

async function captureEvidence() {
  const browser = await chromium.launch({ headless: true });

  // 1. Seller Dashboard & Buyer Enquiries page with new SellerNavbar & Still Available badge
  const context1 = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page1 = await context1.newPage();
  await page1.goto(`${BASE_URL}/seller/login`);
  await page1.waitForLoadState('networkidle');
  await page1.click('button:has-text("Auto-fill")');
  await page1.waitForTimeout(200);
  await page1.click('button[type="submit"]');
  await page1.waitForSelector('h1:has-text("Seller Dashboard")', { timeout: 10000 });
  await page1.waitForLoadState('networkidle');

  await page1.waitForSelector('select[aria-label="Change listing availability"]', { timeout: 10000 });
  await page1.waitForLoadState('networkidle');

  await page1.screenshot({
    path: path.join(ARTIFACT_DIR, 'evidence_seller_dashboard_availability.png'),
    fullPage: false,
  });
  console.log('Saved evidence_seller_dashboard_availability.png');

  await page1.goto(`${BASE_URL}/seller/enquiries`);
  await page1.waitForSelector('h1:has-text("Buyer Enquiries")', { timeout: 10000 });
  await page1.waitForLoadState('networkidle');
  await page1.screenshot({
    path: path.join(ARTIFACT_DIR, 'evidence_seller_enquiries_navbar.png'),
    fullPage: false,
  });
  console.log('Saved evidence_seller_enquiries_navbar.png');
  await context1.close();

  // 3. Landowner Status - Verification Pending
  const testRefPending = 'TRI-TEST-PENDING-' + Date.now().toString().slice(-4);
  await prisma.landowner.create({
    data: {
      referenceNumber: testRefPending,
      fullName: 'Suresh Menon',
      email: 'suresh.menon@example.com',
      phone: '+91 9447111222',
      district: 'Thiruvananthapuram',
      localBody: 'Thiruvananthapuram Corporation',
      locality: 'Kowdiar',
      verificationStatus: 'VERIFICATION_PENDING',
    },
  });

  const context2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page2 = await context2.newPage();
  await page2.goto(`${BASE_URL}/register/status?ref=${testRefPending}`);
  await page2.waitForLoadState('networkidle');
  await page2.screenshot({
    path: path.join(ARTIFACT_DIR, 'evidence_landowner_status_pending.png'),
    fullPage: false,
  });
  console.log('Saved evidence_landowner_status_pending.png');

  // 4. Landowner Status - Needs Clarification with Modal
  const testRefClarify = 'TRI-TEST-CLARIFY-' + Date.now().toString().slice(-4);
  await prisma.landowner.create({
    data: {
      referenceNumber: testRefClarify,
      fullName: 'Radhika Nair',
      email: 'radhika.nair@example.com',
      phone: '+91 9847222333',
      district: 'Ernakulam',
      localBody: 'Kochi Corporation',
      locality: 'Marine Drive',
      verificationStatus: 'NEEDS_CLARIFICATION',
      notes: 'Please provide survey sketch copy showing access road width towards north boundary.',
    },
  });

  await page2.goto(`${BASE_URL}/register/status?ref=${testRefClarify}`);
  await page2.waitForLoadState('networkidle');
  await page2.screenshot({
    path: path.join(ARTIFACT_DIR, 'evidence_landowner_status_clarification.png'),
    fullPage: false,
  });
  console.log('Saved evidence_landowner_status_clarification.png');

  // Click "Provide Clarification Now" to open modal
  await page2.click('button:has-text("Provide Clarification Now")');
  await page2.waitForTimeout(400);
  await page2.screenshot({
    path: path.join(ARTIFACT_DIR, 'evidence_landowner_clarification_modal.png'),
    fullPage: false,
  });
  console.log('Saved evidence_landowner_clarification_modal.png');
  await context2.close();

  // 5. Register Location Dropdown - Absence of Kazhakkottam Panchayat
  const context3 = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page3 = await context3.newPage();
  await page3.goto(`${BASE_URL}/register`);
  await page3.waitForLoadState('networkidle');
  await page3.click('#landowner-type-individual, button:has-text("Individual Landowner")');
  await page3.waitForTimeout(150);
  await page3.click('button:has-text("Next")');
  await page3.waitForTimeout(300);
  await page3.fill('input#fullName', 'Anand Nambiar');
  await page3.fill('input#phone', '9847012345');
  await page3.fill('input#email', 'anand.nambiar@example.com');
  await page3.click('#comm-phone, button:has-text("Phone")');
  await page3.waitForTimeout(150);
  await page3.click('button:has-text("Next")');
  await page3.waitForTimeout(400);

  // Select Thiruvananthapuram
  await page3.click('button#district');
  await page3.waitForTimeout(200);
  await page3.click('li:has-text("Thiruvananthapuram"), button:has-text("Thiruvananthapuram")');
  await page3.waitForTimeout(200);
  await page3.click('button#localBody');
  await page3.waitForTimeout(200);

  await page3.screenshot({
    path: path.join(ARTIFACT_DIR, 'evidence_location_dropdown_clean.png'),
    fullPage: false,
  });
  console.log('Saved evidence_location_dropdown_clean.png');
  await context3.close();

  await browser.close();
  await prisma.$disconnect();
  console.log('All visual evidence captured successfully!');
}

captureEvidence().catch(console.error);
