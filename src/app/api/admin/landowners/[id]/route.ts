import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const landowner = await prisma.landowner.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
      include: {
        parcels: true,
        documents: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!landowner) {
      return NextResponse.json({ error: 'Landowner not found' }, { status: 404 });
    }

    return NextResponse.json({ landowner });
  } catch (error) {
    console.error('Fetch landowner error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landowner record' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { verificationStatus, notes } = body;

    const existing = await prisma.landowner.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Landowner not found' }, { status: 404 });
    }

    const updated = await prisma.landowner.update({
      where: { id: existing.id },
      data: {
        ...(verificationStatus && { verificationStatus }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Create activity notification
    if (verificationStatus && verificationStatus !== existing.verificationStatus) {
      await prisma.notification.create({
        data: {
          type: 'verification_updated',
          title: 'Verification Status Updated',
          message: `${existing.fullName} (${existing.referenceNumber}) updated to ${verificationStatus}.`,
          reference: existing.referenceNumber,
          read: false,
        },
      });
    }

    return NextResponse.json({ success: true, landowner: updated });
  } catch (error) {
    console.error('Update landowner error:', error);
    return NextResponse.json(
      { error: 'Failed to update landowner record' },
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.landowner.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
      include: {
        parcels: true,
        documents: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Landowner not found' }, { status: 404 });
    }

    // Delete any associated notifications referencing this landowner
    await prisma.notification.deleteMany({
      where: { reference: existing.referenceNumber },
    });

    // Delete landowner (Prisma schema cascades parcels, documents, and adminNotes)
    await prisma.landowner.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: `Landowner ${existing.referenceNumber} deleted successfully.`,
    });
  } catch (error) {
    console.error('Delete landowner error:', error);
    return NextResponse.json(
      { error: 'Failed to delete landowner record' },
      { status: 500 }
    );
  }
}
