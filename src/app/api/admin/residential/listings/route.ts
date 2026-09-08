import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const district = searchParams.get('district') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (district && district !== 'ALL') {
      where.district = district;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { seller: { fullName: { contains: q, mode: 'insensitive' } } },
        { seller: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const listings = await prisma.residentialListing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: { enquiries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const counts = {
      total: listings.length,
      pending: listings.filter((l) => l.status === 'PENDING_REVIEW').length,
      published: listings.filter((l) => l.status === 'PUBLISHED').length,
      rejected: listings.filter((l) => l.status === 'REJECTED').length,
      draft: listings.filter((l) => l.status === 'DRAFT').length,
      unpublished: listings.filter((l) => l.status === 'UNPUBLISHED').length,
    };

    return NextResponse.json({
      success: true,
      counts,
      listings,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/residential/listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch residential listings' },
      { status: 500 }
    );
  }
}
