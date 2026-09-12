const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrisma() {
  try {
    const refNumber = `TRI-2026-${Date.now().toString().slice(-5)}`;
    console.log('Testing Landowner creation with ref:', refNumber);

    const result = await prisma.$transaction(async (tx) => {
      const landowner = await tx.landowner.create({
        data: {
          referenceNumber: refNumber,
          ownerType: 'Individual',
          fullName: 'Gopalan Nambiar',
          email: 'gopalan.nambiar@example.com',
          phone: '9847198471',
          preferredCommunication: 'Phone',
          district: 'Thiruvananthapuram',
          localBody: 'Thiruvananthapuram Corporation',
          locality: 'Pattom',
          approximateArea: 2.5,
          areaUnit: 'Acres',
          ownershipStatus: 'Sole Ownership',
          poolingInterest: 'Join Existing Pool',
          verificationStatus: 'NEW',
          notes: null,
        },
      });

      console.log('Landowner created:', landowner.id);

      const parcel = await tx.landParcel.create({
        data: {
          landownerId: landowner.id,
          district: 'Thiruvananthapuram',
          localBody: 'Thiruvananthapuram Corporation',
          locality: 'Pattom',
          approximateArea: 2.5,
          areaUnit: 'Acres',
          latitude: null,
          longitude: null,
          ownershipStatus: 'Sole Ownership',
        },
      });

      console.log('Parcel created:', parcel.id);

      const notif = await tx.notification.create({
        data: {
          type: 'registration_received',
          title: 'New Landowner Registration',
          message: `${landowner.fullName} registered 2.5 Acres in Thiruvananthapuram.`,
          reference: refNumber,
          read: false,
        },
      });

      console.log('Notification created:', notif.id);

      return landowner;
    });

    console.log('SUCCESS! Created landowner:', result.id);
  } catch (err) {
    console.error('TRANSACTION ERROR CAUSE:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
