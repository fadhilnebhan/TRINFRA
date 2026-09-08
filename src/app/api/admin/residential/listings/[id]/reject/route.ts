import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rejectionReason } = body;

    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a clear rejection reason (minimum 5 characters)' },
        { status: 400 }
      );
    }

    const listing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const updated = await prisma.residentialListing.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      },
    });

    // Notify seller
    try {
      await prisma.notification.create({
        data: {
          type: 'verification_updated',
          title: 'Listing Update Required',
          message: `Your listing "${updated.title}" was not approved: ${rejectionReason.trim()}. You can edit and resubmit it anytime.`,
          recipientId: updated.sellerId,
          reference: updated.id,
        },
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Listing rejected with feedback',
      listing: updated,
    });
  } catch (error) {
    console.error('Error in reject listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject listing' },
      { status: 500 }
    );
  }
}
