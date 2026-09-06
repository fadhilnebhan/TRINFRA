import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enquiries = await prisma.developerEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        opportunity: true,
        project: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('Admin enquiries list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developer enquiries from database' },
      { status: 500 }
    );
  }
}
