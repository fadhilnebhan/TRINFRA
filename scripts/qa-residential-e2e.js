// QA End-to-End Residential Marketplace Test Suite for TRINFRA
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runResidentialE2E() {
  console.log('====================================================');
  console.log('🚀 RUNNING RESIDENTIAL MARKETPLACE E2E TEST SUITE');
  console.log('Target URL:', BASE_URL);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Canonical Data Protection
  // ----------------------------------------------------
  console.log('--- TEST 1: CANONICAL DATA PROTECTION ---');
  try {
    const oppRes = await fetch(`${BASE_URL}/api/opportunities`);
    const oppData = await oppRes.json();
    const oppIds = (oppData.opportunities || []).map((o) => o.id);
    assert(oppIds.includes('OPP-1'), 'OPP-1 exists and preserved');
    assert(oppIds.includes('OPP-2'), 'OPP-2 exists and preserved');
    assert(oppIds.includes('OPP-3'), 'OPP-3 exists and preserved');
    assert(oppIds.includes('OPP-4'), 'OPP-4 exists and preserved');
    assert(oppIds.length === 4, `Exactly 4 canonical opportunities exist (found: ${oppIds.length})`);

    const projRes = await fetch(`${BASE_URL}/api/projects`);
    const projData = await projRes.json();
    const projIds = (projData.projects || []).map((p) => p.id);
    assert(projIds.length === 5, `Exactly 5 canonical projects exist (found: ${projIds.length})`);
  } catch (err) {
    console.error('Test 1 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 2: 14 Kerala Districts Availability
  // ----------------------------------------------------
  console.log('\n--- TEST 2: 14 KERALA DISTRICTS AVAILABILITY ---');
  let districtsData = [];
  try {
    const distRes = await fetch(`${BASE_URL}/api/residential/districts`);
    assert(distRes.status === 200, 'GET /api/residential/districts returns 200 OK');
    const distJson = await distRes.json();
    assert(distJson.success === true, 'Response indicates success: true');
    districtsData = distJson.districts || [];
    assert(districtsData.length === 14, `Exactly 14 Kerala districts returned (found: ${districtsData.length})`);

    const ernakulam = districtsData.find((d) => d.district === 'Ernakulam');
    assert(ernakulam && ernakulam.count >= 2, `Ernakulam has active published listings (count: ${ernakulam?.count})`);
    assert(ernakulam?.hasListings === true, 'Ernakulam hasListings is true');

    const wayanad = districtsData.find((d) => d.district === 'Wayanad');
    assert(wayanad && wayanad.count === 0, `Wayanad currently has 0 listings (count: ${wayanad?.count})`);
    assert(wayanad?.hasListings === false, 'Wayanad hasListings is false');
  } catch (err) {
    console.error('Test 2 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 3: Auth & Protected Routes
  // ----------------------------------------------------
  console.log('\n--- TEST 3: AUTHENTICATION & ROLE-BASED ACCESS ---');
  let sellerCookieA = '';
  let sellerIdA = '';
  let sellerCookieB = '';
  let sellerIdB = '';
  let adminCookie = '';

  try {
    // 3.1 Unauthenticated access to seller API must be 401
    const unauthRes = await fetch(`${BASE_URL}/api/seller/listings`);
    assert(unauthRes.status === 401, 'Unauthenticated GET /api/seller/listings returns 401 Unauthorized');

    // 3.2 Seller A Login
    const loginResA = await fetch(`${BASE_URL}/api/seller/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller@trinfra.demo', password: 'TRINFRA-SELLER-2026' }),
    });
    assert(loginResA.status === 200, 'Seller A login returns 200 OK');
    const dataA = await loginResA.json();
    sellerIdA = dataA.user.id;
    const cookieHeaderA = loginResA.headers.get('set-cookie');
    sellerCookieA = cookieHeaderA ? cookieHeaderA.split(';')[0] : '';
    assert(sellerCookieA.includes('trinfra_user_session='), 'Seller session cookie established for Seller A');

    // 3.3 Register Seller B
    const uniqueEmailB = `seller_b_${Date.now()}@trinfra.demo`;
    const regResB = await fetch(`${BASE_URL}/api/seller/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Seller Beta',
        email: uniqueEmailB,
        phone: '+91 99999 88888',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    assert(regResB.status === 200, 'Registering Seller B returns 200 OK');
    const dataB = await regResB.json();
    sellerIdB = dataB.user.id;
    const cookieHeaderB = regResB.headers.get('set-cookie');
    sellerCookieB = cookieHeaderB ? cookieHeaderB.split(';')[0] : '';

    // 3.4 Duplicate registration check
    const dupRes = await fetch(`${BASE_URL}/api/seller/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate Mathew',
        email: 'seller@trinfra.demo',
        phone: '+91 98470 12345',
        password: 'Password123!',
      }),
    });
    assert(dupRes.status === 409, 'Duplicate seller email is rejected with 409 Conflict');

    // 3.5 Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@trinfra.demo', password: 'TRINFRA-DEMO-2026' }),
    });
    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    const adminCookieHeader = adminLoginRes.headers.get('set-cookie');
    adminCookie = adminCookieHeader ? adminCookieHeader.split(';')[0] : '';
  } catch (err) {
    console.error('Test 3 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 4: Seller Listing Creation, Draft & Moderation
  // ----------------------------------------------------
  console.log('\n--- TEST 4: SELLER LISTING WORKFLOW & OWNERSHIP ISOLATION ---');
  let testListingId = '';
  try {
    // 4.1 Seller A creates a draft listing
    const createRes = await fetch(`${BASE_URL}/api/seller/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sellerCookieA,
      },
      body: JSON.stringify({
        title: 'QA Test Sky Villa in Wayanad',
        propertyType: 'Villa',
        listingPurpose: 'Sale',
        description: 'Spectacular misty mountain villa in Kalpetta, Wayanad.',
        district: 'Wayanad',
        locality: 'Kalpetta',
        area: 2800,
        bedrooms: 3,
        bathrooms: 3,
        price: 18500000,
        images: [{ url: '/images/houses_tropical.jpeg', filename: 'wayanad_villa.jpg', isCover: true }],
        submitForReview: false,
      }),
    });
    assert(createRes.status === 200, 'Seller A creates listing as DRAFT');
    const createJson = await createRes.json();
    testListingId = createJson.listing.id;
    assert(createJson.listing.status === 'DRAFT', 'Listing initial status is DRAFT');

    // 4.2 Strict Ownership: Seller B cannot view Seller A's listing
    const accessResB = await fetch(`${BASE_URL}/api/seller/listings/${testListingId}`, {
      headers: { Cookie: sellerCookieB },
    });
    assert(accessResB.status === 403, 'Seller B is blocked with 403 Forbidden when accessing Seller A listing');

    // 4.3 Strict Ownership: Seller B cannot edit Seller A's listing
    const editResB = await fetch(`${BASE_URL}/api/seller/listings/${testListingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sellerCookieB,
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });
    assert(editResB.status === 403, 'Seller B is blocked with 403 Forbidden when modifying Seller A listing');

    // 4.4 Seller A submits listing for review
    const submitRes = await fetch(`${BASE_URL}/api/seller/listings/${testListingId}/submit`, {
      method: 'POST',
      headers: { Cookie: sellerCookieA },
    });
    assert(submitRes.status === 200, 'Seller A submits listing for review');
    const submitJson = await submitRes.json();
    assert(submitJson.listing.status === 'PENDING_REVIEW', 'Listing status transitioned to PENDING_REVIEW');

    // 4.5 Ensure PENDING_REVIEW listing is NOT visible on public marketplace
    const publicCheck = await fetch(`${BASE_URL}/api/residential/listings?district=Wayanad`);
    const publicJson = await publicCheck.json();
    assert(publicJson.total === 0, 'PENDING_REVIEW listing is hidden from public view');
  } catch (err) {
    console.error('Test 4 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 5: Admin Moderation & District Activation
  // ----------------------------------------------------
  console.log('\n--- TEST 5: ADMIN MODERATION & DYNAMIC DISTRICT ACTIVATION ---');
  try {
    // 5.1 Admin rejects listing with feedback
    const rejectRes = await fetch(`${BASE_URL}/api/admin/residential/listings/${testListingId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({ rejectionReason: 'Please specify the exact carpet area.' }),
    });
    assert(rejectRes.status === 200, 'Admin rejects listing with feedback reason');
    const rejectJson = await rejectRes.json();
    assert(rejectJson.listing.status === 'REJECTED', 'Listing status transitioned to REJECTED');

    // 5.2 Seller A resubmits
    const resubmitRes = await fetch(`${BASE_URL}/api/seller/listings/${testListingId}/submit`, {
      method: 'POST',
      headers: { Cookie: sellerCookieA },
    });
    assert(resubmitRes.status === 200, 'Seller resubmits listing after corrections');

    // 5.3 Admin approves listing -> becomes PUBLISHED
    const approveRes = await fetch(`${BASE_URL}/api/admin/residential/listings/${testListingId}/approve`, {
      method: 'POST',
      headers: { Cookie: adminCookie },
    });
    assert(approveRes.status === 200, 'Admin approves listing');
    const approveJson = await approveRes.json();
    assert(approveJson.listing.status === 'PUBLISHED', 'Listing status is now PUBLISHED');

    // 5.4 Verify Dynamic District Activation: Wayanad now has listings!
    const distCheckActive = await fetch(`${BASE_URL}/api/residential/districts`);
    const distActiveJson = await distCheckActive.json();
    const wayanadActive = (distActiveJson.districts || []).find((d) => d.district === 'Wayanad');
    assert(wayanadActive?.count === 1, 'Wayanad district count automatically increased to 1');
    assert(wayanadActive?.hasListings === true, 'Wayanad district automatically ACTIVATED (hasListings: true)');

    // 5.5 Public API now returns the Wayanad property
    const publicActiveRes = await fetch(`${BASE_URL}/api/residential/listings?district=Wayanad`);
    const publicActiveJson = await publicActiveRes.json();
    assert(publicActiveJson.total === 1, 'Public API returns 1 active listing for Wayanad');
    assert(publicActiveJson.listings[0].id === testListingId, 'Public listing matches approved listing ID');

    // 5.6 Admin unpublishes/deletes test listing -> Wayanad returns to empty state!
    const unpublishRes = await fetch(`${BASE_URL}/api/admin/residential/listings/${testListingId}/unpublish`, {
      method: 'POST',
      headers: { Cookie: adminCookie },
    });
    assert(unpublishRes.status === 200, 'Admin unpublishes listing');

    const distCheckInactive = await fetch(`${BASE_URL}/api/residential/districts`);
    const distInactiveJson = await distCheckInactive.json();
    const wayanadInactive = (distInactiveJson.districts || []).find((d) => d.district === 'Wayanad');
    assert(wayanadInactive?.count === 0, 'Wayanad district count automatically returned to 0');
    assert(wayanadInactive?.hasListings === false, 'Wayanad automatically returned to clean EMPTY state');

    // Clean up test listing
    await fetch(`${BASE_URL}/api/admin/residential/listings/${testListingId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
  } catch (err) {
    console.error('Test 5 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 6: Public Search & Filters
  // ----------------------------------------------------
  console.log('\n--- TEST 6: PUBLIC SEARCH, FILTERS & SORTING ---');
  try {
    // 6.1 Search by title keyword
    const searchRes = await fetch(`${BASE_URL}/api/residential/listings?search=Marine`);
    const searchJson = await searchRes.json();
    assert(searchJson.total >= 1, 'Search by title keyword "Marine" returns results');
    assert(searchJson.listings[0].title.includes('Marine'), 'Result title matches search term');

    // 6.2 Filter by property type
    const villaRes = await fetch(`${BASE_URL}/api/residential/listings?propertyType=Villa`);
    const villaJson = await villaRes.json();
    assert(villaJson.total >= 1, 'Filter by propertyType="Villa" returns villa listing');
    assert(villaJson.listings.every((l) => l.propertyType === 'Villa'), 'All results are Villas');

    // 6.3 Filter by listing purpose
    const rentRes = await fetch(`${BASE_URL}/api/residential/listings?listingPurpose=Rent`);
    const rentJson = await rentRes.json();
    assert(rentJson.total >= 1, 'Filter by listingPurpose="Rent" returns rental listings');
    assert(rentJson.listings.every((l) => l.listingPurpose === 'Rent'), 'All results are for Rent');

    // 6.4 Sorting
    const sortRes = await fetch(`${BASE_URL}/api/residential/listings?sortBy=price_asc`);
    const sortJson = await sortRes.json();
    const prices = sortJson.listings.map((l) => l.price);
    const isSorted = prices.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
    assert(isSorted, 'Sorting by price_asc returns listings in ascending price order');
  } catch (err) {
    console.error('Test 6 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 7: Buyer Enquiry System
  // ----------------------------------------------------
  console.log('\n--- TEST 7: BUYER ENQUIRY & ISOLATION ---');
  try {
    // 7.1 Fetch one published listing to enquire on
    const pubListRes = await fetch(`${BASE_URL}/api/residential/listings?limit=1`);
    const pubListJson = await pubListRes.json();
    const targetListing = pubListJson.listings[0];

    // 7.2 Submit enquiry
    const enqRes = await fetch(`${BASE_URL}/api/residential/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: targetListing.id,
        name: 'Arun Nair',
        email: 'arun.nair@example.com',
        phone: '+91 98471 99999',
        message: 'I am interested in scheduling a site visit this weekend.',
      }),
    });
    assert(enqRes.status === 200, 'POST /api/residential/enquiries creates enquiry in PostgreSQL');
    const enqData = await enqRes.json();
    const enquiryId = enqData.enquiryId;

    // 7.3 Seller A (owner) sees the enquiry
    const sellerEnqResA = await fetch(`${BASE_URL}/api/seller/enquiries`, {
      headers: { Cookie: sellerCookieA },
    });
    const sellerEnqJsonA = await sellerEnqResA.json();
    const foundEnqA = (sellerEnqJsonA.enquiries || []).find((e) => e.id === enquiryId);
    assert(Boolean(foundEnqA), 'Seller A can see the received enquiry in seller dashboard');

    // 7.4 Seller B (non-owner) CANNOT see the enquiry
    const sellerEnqResB = await fetch(`${BASE_URL}/api/seller/enquiries`, {
      headers: { Cookie: sellerCookieB },
    });
    const sellerEnqJsonB = await sellerEnqResB.json();
    const foundEnqB = (sellerEnqJsonB.enquiries || []).find((e) => e.id === enquiryId);
    assert(!foundEnqB, 'Seller B CANNOT see Seller A\'s enquiry (Strict Privacy)');

    // 7.5 Seller A updates enquiry status
    const updateEnqRes = await fetch(`${BASE_URL}/api/seller/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sellerCookieA,
      },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    assert(updateEnqRes.status === 200, 'Seller updates enquiry status to CONTACTED');
  } catch (err) {
    console.error('Test 7 error:', err);
    failed++;
  }

  // ----------------------------------------------------
  // TEST 8: Image Security & Fallback
  // ----------------------------------------------------
  console.log('\n--- TEST 8: IMAGE SECURITY & FALLBACK ---');
  try {
    // 8.1 Unauthenticated upload rejected
    const unauthUpload = await fetch(`${BASE_URL}/api/seller/upload-image`, {
      method: 'POST',
      body: new FormData(),
    });
    assert(unauthUpload.status === 401, 'Unauthenticated image upload is rejected with 401');

    // 8.2 Image serving route with graceful fallback
    const imgRes = await fetch(`${BASE_URL}/api/residential/images/non_existent_image.jpg`);
    assert(imgRes.status === 200, 'Missing image returns graceful 200 fallback buffer to prevent broken UI');
  } catch (err) {
    console.error('Test 8 error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runResidentialE2E().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
