const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING PRODUCTION DATA CLEANUP ===\n');

  // 1. Target test residential listing IDs
  const testListingIds = [
    'cmtyeck5x0001sjzqzg2dsoou', // "zxcv"
    'cmtt44auv000112r0xc9pzoj9', // "asfda"
    'cmty3niaf00011481lmhc1glj', // "fsdakj"
    'cmtt4hwjw0001nc2g8i57dl7h', // "QA Admin Detail Review Verification Flat"
    'cmtt4ixmo0001on53mthpgix9', // "QA Admin Detail Review Verification Flat"
  ];

  console.log('1. Cleaning test residential enquiries...');
  const deletedEnquiries = await prisma.residentialEnquiry.deleteMany({
    where: {
      OR: [
        { listingId: { in: testListingIds } },
        { email: { contains: 'latebuyer@test.com' } },
        { name: { in: ['asdfkh', 'Late Buyer'] } },
      ],
    },
  });
  console.log(`   Deleted ${deletedEnquiries.count} test residential enquiries.`);

  console.log('2. Cleaning test residential images...');
  const deletedImages = await prisma.residentialImage.deleteMany({
    where: { listingId: { in: testListingIds } },
  });
  console.log(`   Deleted ${deletedImages.count} test residential images.`);

  console.log('3. Deleting test residential listings...');
  const deletedListings = await prisma.residentialListing.deleteMany({
    where: { id: { in: testListingIds } },
  });
  console.log(`   Deleted ${deletedListings.count} test residential listings.`);

  console.log('4. Cleaning test landowners...');
  const testLandowners = await prisma.landowner.findMany({
    where: {
      OR: [
        { referenceNumber: { startsWith: 'TRI-TEST-' } },
        { fullName: 'QA Landowner Test User' },
        { fullName: 'UYIUHYUI' },
      ],
    },
    select: { id: true, referenceNumber: true, fullName: true },
  });

  const testLandownerIds = testLandowners.map((l) => l.id);
  if (testLandownerIds.length > 0) {
    await prisma.adminNote.deleteMany({
      where: { landownerId: { in: testLandownerIds } },
    });
    const deletedLandowners = await prisma.landowner.deleteMany({
      where: { id: { in: testLandownerIds } },
    });
    console.log(`   Deleted ${deletedLandowners.count} test landowners:`, testLandowners.map((l) => `${l.referenceNumber} (${l.fullName})`));
  } else {
    console.log('   No test landowners found.');
  }

  console.log('\n5. Auditing remaining legitimate residential listings:');
  const remainingListings = await prisma.residentialListing.findMany({
    select: { id: true, title: true, slug: true, status: true, price: true, district: true },
  });
  console.log(`   Remaining legitimate listings count: ${remainingListings.length}`);
  for (const l of remainingListings) {
    console.log(`   - [${l.status}] ${l.title} (${l.district}) - ID: ${l.id}`);
  }

  console.log('\n=== DATA CLEANUP COMPLETED SUCCESSFULLY ===');
}

main()
  .catch((err) => {
    console.error('Data cleanup failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
