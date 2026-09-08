// QA End-to-End CMS Test Suite for TRINFRA on live Supabase PostgreSQL
const BASE_URL = 'https://trinfra.vercel.app';

async function runE2ETests() {
  console.log('🚀 STARTING TRINFRA CMS END-TO-END QA TEST on:', BASE_URL);
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

  // 1. SECURITY / AUTHORIZATION TEST: Unauthenticated requests
  console.log('\n--- 1. SECURITY / AUTHORIZATION TESTS ---');
  try {
    const resPostOpp = await fetch(`${BASE_URL}/api/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized Test' }),
    });
    assert(resPostOpp.status === 401, 'Unauthenticated POST /api/opportunities returns 401 Unauthorized');

    const resPostProj = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized Project' }),
    });
    assert(resPostProj.status === 401, 'Unauthenticated POST /api/projects returns 401 Unauthorized');

    const resDelLandowner = await fetch(`${BASE_URL}/api/admin/landowners/non-existent-id`, {
      method: 'DELETE',
    });
    assert(resDelLandowner.status === 401, 'Unauthenticated DELETE /api/admin/landowners returns 401 Unauthorized');

    const resDelEnq = await fetch(`${BASE_URL}/api/admin/enquiries/non-existent-id`, {
      method: 'DELETE',
    });
    assert(resDelEnq.status === 401, 'Unauthenticated DELETE /api/admin/enquiries returns 401 Unauthorized');
  } catch (err) {
    console.error('Security test error:', err);
    failed++;
  }

  // 2. AUTHENTICATION: Admin Login
  console.log('\n--- 2. ADMIN AUTHENTICATION ---');
  let authCookie = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@trinfra.demo',
        password: 'TRINFRA-DEMO-2026',
      }),
    });
    assert(loginRes.status === 200, 'Admin login succeeds with HTTP 200');
    const setCookie = loginRes.headers.get('set-cookie');
    assert(!!setCookie, 'Admin session cookie received in response');
    authCookie = setCookie ? setCookie.split(';')[0] : '';
  } catch (err) {
    console.error('Login error:', err);
    failed++;
  }

  if (!authCookie) {
    console.error('❌ Could not authenticate as admin, halting authenticated tests.');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': authCookie,
  };

  // 3. OPPORTUNITY CMS WORKFLOW: Create -> Read Admin -> Read Public -> Edit -> Update Public -> Delete -> Disappear Public
  console.log('\n--- 3. OPPORTUNITY FULL CMS WORKFLOW ---');
  let testOppId = '';
  let testOppSlug = '';
  try {
    // A: Create
    const createOppRes = await fetch(`${BASE_URL}/api/opportunities`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Test Malappuram Residential Land Cluster',
        district: 'Malappuram',
        locality: 'Manjeri',
        location: 'Manjeri Bypass Road, Malappuram',
        area: 40.5,
        areaUnit: 'Acres',
        landownersCount: 14,
        status: 'OPEN',
        shortDescription: 'Prime 40-acre contiguous land cluster consolidated for residential township development.',
        overview: 'Full title deed verified land cluster with 4-lane arterial road frontage and municipal water supply access.',
        highlights: ['Clear title deeds verified', '4-lane arterial road frontage', 'Zoned for residential development'],
        image: '/images/opportunities/kozhikode.jpg',
      }),
    });
    assert(createOppRes.status === 201, 'POST /api/opportunities creates record with HTTP 201');
    const createData = await createOppRes.json();
    testOppId = createData.opportunity?.id;
    testOppSlug = createData.opportunity?.slug;
    assert(!!testOppId, `Opportunity created with ID: ${testOppId} and slug: ${testOppSlug}`);

    // B: Verify on public /api/opportunities
    const publicOppListRes = await fetch(`${BASE_URL}/api/opportunities?cacheBust=${Date.now()}`);
    const publicOppListData = await publicOppListRes.json();
    const foundPublic = (publicOppListData.opportunities || []).find((o) => o.id === testOppId);
    assert(!!foundPublic, 'Newly created opportunity appears immediately in public opportunities API');

    // C: Edit
    const editOppRes = await fetch(`${BASE_URL}/api/opportunities/${testOppId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Test Malappuram 40-Acre Master Planned Residential Cluster',
        area: 42.0,
        status: 'IN_PROGRESS',
      }),
    });
    assert(editOppRes.status === 200, 'PATCH /api/opportunities/[id] updates record with HTTP 200');

    // D: Verify edit on public API
    const updatedOppRes = await fetch(`${BASE_URL}/api/opportunities/${testOppId}?cacheBust=${Date.now()}`);
    const updatedOppData = await updatedOppRes.json();
    assert(
      updatedOppData.opportunity?.title === 'QA Test Malappuram 40-Acre Master Planned Residential Cluster',
      'Public page reflects updated opportunity title'
    );
    assert(
      updatedOppData.opportunity?.area === 42.0,
      'Public page reflects updated opportunity acreage'
    );

    // E: Delete
    const delOppRes = await fetch(`${BASE_URL}/api/opportunities/${testOppId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delOppRes.status === 200, 'DELETE /api/opportunities/[id] permanently deletes record from PostgreSQL');

    // F: Verify deletion reflects publicly
    const afterDelOppRes = await fetch(`${BASE_URL}/api/opportunities/${testOppId}?cacheBust=${Date.now()}`);
    assert(afterDelOppRes.status === 404, 'Deleted opportunity returns 404 Not Found on detail route');

    const afterDelListRes = await fetch(`${BASE_URL}/api/opportunities?cacheBust=${Date.now()}`);
    const afterDelListData = await afterDelListRes.json();
    const stillPresent = (afterDelListData.opportunities || []).find((o) => o.id === testOppId);
    assert(!stillPresent, 'Deleted opportunity is completely absent from public opportunities listing');
  } catch (err) {
    console.error('Opportunity workflow error:', err);
    failed++;
  } finally {
    if (testOppId) {
      try {
        await fetch(`${BASE_URL}/api/opportunities/${testOppId}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
      } catch (_) {}
    }
  }

  // 4. PROJECT FULL CMS WORKFLOW: Create -> Public Read -> Edit -> Update Public -> Delete
  console.log('\n--- 4. PROJECT FULL CMS WORKFLOW ---');
  let testProjId = '';
  try {
    // A: Create Project
    const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Test Palakkad Agro-Industrial Logistics Park',
        district: 'Palakkad',
        location: 'Walayar Industrial Corridor, Palakkad',
        approximateArea: '60 Acres',
        areaNum: 60,
        participatingLandowners: 22,
        status: 'PLANNING',
        developmentStage: 'PLANNING',
        progressPercentage: 15,
        description: 'Large-scale integrated logistics park along the industrial expressway corridor.',
        overview: 'Facilitating aggregation of 60 acres with multi-modal freight connectivity and institutional clearance support.',
        tags: ['Logistics', 'Industrial', 'Land Pooling'],
      }),
    });
    assert(createProjRes.status === 201, 'POST /api/projects creates record with HTTP 201');
    const projData = await createProjRes.json();
    testProjId = projData.project?.id;
    assert(!!testProjId, `Project created with ID: ${testProjId}`);

    // B: Verify on public /api/projects
    const publicProjListRes = await fetch(`${BASE_URL}/api/projects?cacheBust=${Date.now()}`);
    const publicProjListData = await publicProjListRes.json();
    const foundProj = (publicProjListData.projects || []).find((p) => p.id === testProjId);
    assert(!!foundProj, 'Newly created project appears immediately in public projects API');

    // C: Edit Project
    const editProjRes = await fetch(`${BASE_URL}/api/projects/${testProjId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Test Palakkad 60-Acre Multi-Modal Freight Hub',
        status: 'IN_PROGRESS',
        developmentStage: 'LAND_AGGREGATION',
        progressPercentage: 35,
      }),
    });
    assert(editProjRes.status === 200, 'PATCH /api/projects/[id] updates record with HTTP 200');

    // D: Verify edit on public API
    const updatedProjRes = await fetch(`${BASE_URL}/api/projects/${testProjId}?cacheBust=${Date.now()}`);
    const updatedProjData = await updatedProjRes.json();
    assert(
      updatedProjData.project?.title === 'QA Test Palakkad 60-Acre Multi-Modal Freight Hub',
      'Public page reflects updated project title'
    );
    assert(
      updatedProjData.project?.progressPercentage === 35,
      'Public page reflects updated progress percentage (35%)'
    );

    // E: Delete Project
    const delProjRes = await fetch(`${BASE_URL}/api/projects/${testProjId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delProjRes.status === 200, 'DELETE /api/projects/[id] deletes project from PostgreSQL');

    // F: Verify deletion publicly
    const afterDelProjRes = await fetch(`${BASE_URL}/api/projects/${testProjId}?cacheBust=${Date.now()}`);
    assert(afterDelProjRes.status === 404, 'Deleted project returns 404 Not Found');
  } catch (err) {
    console.error('Project workflow error:', err);
    failed++;
  } finally {
    if (testProjId) {
      try {
        await fetch(`${BASE_URL}/api/projects/${testProjId}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
      } catch (_) {}
    }
  }

  // 5. LANDOWNER MANAGEMENT: Register -> Admin View -> Status Update -> Delete
  console.log('\n--- 5. LANDOWNER FULL MANAGEMENT & DELETE ---');
  let testLandownerId = '';
  try {
    // A: Public registration
    const regRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Landowner Test User',
        phone: '9847100099',
        email: 'qa.test.landowner@trinfra.demo',
        district: 'Thrissur',
        localBody: 'Pudukad Grama Panchayat',
        locality: 'Pudukad',
        approximateArea: 12.5,
        areaUnit: 'Acres',
        ownershipStatus: 'Sole Ownership',
        poolingInterest: 'Join Existing Pool',
        landownerType: 'Individual',
        notes: 'QA Automated Verification Record',
      }),
    });
    const regData = await regRes.json();
    testLandownerId = regData.id;
    assert(regRes.ok && !!testLandownerId, `Public registration succeeds with ID: ${testLandownerId} ref: ${regData.referenceNumber}`);

    // B: Admin View & Status Update
    const statusUpdateRes = await fetch(`${BASE_URL}/api/admin/landowners/${testLandownerId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ verificationStatus: 'VERIFIED' }),
    });
    assert(statusUpdateRes.status === 200, 'Admin updates verificationStatus to VERIFIED in PostgreSQL');

    // C: Admin Delete
    const delLandownerRes = await fetch(`${BASE_URL}/api/admin/landowners/${testLandownerId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delLandownerRes.status === 200, 'Admin DELETE /api/admin/landowners/[id] succeeds with HTTP 200');

    // D: Verify gone from admin list
    const getDeletedRes = await fetch(`${BASE_URL}/api/admin/landowners/${testLandownerId}`, {
      headers: authHeaders,
    });
    assert(getDeletedRes.status === 404, 'Deleted landowner returns 404 Not Found from database');
  } catch (err) {
    console.error('Landowner test error:', err);
    failed++;
  }

  // 6. ENQUIRY MANAGEMENT: Submit -> Admin View -> Note & Status -> Delete
  console.log('\n--- 6. ENQUIRY FULL MANAGEMENT & DELETE ---');
  let testEnquiryId = '';
  try {
    // A: Public submission
    const enqRes = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Developer Enterprise',
        company: 'Apex Infrastructure Group',
        email: 'qa.developer@apexgroups.demo',
        phone: '9847200088',
        role: 'developer',
        interestType: 'explore_partnership',
        investmentRange: '₹25 Cr - ₹50 Cr',
        preferredLocation: 'Kozhikode',
        message: 'QA Automated inquiry message for institutional pooling validation.',
      }),
    });
    const enqData = await enqRes.json();
    testEnquiryId = enqData.id;
    assert(enqRes.ok && !!testEnquiryId, `Public enquiry created with ID: ${testEnquiryId} ref: ${enqData.referenceNumber}`);

    // B: Admin updates status & priority
    const patchEnqRes = await fetch(`${BASE_URL}/api/admin/enquiries/${testEnquiryId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'QUALIFIED', priority: 'HIGH' }),
    });
    assert(patchEnqRes.status === 200, 'Admin updates enquiry status to QUALIFIED and priority to HIGH');

    // C: Admin logs note
    const noteRes = await fetch(`${BASE_URL}/api/admin/enquiries/${testEnquiryId}/notes`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ content: 'Institutional developer validated by QA test.' }),
    });
    assert(noteRes.ok, 'Admin successfully logs note to enquiry in PostgreSQL (HTTP 201 Created)');

    // D: Admin Deletes Enquiry
    const delEnqRes = await fetch(`${BASE_URL}/api/admin/enquiries/${testEnquiryId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delEnqRes.status === 200, 'Admin DELETE /api/admin/enquiries/[id] permanently deletes record from PostgreSQL');
  } catch (err) {
    console.error('Enquiry test error:', err);
    failed++;
  }

  // 7. DEMO DATA PRESERVATION VERIFICATION
  console.log('\n--- 7. DEMO DATA PRESERVATION CHECK ---');
  try {
    const oppsRes = await fetch(`${BASE_URL}/api/opportunities`);
    const oppsData = await oppsRes.json();
    const demoOpps = ['OPP-1', 'OPP-2', 'OPP-3', 'OPP-4'];
    const oppIds = (oppsData.opportunities || []).map((o) => o.id);
    const hasAllDemoOpps = demoOpps.every((id) => oppIds.includes(id));
    assert(hasAllDemoOpps, `All 4 intentional demo Opportunities preserved: ${demoOpps.join(', ')}`);

    const projsRes = await fetch(`${BASE_URL}/api/projects`);
    const projsData = await projsRes.json();
    const demoProjs = ['PROJ-1', 'PROJ-2', 'PROJ-3', 'PROJ-4', 'PROJ-5'];
    const projIds = (projsData.projects || []).map((p) => p.id);
    const hasAllDemoProjs = demoProjs.every((id) => projIds.includes(id));
    assert(hasAllDemoProjs, `All 5 intentional demo Projects preserved: ${demoProjs.join(', ')}`);

    // Check admin dashboard stats
    const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: authHeaders,
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'Admin dashboard returns 200 OK');
    assert(dashData.stats?.totalOpportunities >= 4, `Dashboard reports ${dashData.stats?.totalOpportunities} opportunities in database`);
    assert(dashData.stats?.totalProjects >= 5, `Dashboard reports ${dashData.stats?.totalProjects} projects in database`);
  } catch (err) {
    console.error('Demo data check error:', err);
    failed++;
  }

  console.log('\n=============================================');
  console.log(`QA TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');
}

runE2ETests();
