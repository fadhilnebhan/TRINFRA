// Dedicated Public Sync E2E Test Suite for TRINFRA
// Tests the full lifecycle: CREATE -> API/PUBLIC/DETAIL -> UPDATE -> API/PUBLIC/DETAIL -> DELETE -> API/PUBLIC/404
const targetUrl = process.argv[2] || process.env.TEST_BASE_URL || 'https://trinfra.vercel.app';

async function runPublicSyncTests() {
  console.log('🚀 STARTING TRINFRA PUBLIC OPPORTUNITY SYNC E2E TEST on:', targetUrl);
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

  let testOppId = '';
  let testOppSlug = '';

  // 2. CREATE TEST
  console.log('\n--- 2. CREATE WORKFLOW & IMMEDIATE PUBLIC VISIBILITY ---');
  try {
    const createRes = await fetch(`${targetUrl}/api/opportunities`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Public Sync Opportunity',
        district: 'Kozhikode',
        locality: 'Vadakara',
        location: 'National Highway Corridor, Vadakara',
        area: 99.5,
        areaUnit: 'Acres',
        landownersCount: 15,
        status: 'OPEN',
        shortDescription: 'Synthetic QA opportunity for testing public data synchronization across all pages.',
        overview: 'Comprehensive verification record designed to confirm instant synchronization between CMS and public surfaces.',
        highlights: ['Verified Title Deeds', 'High-Speed Transit Access', 'Single Source of Truth'],
        image: '/images/houses_tropical.jpeg',
      }),
    });

    assert(createRes.status === 201, 'POST /api/opportunities created synthetic opportunity (HTTP 201)');
    const createData = await createRes.json();
    testOppId = createData.opportunity?.id;
    testOppSlug = createData.opportunity?.slug;
    assert(!!testOppId, `Opportunity created with ID: ${testOppId} and slug: ${testOppSlug}`);

    // Verify GET /api/opportunities
    const apiRes = await fetch(`${targetUrl}/api/opportunities?ts=${Date.now()}`, { cache: 'no-store' });
    const apiData = await apiRes.json();
    const inApi = (apiData.opportunities || []).find((o) => o.id === testOppId);
    assert(!!inApi, 'Created opportunity appears in GET /api/opportunities');

    // Verify public /opportunities HTML
    const oppPageRes = await fetch(`${targetUrl}/opportunities?ts=${Date.now()}`, { cache: 'no-store' });
    const oppPageHtml = await oppPageRes.text();
    assert(oppPageHtml.includes('QA Public Sync Opportunity') || oppPageHtml.includes(testOppId), 'Created opportunity rendered in public /opportunities HTML');

    // Verify public detail page /opportunities/[id]
    const detailRes = await fetch(`${targetUrl}/opportunities/${testOppId}?ts=${Date.now()}`, { cache: 'no-store' });
    assert(detailRes.status === 200, `Public detail page /opportunities/${testOppId} returns HTTP 200`);
    const detailHtml = await detailRes.text();
    assert(detailHtml.includes('QA Public Sync Opportunity'), 'Detail page HTML contains created opportunity title');
  } catch (err) {
    console.error('Create verification error:', err);
    failed++;
  }

  // 3. UPDATE TEST
  console.log('\n--- 3. UPDATE WORKFLOW & IMMEDIATE PUBLIC SYNC ---');
  try {
    const updateRes = await fetch(`${targetUrl}/api/opportunities/${testOppId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Sync Opportunity Updated',
        area: 105.0,
      }),
    });
    assert(updateRes.status === 200, 'PATCH /api/opportunities/[id] updated record (HTTP 200)');

    // Verify GET /api/opportunities/[id]
    const apiUpdatedRes = await fetch(`${targetUrl}/api/opportunities/${testOppId}?ts=${Date.now()}`, { cache: 'no-store' });
    const apiUpdatedData = await apiUpdatedRes.json();
    assert(apiUpdatedData.opportunity?.title === 'QA Sync Opportunity Updated', 'API returns updated opportunity title');
    assert(apiUpdatedData.opportunity?.area === 105.0, 'API returns updated acreage (105.0)');

    // Verify detail page
    const updatedDetailRes = await fetch(`${targetUrl}/opportunities/${testOppId}?ts=${Date.now()}`, { cache: 'no-store' });
    const updatedDetailHtml = await updatedDetailRes.text();
    assert(updatedDetailHtml.includes('QA Sync Opportunity Updated'), 'Detail page HTML renders updated title immediately');
  } catch (err) {
    console.error('Update verification error:', err);
    failed++;
  }

  // 4. DELETE TEST & 404 VERIFICATION
  console.log('\n--- 4. DELETE WORKFLOW & DISAPPEARANCE FROM ALL PUBLIC SURFACES ---');
  try {
    const deleteRes = await fetch(`${targetUrl}/api/opportunities/${testOppId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteRes.status === 200, 'DELETE /api/opportunities/[id] deleted record from PostgreSQL (HTTP 200)');

    // 1. GET /api/opportunities must no longer contain it
    const afterDeleteApiRes = await fetch(`${targetUrl}/api/opportunities?ts=${Date.now()}`, { cache: 'no-store' });
    const afterDeleteApiData = await afterDeleteApiRes.json();
    const stillInApi = (afterDeleteApiData.opportunities || []).some((o) => o.id === testOppId);
    assert(!stillInApi, 'Deleted opportunity is completely absent from GET /api/opportunities');

    // 2. Public detail page /opportunities/[id] MUST RETURN 404
    const afterDeleteDetailRes = await fetch(`${targetUrl}/opportunities/${testOppId}?ts=${Date.now()}`, { cache: 'no-store' });
    assert(afterDeleteDetailRes.status === 404, `Public detail page /opportunities/${testOppId} returns HTTP 404 Not Found`);

    // 3. Public /opportunities HTML must not contain it
    const afterDeleteHtmlRes = await fetch(`${targetUrl}/opportunities?ts=${Date.now()}`, { cache: 'no-store' });
    const afterDeleteHtml = await afterDeleteHtmlRes.text();
    assert(!afterDeleteHtml.includes('QA Sync Opportunity Updated'), 'Deleted opportunity title does not appear in /opportunities HTML');

    // 4. Homepage must not contain it
    const homeHtmlRes = await fetch(`${targetUrl}/?ts=${Date.now()}`, { cache: 'no-store' });
    const homeHtml = await homeHtmlRes.text();
    assert(!homeHtml.includes('QA Sync Opportunity Updated'), 'Deleted opportunity title does not appear on Homepage HTML');

    // 5. Hard refresh / multiple requests test
    const refreshDetailRes = await fetch(`${targetUrl}/opportunities/${testOppId}?cacheBust=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    assert(refreshDetailRes.status === 404, 'Hard-refreshed detail URL consistently returns HTTP 404 Not Found');
  } catch (err) {
    console.error('Delete verification error:', err);
    failed++;
  }

  // 5. API VS PUBLIC CONSISTENCY TEST
  console.log('\n--- 5. API VS PUBLIC DATASET CONSISTENCY TEST ---');
  try {
    const listApiRes = await fetch(`${targetUrl}/api/opportunities?ts=${Date.now()}`, { cache: 'no-store' });
    const listApiData = await listApiRes.json();
    const dbOpportunities = listApiData.opportunities || [];
    console.log(`  📊 Database/API currently has ${dbOpportunities.length} opportunities:`, dbOpportunities.map(o => o.id));

    // Verify intentional demo opportunities are present
    const requiredDemo = ['OPP-1', 'OPP-2', 'OPP-3', 'OPP-4'];
    const hasAllDemo = requiredDemo.every(id => dbOpportunities.some(o => o.id === id));
    assert(hasAllDemo, 'All 4 intentional demo opportunities (OPP-1, OPP-2, OPP-3, OPP-4) are preserved');

    // Verify there are no duplicate IDs
    const ids = dbOpportunities.map(o => o.id);
    const uniqueIds = new Set(ids);
    assert(ids.length === uniqueIds.size, 'Zero duplicate Opportunity IDs exist');
  } catch (err) {
    console.error('Consistency verification error:', err);
    failed++;
  }

  console.log('\n=============================================');
  console.log(`PUBLIC SYNC E2E SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPublicSyncTests().catch((e) => {
  console.error('Public sync suite fatal error:', e);
  process.exit(1);
});
