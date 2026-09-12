import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedSeller } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_AVAILABILITY_STATUSES = ['PUBLISHED', 'SOLD', 'RENTED', 'UNPUBLISHED'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        sellerId: true,
        status: true,
        title: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    // STRICT AUTHORIZATION: Seller can only modify their own listings
    if (existing.sellerId !== seller.userId && seller.role !== 'ADMIN' && seller.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot modify another seller\'s listing' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_AVAILABILITY_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid availability status. Must be one of: ${VALID_AVAILABILITY_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Protection: listings in DRAFT or REJECTED cannot skip moderation directly to PUBLISHED
    if (status === 'PUBLISHED' && (existing.status === 'DRAFT' || existing.status === 'REJECTED')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Draft or rejected listings must be submitted and approved by admin before marking as available.',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.residentialListing.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'PUBLISHED' && !existing.status ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Property availability updated to ${status}`,
      listing: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/seller/listings/[id]/availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update property availability' },
      { status: 500 }
    );
  }
}
