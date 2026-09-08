import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedSeller } from '@/lib/auth';
import { KERALA_14_DISTRICTS } from '@/lib/server/residential';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        enquiries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    // STRICT AUTHORIZATION: Seller can only access their own listings
    if (listing.sellerId !== seller.userId && seller.role !== 'ADMIN' && seller.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot access another seller\'s listing' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Error in GET /api/seller/listings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    // STRICT AUTHORIZATION: Seller can only modify their own listings
    if (existing.sellerId !== seller.userId && seller.role !== 'ADMIN' && seller.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot edit another seller\'s listing' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      propertyType,
      listingPurpose,
      description,
      district,
      locality,
      address,
      pincode,
      latitude,
      longitude,
      area,
      areaUnit,
      bedrooms,
      bathrooms,
      floor,
      totalFloors,
      furnishedStatus,
      parking,
      balcony,
      propertyAge,
      facing,
      price,
      priceType,
      negotiable,
      amenities,
      images,
      submitForReview,
    } = body;

    if (district && !KERALA_14_DISTRICTS.includes(district as any)) {
      return NextResponse.json(
        { success: false, error: `District must be one of Kerala's 14 districts` },
        { status: 400 }
      );
    }

    // Workflow: If a published listing is edited, it becomes PENDING_REVIEW for safety
    let nextStatus = existing.status;
    if (submitForReview) {
      nextStatus = 'PENDING_REVIEW';
    } else if (existing.status === 'PUBLISHED') {
      nextStatus = 'PENDING_REVIEW';
    } else if (existing.status === 'REJECTED') {
      nextStatus = 'DRAFT';
    }

    const updateData: any = {
      ...(title !== undefined && { title: title.trim() }),
      ...(propertyType !== undefined && { propertyType }),
      ...(listingPurpose !== undefined && { listingPurpose }),
      ...(description !== undefined && { description }),
      ...(district !== undefined && { district }),
      ...(locality !== undefined && { locality: locality.trim() }),
      ...(address !== undefined && { address }),
      ...(pincode !== undefined && { pincode }),
      ...(latitude !== undefined && { latitude: latitude ? Number(latitude) : null }),
      ...(longitude !== undefined && { longitude: longitude ? Number(longitude) : null }),
      ...(area !== undefined && { area: Number(area) }),
      ...(areaUnit !== undefined && { areaUnit }),
      ...(bedrooms !== undefined && { bedrooms: Number(bedrooms) }),
      ...(bathrooms !== undefined && { bathrooms: Number(bathrooms) }),
      ...(floor !== undefined && { floor: floor ? Number(floor) : null }),
      ...(totalFloors !== undefined && { totalFloors: totalFloors ? Number(totalFloors) : null }),
      ...(furnishedStatus !== undefined && { furnishedStatus }),
      ...(parking !== undefined && { parking }),
      ...(balcony !== undefined && { balcony: balcony ? Number(balcony) : null }),
      ...(propertyAge !== undefined && { propertyAge }),
      ...(facing !== undefined && { facing }),
      ...(price !== undefined && { price: Number(price) }),
      ...(priceType !== undefined && { priceType }),
      ...(negotiable !== undefined && { negotiable: Boolean(negotiable) }),
      ...(amenities !== undefined && { amenities: Array.isArray(amenities) ? amenities : [] }),
      status: nextStatus,
    };

    // If new images list is provided, update images
    if (Array.isArray(images)) {
      await prisma.residentialImage.deleteMany({
        where: { listingId: params.id },
      });

      updateData.images = {
        create: images.map((img: any, idx: number) => ({
          storageKey: img.storageKey || `img_${Date.now()}_${idx}`,
          url: img.url,
          filename: img.filename || 'image.jpg',
          mimeType: img.mimeType || 'image/jpeg',
          size: img.size || 0,
          sortOrder: idx,
          isCover: idx === 0 || Boolean(img.isCover),
        })),
      };
    }

    const updated = await prisma.residentialListing.update({
      where: { id: params.id },
      data: updateData,
      include: {
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      listing: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/seller/listings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.residentialListing.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    // STRICT AUTHORIZATION
    if (existing.sellerId !== seller.userId && seller.role !== 'ADMIN' && seller.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot delete another seller\'s listing' },
        { status: 403 }
      );
    }

    await prisma.residentialListing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/seller/listings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
