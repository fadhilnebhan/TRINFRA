import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (district && district !== 'all') {
      where.district = { equals: district, mode: 'insensitive' };
    }

    if (status && status !== 'all') {
      where.status = { equals: status, mode: 'insensitive' };
    }

    if (stage && stage !== 'all') {
      where.developmentStage = { equals: stage, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        opportunity: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    });

    const formatted = projects.map((proj) => {
      let parsedTags: string[] = [];
      if (proj.tags) {
        try {
          parsedTags = JSON.parse(proj.tags);
        } catch {
          parsedTags = [proj.tags];
        }
      }

      // Map status for frontend display
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

      return {
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
    });

    return NextResponse.json({
      success: true,
      projects: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Projects GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from database' },
      { status: 500 }
    );
  }
}
