import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (district && district !== 'all') {
      where.district = { equals: district, mode: 'insensitive' };
    }

    if (status && status !== 'all') {
      where.status = { equals: status, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { locality: { contains: search, mode: 'insensitive' } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        projects: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    });

    const formatted = opportunities.map((opp) => {
      let parsedHighlights: string[] = [];
      if (opp.highlights) {
        try {
          parsedHighlights = JSON.parse(opp.highlights);
        } catch {
          parsedHighlights = [opp.highlights];
        }
      }

      // Map status for frontend display compatibility
      let displayStatus = opp.status;
      if (opp.status === 'IN_PROGRESS') displayStatus = 'In Progress';
      else if (opp.status === 'OPEN') displayStatus = 'New Opportunity';
      else if (opp.status === 'FORMING') displayStatus = 'Emerging';

      return {
        id: opp.id,
        title: opp.title,
        slug: opp.slug,
        location: opp.location,
        district: opp.district,
        locality: opp.locality,
        area: opp.area,
        areaUnit: opp.areaUnit || 'Acres',
        landowners: opp.landownersCount,
        landownersCount: opp.landownersCount,
        status: displayStatus,
        rawStatus: opp.status,
        image: opp.image,
        shortDescription: opp.shortDescription,
        description: opp.shortDescription,
        overview: opp.overview,
        highlights: parsedHighlights,
        developmentPotential: opp.developmentPotential || '',
        currentStatusDetail: opp.currentStatusDetail || '',
        coordinates: {
          lat: opp.latitude ?? 10.85,
          lng: opp.longitude ?? 76.27,
        },
        projects: opp.projects,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      opportunities: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Opportunities GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { getAuthenticatedAdmin } = await import('@/lib/auth');
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      location,
      district,
      locality,
      area,
      areaUnit = 'Acres',
      landownersCount = 1,
      status = 'OPEN',
      shortDescription,
      overview,
      highlights,
      developmentPotential,
      currentStatusDetail,
      image,
      latitude,
      longitude,
    } = body;

    if (!title || !location || !district || !locality || area === undefined || !shortDescription || !overview) {
      return NextResponse.json(
        { error: 'Missing required opportunity fields' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = `opportunity-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.opportunity.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const nextId = `OPP-${Date.now().toString().slice(-4)}`;

    const newOpp = await prisma.opportunity.create({
      data: {
        id: nextId,
        title,
        slug,
        location,
        district,
        locality,
        area: parseFloat(String(area)) || 0,
        areaUnit,
        landownersCount: parseInt(String(landownersCount), 10) || 1,
        status: status.toUpperCase(),
        shortDescription,
        overview,
        highlights: Array.isArray(highlights) ? JSON.stringify(highlights) : highlights || '[]',
        developmentPotential: developmentPotential || null,
        currentStatusDetail: currentStatusDetail || null,
        image: image || '/images/opportunities/kozhikode.jpg',
        latitude: latitude ? parseFloat(String(latitude)) : null,
        longitude: longitude ? parseFloat(String(longitude)) : null,
      },
    });

    // Create notification for admin audit
    await prisma.notification.create({
      data: {
        type: 'system',
        title: 'New Opportunity Created',
        message: `Opportunity "${title}" (${newOpp.id}) was published to the platform.`,
        reference: newOpp.id,
        read: false,
      },
    });

    // Invalidate public pages
    revalidatePath('/');
    revalidatePath('/opportunities');

    return NextResponse.json({ success: true, opportunity: newOpp }, { status: 201 });
  } catch (error) {
    console.error('Create opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity in database' },
      { status: 500 }
    );
  }
}
