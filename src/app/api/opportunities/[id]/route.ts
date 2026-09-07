import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    if (!idOrSlug) {
      return NextResponse.json({ error: 'Opportunity ID or slug required' }, { status: 400 });
    }

    const opp = await prisma.opportunity.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        projects: true,
        parcels: true,
      },
    });

    if (!opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    let parsedHighlights: string[] = [];
    if (opp.highlights) {
      try {
        parsedHighlights = JSON.parse(opp.highlights);
      } catch {
        parsedHighlights = [opp.highlights];
      }
    }

    let displayStatus = opp.status;
    if (opp.status === 'IN_PROGRESS') displayStatus = 'In Progress';
    else if (opp.status === 'OPEN') displayStatus = 'New Opportunity';
    else if (opp.status === 'FORMING') displayStatus = 'Emerging';

    const formatted = {
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
      parcels: opp.parcels,
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
    };

    return NextResponse.json({
      success: true,
      opportunity: formatted,
    });
  } catch (error) {
    console.error('Opportunity detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity from database' },
      { status: 500 }
    );
  }
}
