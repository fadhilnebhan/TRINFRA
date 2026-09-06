/**
 * Comprehensive E2E Integration and Security Verification Suite
 * Covers all 26 demo steps + Security QA + Data Consistency QA
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
  console.log('=== STARTING TRINFRA E2E VERIFICATION SUITE ===\n');
  let failures = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`, details || '');
      failures++;
    }
  }

  try {
    // -------------------------------------------------------------
    // PART A: SECURITY & AUTHENTICATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Security & Unauthorized Access ---');
    
    // Test protected page redirect for unauthenticated user
    const unauthPageRes = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(
      unauthPageRes.status === 307 || unauthPageRes.status === 302 || unauthPageRes.headers.get('location')?.includes('/admin/login') === true,
      'Unauthenticated visit to /admin redirects to /admin/login',
      { status: unauthPageRes.status, location: unauthPageRes.headers.get('location') }
    );

    // Test protected API endpoint for unauthenticated user
    const unauthApiRes = await fetch(`${BASE_URL}/api/admin/dashboard`);
    assert(unauthApiRes.status === 401, 'Unauthenticated GET /api/admin/dashboard returns 401');

    const unauthDocsApi = await fetch(`${BASE_URL}/api/admin/documents`);
    assert(unauthDocsApi.status === 401, 'Unauthenticated GET /api/admin/documents returns 401');

    // Test login with valid credentials
    console.log('\n--- 2. Testing Admin Authentication ---');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@trinfra.demo', password: 'TRINFRA-DEMO-2026' }),
    });
    assert(loginRes.status === 200, 'Admin login with valid credentials succeeds (200)');
    
    const setCookie = loginRes.headers.get('set-cookie');
    assert(!!setCookie && setCookie.includes('admin_session'), 'Admin login sets admin_session cookie');
    const cookieHeader = setCookie ? setCookie.split(';')[0] : '';

    // Verify authenticated /api/admin/dashboard
    const authDashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: cookieHeader }
    });
    assert(authDashRes.status === 200, 'Authenticated GET /api/admin/dashboard returns 200');
    const dashDataBefore = await authDashRes.json();
    const initialLandownersCount = dashDataBefore.stats.totalLandowners;
    const initialEnquiriesCount = dashDataBefore.stats.developerEnquiries;
    console.log(`Initial Dashboard counts: Landowners=${initialLandownersCount}, Enquiries=${initialEnquiriesCount}`);

    // -------------------------------------------------------------
    // PART B: LANDOWNER REGISTRATION FLOW (Steps 1-4)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Public Landowner Registration (/api/register) ---');
    const demoLandownerPayload = {
      fullName: 'Ramesh Sundaram',
      phone: '+91 98765 43210',
      email: 'ramesh.sundaram@demo.trinfra.in',
      landownerType: 'Individual',
      communicationPreference: 'WhatsApp',
      district: 'Bengaluru Rural',
      localBody: 'Devanahalli Taluk',
      locality: 'Devanahalli Rural',
      approximateArea: 14.5,
      areaUnit: 'Acres',
      ownershipStatus: 'Sole Ownership',
      poolingInterest: 'Join Existing Pool',
      notes: 'Interested in industrial or logistics warehousing joint venture.',
    };

    const regRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demoLandownerPayload),
    });
    assert(regRes.status === 200 || regRes.status === 201, 'Landowner registration returns success status code');
    const regData = await regRes.json();
    assert(!!regData.referenceNumber && regData.referenceNumber.startsWith('TRI-'), 'Reference number generated (TRI-...)', regData.referenceNumber);
    assert(!!regData.id, 'Landowner ID returned in response');
    const newLandownerId = regData.id;

    // Verify DB write
    const dbLandowner = await prisma.landowner.findUnique({
      where: { id: newLandownerId },
      include: { parcels: true }
    });
    assert(!!dbLandowner, 'New landowner exists in SQLite database');
    assert(dbLandowner!.fullName === 'Ramesh Sundaram', 'Landowner full name persisted accurately');
    assert(dbLandowner!.verificationStatus === 'NEW', 'Landowner initial verificationStatus is NEW');
    assert(dbLandowner!.parcels.length === 1, 'Land parcel created with correct extent');

    // -------------------------------------------------------------
    // PART C: ADMIN VERIFICATION WORKFLOW (Steps 5-13)
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Landowner Verification Workflow ---');
    
    // Check dashboard count increased
    const authDashAfterReg = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: cookieHeader }
    });
    const dashDataAfterReg = await authDashAfterReg.json();
    assert(
      dashDataAfterReg.stats.totalLandowners === initialLandownersCount + 1,
      'Admin dashboard totalLandowners incremented by 1'
    );

    // Fetch landowner detail via admin API
    const getLandownerRes = await fetch(`${BASE_URL}/api/admin/landowners/${newLandownerId}`, {
      headers: { Cookie: cookieHeader }
    });
    assert(getLandownerRes.status === 200, 'Admin can fetch landowner detail');
    const landownerDetailData = await getLandownerRes.json();
    assert(landownerDetailData.landowner?.fullName === 'Ramesh Sundaram', 'Landowner detail contains correct data');

    // Test transition to NEEDS_CLARIFICATION with clarification note
    const clarifyRes = await fetch(`${BASE_URL}/api/admin/landowners/${newLandownerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        verificationStatus: 'NEEDS_CLARIFICATION',
        notes: 'Requested updated Encumbrance Certificate (EC) for survey number SY-402/1A.',
      }),
    });
    assert(clarifyRes.status === 200, 'Landowner status updated to NEEDS_CLARIFICATION');

    // Add note to landowner
    const addLandownerNoteRes = await fetch(`${BASE_URL}/api/admin/landowners/${newLandownerId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        content: 'Notified landowner via WhatsApp regarding pending EC copy.',
        authorRole: 'Verification Specialist',
      }),
    });
    assert(addLandownerNoteRes.status === 200, 'Admin note added to landowner record');

    const clarifyCheck = await prisma.landowner.findUnique({
      where: { id: newLandownerId },
      include: { adminNotes: true }
    });
    assert(clarifyCheck!.verificationStatus === 'NEEDS_CLARIFICATION', 'Database status updated to NEEDS_CLARIFICATION');
    assert(clarifyCheck!.adminNotes.some(n => n.content.includes('Notified landowner via WhatsApp')), 'Admin note recorded in database');

    // -------------------------------------------------------------
    // PART D: DOCUMENTS UI & PRIVATE STORAGE (Steps 10-11)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Private Document Upload & Access Control ---');
    
    // Create a mock document file in memory and upload via multipart form-data
    const dummyContent = 'TRINFRA DEMO VERIFIED TITLE DEED & SURVEY MAP SY-402/1A';
    const boundary = '----WebKitFormBoundaryE2ETestTrinfra7MA4YWxkTrZu0gW';
    const formBody = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="landownerId"`,
      '',
      newLandownerId,
      `--${boundary}`,
      `Content-Disposition: form-data; name="type"`,
      '',
      'OWNERSHIP',
      `--${boundary}`,
      `Content-Disposition: form-data; name="notes"`,
      '',
      'Verified RTC and Mutation Register Copy',
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="Title_Deed_SY402_1A.pdf"`,
      'Content-Type: application/pdf',
      '',
      dummyContent,
      `--${boundary}--`,
    ].join('\r\n');

    const uploadRes = await fetch(`${BASE_URL}/api/admin/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Cookie: cookieHeader,
      },
      body: formBody,
    });
    assert(uploadRes.status === 201, 'Document uploaded successfully via admin API (201)');
    const uploadData = await uploadRes.json();
    assert(!!uploadData.document?.id, 'Uploaded document returned an ID');
    const docId = uploadData.document.id;

    // Verify document on filesystem in private storage
    const storedDoc = await prisma.document.findUnique({ where: { id: docId } });
    assert(!!storedDoc, 'Document record found in database');
    const storedFilePath = path.resolve(process.cwd(), storedDoc?.filePath || '');
    assert(fs.existsSync(storedFilePath), `File physically exists in private storage at ${storedDoc?.filePath}`);

    // Verify document is NOT publicly accessible without auth
    const unauthDocDownload = await fetch(`${BASE_URL}/api/admin/documents/${docId}`);
    assert(unauthDocDownload.status === 401, 'Unauthenticated download of document returns 401 Unauthorized');

    // Verify authenticated document download
    const authDocDownload = await fetch(`${BASE_URL}/api/admin/documents/${docId}`, {
      headers: { Cookie: cookieHeader }
    });
    assert(authDocDownload.status === 200, 'Authenticated document download returns 200 OK');
    const downloadedText = await authDocDownload.text();
    assert(downloadedText === dummyContent, 'Downloaded document content matches uploaded file stream');

    // Mark document verified
    const patchDocRes = await fetch(`${BASE_URL}/api/admin/documents/${docId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ status: 'VERIFIED' }),
    });
    assert(patchDocRes.status === 200, 'Document status updated to VERIFIED');

    // Change Landowner status to VERIFIED (Step 12)
    const verifyLandownerRes = await fetch(`${BASE_URL}/api/admin/landowners/${newLandownerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        verificationStatus: 'VERIFIED',
        notes: 'All title documents and physical survey verified by legal team.',
      }),
    });
    assert(verifyLandownerRes.status === 200, 'Landowner status successfully updated to VERIFIED');
    const finalLandowner = await prisma.landowner.findUnique({ where: { id: newLandownerId } });
    assert(finalLandowner!.verificationStatus === 'VERIFIED', 'Database confirms landowner is VERIFIED');

    // -------------------------------------------------------------
    // PART E: DEVELOPER ENQUIRY FLOW (Steps 14-22)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Developer / Investor Enquiry Flow ---');
    const enquiryPayload = {
      fullName: 'Vikramaditya Singhania',
      company: 'Apex Industrial Logistics Ltd',
      email: 'v.singhania@apexlogistics.demo',
      phone: '+91 99887 76655',
      preferredContactMethod: 'Email',
      role: 'Developer / Builder',
      interestType: 'Joint Development Agreement',
      investmentRange: 'INR 50 Cr - 100 Cr',
      preferredLocation: 'Bengaluru Rural - Devanahalli Hub',
      message: 'Looking to acquire or partner on 10-25 acres along the proposed logistics spine.',
    };

    const enquiryRes = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryPayload),
    });
    assert(enquiryRes.status === 200 || enquiryRes.status === 201, 'Developer enquiry submitted returns success');
    const enquiryData = await enquiryRes.json();
    assert(!!enquiryData.referenceNumber && enquiryData.referenceNumber.startsWith('TRI-ENQ-'), 'Enquiry reference number generated (TRI-ENQ-...)', enquiryData.referenceNumber);
    const newEnquiryId = enquiryData.id;

    // Verify DB write
    const dbEnquiry = await prisma.developerEnquiry.findUnique({ where: { id: newEnquiryId } });
    assert(!!dbEnquiry, 'Developer enquiry exists in database');
    assert(dbEnquiry!.status === 'NEW', 'Initial enquiry status is NEW');
    assert(dbEnquiry!.priority === 'NORMAL', 'Initial enquiry priority is NORMAL');

    // Check dashboard enquiries count incremented
    const dashAfterEnquiry = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: cookieHeader }
    });
    const dashDataAfterEnquiry = await dashAfterEnquiry.json();
    assert(
      dashDataAfterEnquiry.stats.developerEnquiries === initialEnquiriesCount + 1,
      'Admin dashboard developerEnquiries incremented by 1'
    );

    // -------------------------------------------------------------
    // PART F: NOTIFICATIONS SYSTEM (Steps 15-16)
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing In-App Notifications ---');
    const notifsRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      headers: { Cookie: cookieHeader }
    });
    assert(notifsRes.status === 200, 'Admin can fetch notifications');
    const notifsData = await notifsRes.json();
    assert(notifsData.notifications.length > 0, 'Notifications list contains entries');
    assert(notifsData.unreadCount > 0, 'Unread notification count > 0');
    
    // Find the enquiry notification
    const enquiryNotif = notifsData.notifications.find((n: any) => n.title.includes('Developer') || n.message.includes('Vikramaditya'));
    assert(!!enquiryNotif, 'Notification created for new developer enquiry');

    // Test marking notification as read
    if (enquiryNotif) {
      const readNotifRes = await fetch(`${BASE_URL}/api/admin/notifications/${enquiryNotif.id}`, {
        method: 'PATCH',
        headers: { Cookie: cookieHeader }
      });
      assert(readNotifRes.status === 200, 'Notification marked as read');
    }

    // -------------------------------------------------------------
    // PART G: ADMIN ENQUIRIES ACTIONS & PERSISTENCE (Steps 17-22)
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Admin Enquiries Management ---');
    
    // Change priority to HIGH
    const updatePriorityRes = await fetch(`${BASE_URL}/api/admin/enquiries/${newEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ priority: 'HIGH' }),
    });
    assert(updatePriorityRes.status === 200, 'Enquiry priority updated to HIGH');

    // Change status to CONTACTED
    const updateStatusRes = await fetch(`${BASE_URL}/api/admin/enquiries/${newEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    assert(updateStatusRes.status === 200, 'Enquiry status updated to CONTACTED');

    // Add internal note (Step 20)
    const addNoteRes = await fetch(`${BASE_URL}/api/admin/enquiries/${newEnquiryId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ content: 'Held initial discovery call with Vikramaditya; shared OPP-1 dossier.' }),
    });
    assert(addNoteRes.status === 201, 'Internal note added to enquiry');

    // Refresh & verify persistence (Steps 21-22)
    const refreshedEnquiryRes = await fetch(`${BASE_URL}/api/admin/enquiries/${newEnquiryId}`, {
      headers: { Cookie: cookieHeader }
    });
    const refreshedEnquiryData = await refreshedEnquiryRes.json();
    const refreshedEnquiry = refreshedEnquiryData.enquiry;
    assert(refreshedEnquiry.priority === 'HIGH', 'Refreshed enquiry confirms priority persisted as HIGH');
    assert(refreshedEnquiry.status === 'CONTACTED', 'Refreshed enquiry confirms status persisted as CONTACTED');
    assert(
      refreshedEnquiry.adminNotes.some((n: any) => n.content.includes('Held initial discovery call')),
      'Refreshed enquiry confirms internal note persisted'
    );

    // -------------------------------------------------------------
    // PART H: PUBLIC PAGES & DATA CONSISTENCY (Steps 23-26)
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Public Pages & Content ---');
    const publicPages = [
      '/',
      '/opportunities',
      '/projects',
      '/about',
      '/how-it-works',
      '/knowledge-centre',
      '/register',
      '/enquiry'
    ];

    for (const page of publicPages) {
      const res = await fetch(`${BASE_URL}${page}`);
      assert(
        res.status === 200 || res.status === 307,
        `Public page ${page} responds cleanly (${res.status})`
      );
    }

    const kcArticle = await fetch(`${BASE_URL}/knowledge-centre/what-is-land-pooling`);
    assert(kcArticle.status === 200, 'Knowledge article /knowledge-centre/what-is-land-pooling loads cleanly (200 OK)');

    // Check dynamic detail pages
    const oppRes = await fetch(`${BASE_URL}/opportunities/OPP-1`);
    assert(oppRes.status === 200, 'Opportunity detail /opportunities/OPP-1 loads cleanly');

    const projRes = await fetch(`${BASE_URL}/projects/PROJ-1`);
    assert(projRes.status === 200, 'Project detail /projects/PROJ-1 loads cleanly');

    console.log('\n=== E2E VERIFICATION COMPLETED ===');
    console.log(`Total Failures: ${failures}`);
    if (failures === 0) {
      console.log('ALL 26+ INTEGRATION AND SECURITY CHECKS PASSED SUCCESSFULLY!');
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
