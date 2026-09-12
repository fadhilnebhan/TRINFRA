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
        status: 'UNPUBLISHED',
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
          title: 'Listing Unpublished',
          message: `Your listing "${updated.title}" has been unpublished by admin.`,
          recipientId: updated.sellerId,
          reference: updated.id,
        },
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Listing unpublished successfully',
      listing: updated,
    });
  } catch (error) {
    console.error('Error in unpublish listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unpublish listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.residentialListing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing deleted permanently',
    });
  } catch (error) {
    console.error('Error in DELETE admin listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
