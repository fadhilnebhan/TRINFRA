import { NextResponse } from 'next/server';
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
