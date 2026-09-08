import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedSeller } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enquiry = await prisma.residentialEnquiry.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          select: { sellerId: true },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    if (enquiry.listing.sellerId !== seller.userId && seller.role !== 'ADMIN' && seller.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot modify another seller\'s enquiry' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.residentialEnquiry.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: 'Enquiry status updated successfully',
      enquiry: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/seller/enquiries/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enquiry status' },
      { status: 500 }
    );
  }
}
