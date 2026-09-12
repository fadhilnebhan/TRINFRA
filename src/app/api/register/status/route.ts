import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref')?.trim();
  const phone = searchParams.get('phone')?.trim();

  if (!ref) {
    return NextResponse.json(
      { success: false, error: 'Registration reference number is required' },
      { status: 400 }
    );
  }

  try {
    const landowner = await prisma.landowner.findFirst({
      where: {
        referenceNumber: { equals: ref, mode: 'insensitive' },
      },
      include: {
        parcels: {
          select: {
            district: true,
            localBody: true,
            locality: true,
            approximateArea: true,
            areaUnit: true,
          },
        },
        adminNotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!landowner) {
      return NextResponse.json(
        { success: false, error: 'No land registration found with this reference number.' },
        { status: 404 }
      );
    }

    // Optional phone check for privacy if phone provided
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanDbPhone = landowner.phone.replace(/[^0-9]/g, '');
      if (cleanPhone && cleanDbPhone && !cleanDbPhone.includes(cleanPhone) && !cleanPhone.includes(cleanDbPhone)) {
        return NextResponse.json(
          { success: false, error: 'Phone number does not match this registration reference.' },
          { status: 403 }
        );
      }
    }

    // Extract clarification message if in NEEDS_CLARIFICATION status
    let clarificationMessage: string | null = null;
    if (landowner.verificationStatus === 'NEEDS_CLARIFICATION') {
      const clarNote = landowner.adminNotes?.find((n) =>
        n.content?.toLowerCase().includes('clarification')
      );
      if (clarNote) {
        clarificationMessage = clarNote.content.replace(/^Clarification Required:\s*/i, '').trim();
      } else if (landowner.notes) {
        clarificationMessage = landowner.notes;
      }
    }

    // Privacy mask for name if accessed via public ref without phone verification
    const nameParts = landowner.fullName.trim().split(' ');
    const maskedName =
      nameParts.length > 1
        ? `${nameParts[0]} ${nameParts.slice(1).map((p) => p[0] + '***').join(' ')}`
        : landowner.fullName;

    return NextResponse.json({
      success: true,
      registration: {
        referenceNumber: landowner.referenceNumber,
        fullName: phone ? landowner.fullName : maskedName,
        district: landowner.district,
        localBody: landowner.localBody,
        locality: landowner.locality,
        approximateArea: landowner.approximateArea,
        areaUnit: landowner.areaUnit,
        ownershipStatus: landowner.ownershipStatus,
        poolingInterest: landowner.poolingInterest,
        preferredCommunication: landowner.preferredCommunication,
        verificationStatus: landowner.verificationStatus,
        clarificationMessage,
        createdAt: landowner.createdAt.toISOString(),
        updatedAt: landowner.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching landowner registration status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve registration status' },
      { status: 500 }
    );
  }
}
