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
      approximateArea,
      areaNum,
      participatingLandowners = 1,
      status = 'PLANNING',
      developmentStage = 'PLANNING',
      progressPercentage = 0,
      image,
      description,
      overview,
      tags,
      featured = false,
      opportunityId,
    } = body;

    if (!title || !location || !district || !description || !overview) {
      return NextResponse.json(
        { error: 'Missing required project fields (title, location, district, description, overview)' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = `project-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const nextId = `PROJ-${Date.now().toString().slice(-4)}`;

    const parsedAreaNum = areaNum !== undefined && areaNum !== null && areaNum !== ''
      ? parseFloat(String(areaNum))
      : parseFloat(String(approximateArea || '0').replace(/[^0-9.]/g, '')) || 0;

    const formattedApproxArea = approximateArea || `${parsedAreaNum} Acres`;

    const newProject = await prisma.project.create({
      data: {
        id: nextId,
        title,
        slug,
        location,
        district,
        approximateArea: formattedApproxArea,
        areaNum: parsedAreaNum,
        participatingLandowners: parseInt(String(participatingLandowners), 10) || 1,
        status: status.toUpperCase().replace(/\s+/g, '_'),
        developmentStage: developmentStage.toUpperCase().replace(/\s+/g, '_'),
        progressPercentage: parseInt(String(progressPercentage), 10) || 0,
        image: image || '/images/projects/kozhikode-hub.jpg',
        description,
        overview,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? tags : '[]'),
        featured: Boolean(featured),
        opportunityId: opportunityId || null,
      },
    });

    // Create notification for admin audit
    await prisma.notification.create({
      data: {
        type: 'system',
        title: 'New Project Created',
        message: `Project "${title}" (${newProject.id}) was added to the platform.`,
        reference: newProject.id,
        read: false,
      },
    });

    // Invalidate public caches immediately
    revalidatePath('/');
    revalidatePath('/projects');

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project in database' },
      { status: 500 }
    );
  }
}
