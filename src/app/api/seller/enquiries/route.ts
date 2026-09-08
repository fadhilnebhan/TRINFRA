import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedSeller } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enquiries = await prisma.residentialEnquiry.findMany({
      where: {
        listing: {
          sellerId: seller.userId,
        },
      },
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
    console.error('Error in GET /api/seller/enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller enquiries' },
      { status: 500 }
    );
  }
}
