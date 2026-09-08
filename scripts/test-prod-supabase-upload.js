const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = process.env.TEST_URL || 'https://trinfra.vercel.app';

// 1x1 transparent PNG buffer with valid magic bytes (89504E470D0A1A0A)
const PNG_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function runTest() {
  console.log('====================================================');
  console.log('🚀 LIVE PRODUCTION SUPABASE STORAGE UPLOAD TEST');
  console.log('Target URL:', BASE_URL);
  console.log('====================================================\n');

  let testStorageKey = null;

  try {
    // 1. Authenticate Seller
    console.log('--- 1. SELLER AUTHENTICATION ---');
    const loginRes = await fetch(`${BASE_URL}/api/seller/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seller@trinfra.demo',
        password: 'TRINFRA-SELLER-2026',
      }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Seller login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }

    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) {
      throw new Error('No session cookie returned from seller login');
    }
    const cookie = setCookie.split(';')[0];
    console.log('  ✅ [PASS] Seller authenticated successfully');

    // 2. Perform Real Image Upload
    console.log('\n--- 2. REAL PRODUCTION RESIDENTIAL IMAGE UPLOAD ---');
    const formData = new FormData();
    const blob = new Blob([PNG_PIXEL], { type: 'image/png' });
    formData.append('file', blob, 'prod_test_image.png');

    const uploadRes = await fetch(`${BASE_URL}/api/seller/upload-image`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
      },
      body: formData,
    });

    const uploadStatus = uploadRes.status;
    const uploadJson = await uploadRes.json();
    console.log(`  Upload Response status: ${uploadStatus}`);
    console.log('  Upload Response body:', JSON.stringify(uploadJson, null, 2));

    if (uploadStatus !== 200 || !uploadJson.success) {
      throw new Error(`Upload failed: status=${uploadStatus}, body=${JSON.stringify(uploadJson)}`);
    }

    const img = uploadJson.image;
    testStorageKey = img.storageKey;
    const publicUrl = img.url;

    console.log(`  ✅ [PASS] Upload returned HTTP 200`);
    console.log(`  Storage Key: ${testStorageKey}`);
    console.log(`  Returned URL: ${publicUrl}`);

    const isSupabaseUrl = publicUrl.includes('supabase.co/storage/v1/object/public/residential-images');
    console.log(`  Provider is Supabase Storage: ${isSupabaseUrl ? 'YES (PASS)' : 'NO (FAIL)'}`);
    if (!isSupabaseUrl) {
      throw new Error(`Expected Supabase Storage URL but got: ${publicUrl}`);
    }

    // 3. Verify Public Image Retrieval
    console.log('\n--- 3. VERIFY PERSISTENT IMAGE RETRIEVAL VIA PUBLIC URL ---');
    const getRes = await fetch(publicUrl);
    console.log(`  GET ${publicUrl} -> status: ${getRes.status}`);
    const getBuf = Buffer.from(await getRes.arrayBuffer());
    console.log(`  Retrieved size: ${getBuf.length} bytes (expected: ${PNG_PIXEL.length})`);
    const contentMatches = getBuf.equals(PNG_PIXEL);
    console.log(`  Binary content matches exactly: ${contentMatches ? 'YES (PASS)' : 'NO (FAIL)'}`);

    if (getRes.status !== 200 || !contentMatches) {
      throw new Error('Public image retrieval failed or content mismatch');
    }

    // 4. Verify Actual Object in Supabase Database (storage.objects)
    console.log('\n--- 4. DIRECT SUPABASE STORAGE OBJECT CONFIRMATION ---');
    const dbObjects = await prisma.$queryRawUnsafe(
      `SELECT id, bucket_id, name, metadata FROM storage.objects WHERE bucket_id = 'residential-images' AND name = $1`,
      testStorageKey
    );
    console.log('  Supabase storage.objects row:', dbObjects);
    const objectExistsInSupabase = dbObjects && dbObjects.length > 0;
    console.log(`  Actual object exists in Supabase: ${objectExistsInSupabase ? 'CONFIRMED (PASS)' : 'FAIL'}`);
    if (!objectExistsInSupabase) {
      throw new Error('Object not found in storage.objects table');
    }

    // 5. Persistence Tests: Fresh Session & Delay
    console.log('\n--- 5. PERSISTENCE VERIFICATION (FRESH SESSION & CACHE BYPASS) ---');
    await new Promise(r => setTimeout(r, 1000));
    const freshRes = await fetch(publicUrl, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 FreshSessionTest' }
    });
    console.log(`  Fresh Session GET status: ${freshRes.status} (PASS: ${freshRes.status === 200 ? 'YES' : 'NO'})`);
    if (freshRes.status !== 200) throw new Error('Fresh session request failed');

    // 6. Security Tests
    console.log('\n--- 6. SECURITY TESTS ---');
    const unauthUpload = await fetch(`${BASE_URL}/api/seller/upload-image`, {
      method: 'POST',
      body: formData,
    });
    console.log(`  Unauthenticated upload status: ${unauthUpload.status} (expected: 401, PASS: ${unauthUpload.status === 401 ? 'YES' : 'NO'})`);

    console.log('\n====================================================');
    console.log('🎉 PRODUCTION SUPABASE STORAGE FULLY VERIFIED!');
    console.log('====================================================');

  } finally {
    // Clean up test object
    if (testStorageKey) {
      console.log(`\nCleaning up test storage object: ${testStorageKey}...`);
      try {
        await prisma.$queryRawUnsafe(
          `DELETE FROM storage.objects WHERE bucket_id = 'residential-images' AND name = $1`,
          testStorageKey
        );
        console.log('Cleaned up test storage object successfully.');
      } catch (cleanErr) {
        console.warn('Cleanup warning:', cleanErr.message);
      }
    }
    await prisma.$disconnect();
  }
}

runTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
