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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { getAuthenticatedAdmin } = await import('@/lib/auth');
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = params.id;
    const body = await request.json();

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.approximateArea !== undefined) updateData.approximateArea = body.approximateArea;
    if (body.areaNum !== undefined) updateData.areaNum = parseFloat(String(body.areaNum)) || 0;
    if (body.participatingLandowners !== undefined) {
      updateData.participatingLandowners = parseInt(String(body.participatingLandowners), 10) || 1;
    }
    if (body.status !== undefined) {
      updateData.status = String(body.status).toUpperCase().replace(/\s+/g, '_');
    }
    if (body.developmentStage !== undefined) {
      updateData.developmentStage = String(body.developmentStage).toUpperCase().replace(/\s+/g, '_');
    }
    if (body.progressPercentage !== undefined) {
      updateData.progressPercentage = parseInt(String(body.progressPercentage), 10) || 0;
    }
    if (body.image !== undefined) updateData.image = body.image;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.overview !== undefined) updateData.overview = body.overview;
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : (typeof body.tags === 'string' ? body.tags : '[]');
    }
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.opportunityId !== undefined) updateData.opportunityId = body.opportunityId || null;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { getAuthenticatedAdmin } = await import('@/lib/auth');
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = params.id;

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Safely unlink any DeveloperEnquiries referencing this project
    await prisma.developerEnquiry.updateMany({
      where: { projectId: id },
      data: { projectId: null },
    });

    // Delete admin notes referencing this project
    await prisma.adminNote.deleteMany({
      where: { projectId: id },
    });

    // Delete notifications referencing this project
    await prisma.notification.deleteMany({
      where: { reference: id },
    });

    // Delete the project
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Project ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project from database' },
      { status: 500 }
    );
  }
}
