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
    const enquiry = await prisma.developerEnquiry.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
      include: {
        opportunity: true,
        project: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ enquiry });
  } catch (error) {
    console.error('Fetch enquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enquiry record' },
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
    const { status, priority, internalNotes } = body;

    const existing = await prisma.developerEnquiry.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const updated = await prisma.developerEnquiry.update({
      where: { id: existing.id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
      include: {
        opportunity: true,
        project: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If status changed, create admin notification
    if (status && status !== existing.status) {
      await prisma.notification.create({
        data: {
          type: 'enquiry_status_updated',
          title: 'Enquiry Status Updated',
          message: `${existing.company || existing.fullName} (${existing.referenceNumber}) updated to ${status}.`,
          reference: existing.referenceNumber,
          read: false,
        },
      });
    }

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error) {
    console.error('Update enquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}

