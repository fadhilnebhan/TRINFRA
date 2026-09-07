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
      return NextResponse.json({ error: 'Project ID or slug required' }, { status: 400 });
    }

    const proj = await prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        opportunity: true,
      },
    });

    if (!proj) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let parsedTags: string[] = [];
    if (proj.tags) {
      try {
        parsedTags = JSON.parse(proj.tags);
      } catch {
        parsedTags = [proj.tags];
      }
    }

    let displayStatus = proj.status;
    if (proj.status === 'PLANNING') displayStatus = 'Planning';
    else if (proj.status === 'IN_PROGRESS') displayStatus = 'In Progress';
    else if (proj.status === 'DEVELOPMENT') displayStatus = 'Development';
    else if (proj.status === 'COMPLETED') displayStatus = 'Completed';

    let displayStage = proj.developmentStage;
    if (proj.developmentStage === 'LAND_AGGREGATION') displayStage = 'Land Aggregation';
    else if (proj.developmentStage === 'PLANNING') displayStage = 'Planning';
    else if (proj.developmentStage === 'APPROVALS') displayStage = 'Approvals';
    else if (proj.developmentStage === 'DEVELOPMENT') displayStage = 'Development';
    else if (proj.developmentStage === 'COMPLETED') displayStage = 'Completed';

    const formatted = {
      id: proj.id,
      title: proj.title,
      projectName: proj.title,
      slug: proj.slug,
      location: proj.location,
      district: proj.district,
      approximateArea: proj.approximateArea,
      areaNum: proj.areaNum,
      participatingLandowners: proj.participatingLandowners,
      status: displayStatus,
      rawStatus: proj.status,
      developmentStage: displayStage,
      rawStage: proj.developmentStage,
      progress: proj.progressPercentage,
      progressPercentage: proj.progressPercentage,
      image: proj.image,
      description: proj.description,
      overview: proj.overview,
      tags: parsedTags,
      featured: proj.featured,
      opportunityId: proj.opportunityId,
      opportunity: proj.opportunity,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt ? proj.updatedAt.toISOString().split('T')[0] : '2026-08-15',
    };

    return NextResponse.json({
      success: true,
      project: formatted,
    });
  } catch (error) {
    console.error('Project detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project from database' },
      { status: 500 }
    );
  }
}
