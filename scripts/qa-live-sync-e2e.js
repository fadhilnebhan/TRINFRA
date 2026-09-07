// Dedicated Live Public Data Sync E2E Test Suite for TRINFRA
// Simulates an already-open browser session polling for database changes
// Tests CREATE -> UPDATE -> DELETE for both Opportunities and Projects
const targetUrl = process.argv[2] || process.env.TEST_BASE_URL || 'https://trinfra.vercel.app';

async function runLiveSyncTests() {
  console.log('🚀 STARTING TRINFRA LIVE PUBLIC DATA SYNC E2E TEST on:', targetUrl);
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

  // 1. ADMIN AUTHENTICATION
  console.log('\n--- 1. ADMIN AUTHENTICATION ---');
  let authCookie = '';
  try {
    const loginRes = await fetch(`${targetUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@trinfra.demo',
        password: 'TRINFRA-DEMO-2026',
      }),
    });
    assert(loginRes.status === 200, 'Admin login succeeds with HTTP 200');
    const setCookie = loginRes.headers.get('set-cookie');
    assert(!!setCookie, 'Admin session cookie received');
    authCookie = setCookie ? setCookie.split(';')[0] : '';
  } catch (err) {
    console.error('Login error:', err);
    failed++;
  }

  if (!authCookie) {
    console.error('❌ Cannot proceed without admin auth cookie');
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': authCookie,
  };

  // 2. SIMULATE BROWSER A: ALREADY-OPEN OPPORTUNITIES PAGE
  console.log('\n--- 2. SIMULATE BROWSER A: INITIAL PAGE STATE ---');
  let clientOpportunities = [];
  try {
    const initialRes = await fetch(`${targetUrl}/api/opportunities`, { cache: 'no-store' });
    const initialData = await initialRes.json();
    clientOpportunities = initialData.opportunities || [];
    assert(Array.isArray(clientOpportunities), 'Browser A loads initial opportunities from DB');
    console.log(`  ℹ️ Browser A initial opportunity count: ${clientOpportunities.length}`);
  } catch (err) {
    console.error('Initial fetch error:', err);
    failed++;
  }

  const initialCount = clientOpportunities.length;
  let testOppId = '';

  // 3. ADMIN IN BROWSER B: CREATE OPPORTUNITY
  console.log('\n--- 3. BROWSER B (ADMIN) CREATES OPPORTUNITY -> BROWSER A LIVE SYNC ---');
  try {
    const testTitle = `Live Sync Test Land ${Date.now()}`;
    const createRes = await fetch(`${targetUrl}/api/opportunities`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: testTitle,
        location: 'Kozhikode Bypass, Kerala',
        district: 'Kozhikode',
        locality: 'Pantheeramkavu',
        area: 85,
        areaUnit: 'Acres',
        landownersCount: 14,
        status: 'OPEN',
        shortDescription: 'Temporary test opportunity for live sync E2E test.',
        overview: 'Automated test record created to verify live client polling.',
        highlights: JSON.stringify(['Four-lane highway access', 'Direct DB test record']),
      }),
    });

    assert(createRes.status === 201, 'Admin creates temporary test opportunity (HTTP 201)');
    const createData = await createRes.json();
    testOppId = createData.opportunity?.id;
    assert(!!testOppId, `Created test opportunity ID: ${testOppId}`);

    // BROWSER A SILENT BACKGROUND POLL (Without page refresh)
    console.log('  ⏳ Browser A polling API in background...');
    const syncRes = await fetch(`${targetUrl}/api/opportunities`, { cache: 'no-store' });
    const syncData = await syncRes.json();
    const freshOpps = syncData.opportunities || [];

    const foundInBrowserA = freshOpps.some((o) => o.id === testOppId);
    assert(foundInBrowserA, 'Browser A automatically detects newly created opportunity WITHOUT refresh');
    assert(freshOpps.length === initialCount + 1, `Browser A opportunity count updated from ${initialCount} to ${freshOpps.length}`);
    clientOpportunities = freshOpps;
  } catch (err) {
    console.error('Create live-sync error:', err);
    failed++;
  }

  // 4. ADMIN IN BROWSER B: UPDATE OPPORTUNITY
  console.log('\n--- 4. BROWSER B (ADMIN) UPDATES OPPORTUNITY -> BROWSER A LIVE SYNC ---');
  try {
    const updatedTitle = `Live Sync Test Land - UPDATED ${Date.now()}`;
    const updateRes = await fetch(`${targetUrl}/api/opportunities/${testOppId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: updatedTitle,
        area: 95,
        status: 'IN_PROGRESS',
      }),
    });
    assert(updateRes.status === 200, 'Admin updates test opportunity (HTTP 200)');

    // BROWSER A SILENT BACKGROUND POLL
    console.log('  ⏳ Browser A polling API in background...');
    const syncRes = await fetch(`${targetUrl}/api/opportunities`, { cache: 'no-store' });
    const syncData = await syncRes.json();
    const freshOpps = syncData.opportunities || [];

    const updatedOppInA = freshOpps.find((o) => o.id === testOppId);
    assert(!!updatedOppInA, 'Test opportunity still present in Browser A dataset');
    assert(updatedOppInA?.title === updatedTitle, `Browser A automatically reflects updated title: "${updatedOppInA?.title}"`);
    assert(updatedOppInA?.area === 95, `Browser A automatically reflects updated area: ${updatedOppInA?.area} Acres`);
    clientOpportunities = freshOpps;
  } catch (err) {
    console.error('Update live-sync error:', err);
    failed++;
  }

  // 5. DETAIL PAGE LIVE-SYNC (Active page detects update)
  console.log('\n--- 5. DETAIL PAGE LIVE-SYNC ---');
  try {
    const detailRes = await fetch(`${targetUrl}/api/opportunities/${testOppId}`, { cache: 'no-store' });
    assert(detailRes.status === 200, 'Opportunity detail API returns HTTP 200 for active record');
    const detailData = await detailRes.json();
    assert(detailData.opportunity?.id === testOppId, 'Detail view retrieves accurate record');
  } catch (err) {
    console.error('Detail live-sync error:', err);
    failed++;
  }

  // 6. ADMIN IN BROWSER B: DELETE OPPORTUNITY
  console.log('\n--- 6. BROWSER B (ADMIN) DELETES OPPORTUNITY -> BROWSER A LIVE SYNC & 404 ---');
  try {
    const deleteRes = await fetch(`${targetUrl}/api/opportunities/${testOppId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteRes.status === 200, 'Admin deletes test opportunity (HTTP 200)');

    // BROWSER A SILENT BACKGROUND POLL (Without page refresh)
    console.log('  ⏳ Browser A polling API in background...');
    const syncRes = await fetch(`${targetUrl}/api/opportunities`, { cache: 'no-store' });
    const syncData = await syncRes.json();
    const freshOpps = syncData.opportunities || [];

    const stillInA = freshOpps.some((o) => o.id === testOppId);
    assert(!stillInA, 'Deleted opportunity automatically removed from Browser A dataset WITHOUT refresh');
    assert(freshOpps.length === initialCount, `Browser A opportunity count restored to initial ${initialCount}`);

    // BROWSER A DETAIL PAGE POLL (Detects 404)
    const detailResAfterDelete = await fetch(`${targetUrl}/api/opportunities/${testOppId}`, { cache: 'no-store' });
    assert(detailResAfterDelete.status === 404, 'Detail page poll receives HTTP 404 and transitions to Not Found');
  } catch (err) {
    console.error('Delete live-sync error:', err);
    failed++;
  }

  // 7. PROJECTS LIVE-SYNC LIFECYCLE
  console.log('\n--- 7. PROJECTS LIVE-SYNC LIFECYCLE (CREATE -> UPDATE -> DELETE) ---');
  let testProjId = '';
  let initialProjectCount = 0;
  try {
    const initialProjectsRes = await fetch(`${targetUrl}/api/projects`, { cache: 'no-store' });
    const initialProjectsData = await initialProjectsRes.json();
    const projectsList = initialProjectsData.projects || [];
    initialProjectCount = projectsList.length;
    console.log(`  ℹ️ Browser A initial projects count: ${initialProjectCount}`);

    // CREATE PROJECT
    const projTitle = `Live Sync Project ${Date.now()}`;
    const createProjRes = await fetch(`${targetUrl}/api/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: projTitle,
        location: 'Ernakulam West, Kerala',
        district: 'Ernakulam',
        approximateArea: '60 Acres',
        areaNum: 60,
        participatingLandowners: 12,
        status: 'PLANNING',
        developmentStage: 'PLANNING',
        progressPercentage: 20,
        description: 'Temporary test project for live sync E2E test.',
        overview: 'Project created for automated live sync testing.',
        tags: JSON.stringify(['Urban', 'High Growth']),
      }),
    });
    assert(createProjRes.status === 201, 'Admin creates temporary test project (HTTP 201)');
    const createProjData = await createProjRes.json();
    testProjId = createProjData.project?.id;
    assert(!!testProjId, `Created test project ID: ${testProjId}`);

    // BROWSER A POLLS PROJECTS
    console.log('  ⏳ Browser A polling /api/projects in background...');
    const syncProjRes = await fetch(`${targetUrl}/api/projects`, { cache: 'no-store' });
    const syncProjData = await syncProjRes.json();
    const freshProjects = syncProjData.projects || [];
    const foundProjInA = freshProjects.some((p) => p.id === testProjId);
    assert(foundProjInA, 'Browser A automatically detects newly created project WITHOUT refresh');
    assert(freshProjects.length === initialProjectCount + 1, `Browser A project count updated to ${freshProjects.length}`);

    // UPDATE PROJECT
    const updatedProjTitle = `Live Sync Project - UPDATED ${Date.now()}`;
    const updateProjRes = await fetch(`${targetUrl}/api/projects/${testProjId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: updatedProjTitle,
        progressPercentage: 45,
        status: 'DEVELOPMENT',
      }),
    });
    assert(updateProjRes.status === 200, 'Admin updates test project (HTTP 200)');

    // BROWSER A POLLS PROJECTS AGAIN
    const syncProjRes2 = await fetch(`${targetUrl}/api/projects`, { cache: 'no-store' });
    const syncProjData2 = await syncProjRes2.json();
    const updatedProjInA = syncProjData2.projects?.find((p) => p.id === testProjId);
    assert(updatedProjInA?.title === updatedProjTitle, `Browser A automatically reflects updated project title: "${updatedProjInA?.title}"`);
    assert(updatedProjInA?.progressPercentage === 45, `Browser A automatically reflects updated progress: ${updatedProjInA?.progressPercentage}%`);

    // DELETE PROJECT
    const deleteProjRes = await fetch(`${targetUrl}/api/projects/${testProjId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteProjRes.status === 200, 'Admin deletes test project (HTTP 200)');

    // BROWSER A POLLS PROJECTS AFTER DELETE
    const syncProjRes3 = await fetch(`${targetUrl}/api/projects`, { cache: 'no-store' });
    const syncProjData3 = await syncProjRes3.json();
    const stillInProjA = syncProjData3.projects?.some((p) => p.id === testProjId);
    assert(!stillInProjA, 'Deleted project automatically removed from Browser A dataset WITHOUT refresh');
    assert(syncProjData3.projects?.length === initialProjectCount, `Browser A project count restored to ${initialProjectCount}`);

    // DETAIL ROUTE RECEIVES 404
    const projDetailRes = await fetch(`${targetUrl}/api/projects/${testProjId}`, { cache: 'no-store' });
    assert(projDetailRes.status === 404, 'Project detail API returns HTTP 404 after deletion');
  } catch (err) {
    console.error('Project live-sync error:', err);
    failed++;
  }

  // 8. VERIFY DEMO DATA INTEGRITY
  console.log('\n--- 8. DEMO DATA INTEGRITY & ZERO LEFTOVER RECORDS ---');
  try {
    const oppsRes = await fetch(`${targetUrl}/api/opportunities`, { cache: 'no-store' });
    const oppsData = await oppsRes.json();
    const opps = oppsData.opportunities || [];

    const expectedOpps = ['OPP-1', 'OPP-2', 'OPP-3', 'OPP-4'];
    for (const id of expectedOpps) {
      assert(opps.some((o) => o.id === id), `Demo Opportunity ${id} is intact in DB`);
    }

    const lingeringTestOpps = opps.filter((o) => o.id.includes('LIVE') || o.title.includes('Live Sync Test'));
    assert(lingeringTestOpps.length === 0, 'ZERO temporary test opportunities remaining in DB');

    const projsRes = await fetch(`${targetUrl}/api/projects`, { cache: 'no-store' });
    const projsData = await projsRes.json();
    const projs = projsData.projects || [];

    const expectedProjs = ['PROJ-1', 'PROJ-2', 'PROJ-3', 'PROJ-4', 'PROJ-5'];
    for (const id of expectedProjs) {
      assert(projs.some((p) => p.id === id), `Demo Project ${id} is intact in DB`);
    }

    const lingeringTestProjs = projs.filter((p) => p.id.includes('LIVE') || p.projectName?.includes('Live Sync Project'));
    assert(lingeringTestProjs.length === 0, 'ZERO temporary test projects remaining in DB');
  } catch (err) {
    console.error('Demo data integrity error:', err);
    failed++;
  }

  // SUMMARY
  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveSyncTests().catch((err) => {
  console.error('Fatal live-sync runner error:', err);
  process.exit(1);
});
