import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedSeller } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== seller.userId && seller.role !== 'ADMIN' && seller.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot submit another seller\'s listing' },
        { status: 403 }
      );
    }

    if (listing.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please upload at least one image before submitting for review' },
        { status: 400 }
      );
    }

    const updated = await prisma.residentialListing.update({
      where: { id: params.id },
      data: {
        status: 'PENDING_REVIEW',
        rejectionReason: null,
      },
    });

    // Notify Admin
    try {
      await prisma.notification.create({
        data: {
          type: 'system',
          title: 'Listing Submitted for Review',
          message: `Listing "${updated.title}" was submitted for review by seller.`,
          reference: updated.id,
        },
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Listing submitted for review successfully',
      listing: updated,
    });
  } catch (error) {
    console.error('Error in POST /api/seller/listings/[id]/submit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit listing for review' },
      { status: 500 }
    );
  }
}
