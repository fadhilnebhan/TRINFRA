import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, authorRole = 'Institutional Relations' } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Note content cannot be empty' }, { status: 400 });
    }

    const enquiry = await prisma.developerEnquiry.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const note = await prisma.adminNote.create({
      data: {
        adminId: admin.userId,
        authorName: admin.fullName || 'Admin Reviewer',
        authorRole: authorRole,
        enquiryId: enquiry.id,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error('Add enquiry note error:', error);
    return NextResponse.json(
      { error: 'Failed to add admin note to enquiry' },
      { status: 500 }
    );
  }
}
