import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
    console.error('Error in PATCH admin enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}
