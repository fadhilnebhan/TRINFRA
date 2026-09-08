import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
      },
    });

    if (!opp) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
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
      isPinned: Boolean(opp.isPinned),
      pinnedAt: opp.pinnedAt ? opp.pinnedAt.toISOString() : null,
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        opportunity: formatted,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Opportunity detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity from database' },
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
    const existing = await prisma.opportunity.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      location,
      district,
      locality,
      area,
      areaUnit,
      landownersCount,
      status,
      shortDescription,
      overview,
      highlights,
      developmentPotential,
      currentStatusDetail,
      image,
      latitude,
      longitude,
      isPinned,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (location !== undefined) updateData.location = location;
    if (district !== undefined) updateData.district = district;
    if (locality !== undefined) updateData.locality = locality;
    if (area !== undefined) updateData.area = parseFloat(String(area)) || 0;
    if (areaUnit !== undefined) updateData.areaUnit = areaUnit;
    if (landownersCount !== undefined) updateData.landownersCount = parseInt(String(landownersCount), 10) || 1;
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (overview !== undefined) updateData.overview = overview;
    if (highlights !== undefined) {
      updateData.highlights = Array.isArray(highlights) ? JSON.stringify(highlights) : highlights;
    }
    if (developmentPotential !== undefined) updateData.developmentPotential = developmentPotential;
    if (currentStatusDetail !== undefined) updateData.currentStatusDetail = currentStatusDetail;
    if (image !== undefined) updateData.image = image;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(String(latitude)) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(String(longitude)) : null;
    if (isPinned !== undefined) {
      const pinnedBool = Boolean(isPinned);
      updateData.isPinned = pinnedBool;
      updateData.pinnedAt = pinnedBool ? new Date() : null;
    }

    const updated = await prisma.opportunity.update({
      where: { id: existing.id },
      data: updateData,
    });

    // Invalidate public caches immediately
    revalidatePath('/');
    revalidatePath('/opportunities');
    revalidatePath(`/opportunities/${existing.id}`);
    revalidatePath(`/opportunities/${existing.slug}`);
    if (updated.slug && updated.slug !== existing.slug) {
      revalidatePath(`/opportunities/${updated.slug}`);
    }

    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error) {
    console.error('Update opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity in database' },
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
    const existing = await prisma.opportunity.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Unlink any related land parcels or projects (set foreign key to null)
    await prisma.landParcel.updateMany({
      where: { opportunityId: existing.id },
      data: { opportunityId: null },
    });

    await prisma.project.updateMany({
      where: { opportunityId: existing.id },
      data: { opportunityId: null },
    });

    await prisma.developerEnquiry.updateMany({
      where: { opportunityId: existing.id },
      data: { opportunityId: null },
    });

    // Delete opportunity (cascades adminNotes)
    await prisma.opportunity.delete({
      where: { id: existing.id },
    });

    // Invalidate public caches immediately
    revalidatePath('/');
    revalidatePath('/opportunities');
    revalidatePath(`/opportunities/${existing.id}`);
    revalidatePath(`/opportunities/${existing.slug}`);

    return NextResponse.json({
      success: true,
      message: `Opportunity "${existing.title}" (${existing.id}) deleted successfully.`,
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity from database' },
      { status: 500 }
    );
  }
}
