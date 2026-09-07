// QA Image Upload & Themed Select E2E Test Suite for TRINFRA on live Supabase PostgreSQL
const BASE_URL = 'https://trinfra.vercel.app';

async function runImageUploadE2E() {
  console.log('🚀 STARTING IMAGE UPLOAD & CMS E2E QA TEST on:', BASE_URL);
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

  // 1. SECURITY: Unauthenticated Upload Rejection
  console.log('\n--- 1. SECURITY & AUTHENTICATION FOR IMAGE UPLOAD ---');
  try {
    const unauthForm = new FormData();
    const fakeBlob = new Blob(['fake image content'], { type: 'image/jpeg' });
    unauthForm.append('file', fakeBlob, 'test.jpg');

    const resUnauth = await fetch(`${BASE_URL}/api/admin/upload-image`, {
      method: 'POST',
      body: unauthForm,
    });
    assert(resUnauth.status === 401, 'Unauthenticated POST /api/admin/upload-image is rejected with 401 Unauthorized');
  } catch (err) {
    console.error('Security test error:', err);
    failed++;
  }

  // 2. ADMIN LOGIN
  console.log('\n--- 2. ADMIN LOGIN ---');
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
    assert(loginRes.status === 200, 'Admin login succeeds with 200 OK');
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
      authCookie = setCookie.split(';')[0];
      assert(authCookie.includes('admin_session='), 'Admin session cookie retrieved');
    } else {
      assert(false, 'Cookie header present');
    }
  } catch (err) {
    console.error('Login error:', err);
    failed++;
  }

  // 3. VALIDATION: Invalid Format Rejection
  console.log('\n--- 3. SERVER-SIDE IMAGE VALIDATION ---');
  try {
    const invalidForm = new FormData();
    const txtBlob = new Blob(['this is a text file'], { type: 'text/plain' });
    invalidForm.append('file', txtBlob, 'notes.txt');

    const resInvalid = await fetch(`${BASE_URL}/api/admin/upload-image`, {
      method: 'POST',
      headers: { Cookie: authCookie },
      body: invalidForm,
    });
    const invalidData = await resInvalid.json();
    assert(resInvalid.status === 400, 'Invalid file type (text/plain) rejected with 400 Bad Request');
    assert(invalidData.error && invalidData.error.includes('JPG'), 'Validation error message mentions JPG/PNG/WEBP requirement');
  } catch (err) {
    console.error('Validation test error:', err);
    failed++;
  }

  // 4. VALIDATION: Oversized File (> 5 MB) Rejection
  try {
    const oversizedForm = new FormData();
    // 5.5 MB dummy buffer
    const bigBuffer = new Uint8Array(5.5 * 1024 * 1024);
    const bigBlob = new Blob([bigBuffer], { type: 'image/jpeg' });
    oversizedForm.append('file', bigBlob, 'huge.jpg');

    const resOversized = await fetch(`${BASE_URL}/api/admin/upload-image`, {
      method: 'POST',
      headers: { Cookie: authCookie },
      body: oversizedForm,
    });
    if (resOversized.status === 413) {
      assert(true, 'Oversized file (>5MB) rejected by server platform with HTTP 413 Payload Too Large');
    } else {
      assert(resOversized.status === 400, 'Oversized file (>5MB) rejected by application with 400 Bad Request');
      const overData = await resOversized.json();
      assert(overData.error && overData.error.includes('5 MB'), 'Validation error message mentions 5 MB limit');
    }
  } catch (err) {
    console.error('Oversized test error:', err);
    failed++;
  }

  // 5. VALID IMAGE UPLOAD & DYNAMIC SERVING
  console.log('\n--- 4. VALID AUTHENTICATED IMAGE UPLOAD & SERVING ---');
  let uploadedImageUrl = '';
  try {
    // 1x1 valid pixel JPEG
    const jpegBytes = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
      0x00, 0xBF, 0x80, 0xFF, 0xD9
    ]);
    const validBlob = new Blob([jpegBytes], { type: 'image/jpeg' });
    const uploadForm = new FormData();
    uploadForm.append('file', validBlob, 'kozhikode-hub-aerial.jpg');

    const resUpload = await fetch(`${BASE_URL}/api/admin/upload-image`, {
      method: 'POST',
      headers: { Cookie: authCookie },
      body: uploadForm,
    });
    const uploadData = await resUpload.json();
    assert(resUpload.status === 200, 'Authenticated image upload succeeds with 200 OK');
    assert(uploadData.success === true, 'Response indicates success = true');
    assert(uploadData.url && uploadData.url.startsWith('/api/images/'), `Image URL generated with proper prefix: ${uploadData.url}`);
    uploadedImageUrl = uploadData.url;

    // Verify dynamic serving
    const resServe = await fetch(`${BASE_URL}${uploadedImageUrl}`);
    assert(resServe.status === 200, 'GET /api/images/[filename] serves uploaded image with HTTP 200');
    assert(resServe.headers.get('content-type') === 'image/jpeg', 'Image served with Content-Type: image/jpeg');
  } catch (err) {
    console.error('Upload test error:', err);
    failed++;
  }

  // 6. CREATE OPPORTUNITY WITH UPLOADED IMAGE
  console.log('\n--- 5. CREATE OPPORTUNITY WITH UPLOADED IMAGE ---');
  let createdOppId = '';
  try {
    const oppPayload = {
      title: 'QA Image Test Industrial Parcel',
      district: 'Kozhikode',
      locality: 'Koyilandy Bypass',
      location: 'Koyilandy Bypass, Kozhikode',
      area: 60,
      areaUnit: 'Acres',
      landownersCount: 14,
      status: 'OPEN',
      shortDescription: 'Prime parcel created via automated Image Picker QA test.',
      overview: 'Full overview test for image upload verification in Supabase PostgreSQL.',
      highlights: ['Direct highway connectivity', 'Clear titles verified'],
      developmentPotential: 'Logistics & warehousing cluster',
      image: uploadedImageUrl,
    };

    const resOpp = await fetch(`${BASE_URL}/api/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(oppPayload),
    });
    const oppData = await resOpp.json();
    assert(resOpp.status === 201, 'Opportunity created with HTTP 201');
    assert(oppData.opportunity && oppData.opportunity.id, `Created Opportunity ID: ${oppData.opportunity?.id}`);
    assert(oppData.opportunity?.image === uploadedImageUrl, `Stored image path in PostgreSQL is URL (${uploadedImageUrl}), NOT base64`);
    createdOppId = oppData.opportunity?.id;

    // Check public GET
    const resPub = await fetch(`${BASE_URL}/api/opportunities`);
    const pubData = await resPub.json();
    const found = pubData.opportunities.find((o) => o.id === createdOppId);
    assert(!!found, 'Created opportunity appears in public listings');
    assert(found?.image === uploadedImageUrl, 'Public listing renders with the uploaded image URL');

    // 7. EDIT OPPORTUNITY: Change Image
    console.log('\n--- 6. EDIT OPPORTUNITY: CHANGE / REPLACE IMAGE ---');
    const updatedPayload = {
      ...oppPayload,
      title: 'QA Image Test Industrial Parcel (Updated Image)',
      image: '/images/opportunities/ernakulam.jpg', // change image
    };
    const resPatch = await fetch(`${BASE_URL}/api/opportunities/${createdOppId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(updatedPayload),
    });
    const patchData = await resPatch.json();
    assert(resPatch.status === 200, 'PATCH /api/opportunities/[id] updates opportunity image');
    assert(patchData.opportunity?.image === '/images/opportunities/ernakulam.jpg', 'Updated image path confirmed in PostgreSQL');

    // Clean up
    const resDel = await fetch(`${BASE_URL}/api/opportunities/${createdOppId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    assert(resDel.status === 200, 'Test opportunity deleted successfully');
  } catch (err) {
    console.error('Opportunity image workflow error:', err);
    failed++;
  }

  // 8. CREATE PROJECT WITH UPLOADED IMAGE
  console.log('\n--- 7. CREATE PROJECT WITH UPLOADED IMAGE ---');
  let createdProjId = '';
  try {
    const projPayload = {
      title: 'QA Image Test Agro Hub',
      district: 'Palakkad',
      location: 'Kanjikode Industrial Area, Palakkad',
      approximateArea: '55 Acres',
      areaNum: 55,
      participatingLandowners: 20,
      status: 'PLANNING',
      developmentStage: 'PLANNING',
      progressPercentage: 15,
      description: 'Project created to verify image upload integration.',
      overview: 'Complete agro-logistics hub project overview.',
      tags: ['Land Pooling', 'Industrial', 'Agro'],
      image: uploadedImageUrl,
      featured: false,
    };

    const resProj = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(projPayload),
    });
    const projData = await resProj.json();
    assert(resProj.status === 201, 'Project created with HTTP 201');
    assert(projData.project && projData.project.id, `Created Project ID: ${projData.project?.id}`);
    assert(projData.project?.image === uploadedImageUrl, `Stored project image in PostgreSQL is URL (${uploadedImageUrl})`);
    createdProjId = projData.project?.id;

    // Check public GET
    const resProjPub = await fetch(`${BASE_URL}/api/projects`);
    const projPubData = await resProjPub.json();
    const foundProj = projPubData.projects.find((p) => p.id === createdProjId);
    assert(!!foundProj, 'Created project appears in public listings');
    assert(foundProj?.image === uploadedImageUrl, 'Public listing renders with the uploaded project image URL');

    // Clean up
    const resProjDel = await fetch(`${BASE_URL}/api/projects/${createdProjId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });
    assert(resProjDel.status === 200, 'Test project deleted successfully');
  } catch (err) {
    console.error('Project image workflow error:', err);
    failed++;
  }

  // 9. PRESERVATION CHECK
  console.log('\n--- 8. DEMO DATA INTEGRITY CHECK ---');
  try {
    const oppsRes = await fetch(`${BASE_URL}/api/opportunities`);
    const oppsData = await oppsRes.json();
    const oppIds = oppsData.opportunities.map((o) => o.id);
    assert(['OPP-1', 'OPP-2', 'OPP-3', 'OPP-4'].every((id) => oppIds.includes(id)), 'OPP-1 through OPP-4 fully preserved');

    const projsRes = await fetch(`${BASE_URL}/api/projects`);
    const projsData = await projsRes.json();
    const projIds = projsData.projects.map((p) => p.id);
    assert(['PROJ-1', 'PROJ-2', 'PROJ-3', 'PROJ-4', 'PROJ-5'].every((id) => projIds.includes(id)), 'PROJ-1 through PROJ-5 fully preserved');
  } catch (err) {
    console.error('Preservation test error:', err);
    failed++;
  }

  console.log('\n=============================================');
  console.log(`IMAGE UPLOAD QA SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) process.exit(1);
}

runImageUploadE2E();
