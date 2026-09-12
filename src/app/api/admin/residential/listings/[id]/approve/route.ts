import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const updated = await prisma.residentialListing.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rejectionReason: null,
      },
    });

    try {
      revalidatePath('/residential');
      revalidatePath(`/residential/${updated.slug}`);
      revalidatePath('/');
    } catch (e) {
      console.warn('revalidatePath error:', e);
    }

    // Notify seller
    try {
      await prisma.notification.create({
        data: {
          type: 'verification_updated',
          title: 'Listing Approved & Published! 🎉',
          message: `Your listing "${updated.title}" has been approved and is now live on the TRINFRA residential marketplace.`,
          recipientId: updated.sellerId,
          reference: updated.id,
        },
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Listing approved and published successfully',
      listing: updated,
    });
  } catch (error) {
    console.error('Error in approve listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve listing' },
      { status: 500 }
    );
  }
}
