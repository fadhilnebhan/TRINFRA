import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase().trim() || '';
  const status = searchParams.get('status') || 'ALL';
  const district = searchParams.get('district') || 'ALL';

  try {
    const where: Prisma.LandownerWhereInput = {};

    if (status !== 'ALL') {
      where.verificationStatus = status;
    }

    if (district !== 'ALL') {
      where.district = district;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { referenceNumber: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { locality: { contains: search } },
      ];
    }

    const landowners = await prisma.landowner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        parcels: true,
        documents: true,
        adminNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ landowners });
  } catch (error) {
    console.error('Admin landowners list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landowners from database' },
      { status: 500 }
    );
  }
}
