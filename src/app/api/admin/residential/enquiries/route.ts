import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enquiries = await prisma.residentialEnquiry.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            district: true,
            locality: true,
            price: true,
            priceType: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/residential/enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch residential enquiries' },
      { status: 500 }
    );
  }
}
