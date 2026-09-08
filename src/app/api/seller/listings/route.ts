import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedSeller } from '@/lib/auth';
import { generateUniqueListingSlug, KERALA_14_DISTRICTS } from '@/lib/server/residential';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listings = await prisma.residentialListing.findMany({
      where: { sellerId: seller.userId },
      include: {
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: { enquiries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: listings.length,
      published: listings.filter((l) => l.status === 'PUBLISHED').length,
      pending: listings.filter((l) => l.status === 'PENDING_REVIEW').length,
      draft: listings.filter((l) => l.status === 'DRAFT').length,
      rejected: listings.filter((l) => l.status === 'REJECTED').length,
      totalEnquiries: listings.reduce((acc, l) => acc + l._count.enquiries, 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      listings,
    });
  } catch (error) {
    console.error('Error in GET /api/seller/listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Title is required (min 3 characters)' }, { status: 400 });
    }
    if (!district || !KERALA_14_DISTRICTS.includes(district as any)) {
      return NextResponse.json(
        { success: false, error: `District must be one of Kerala's 14 districts` },
        { status: 400 }
      );
    }
    if (!locality || typeof locality !== 'string' || locality.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Locality is required' }, { status: 400 });
    }
    if (!price || Number(price) <= 0) {
      return NextResponse.json({ success: false, error: 'Valid price is required' }, { status: 400 });
    }
    if (!area || Number(area) <= 0) {
      return NextResponse.json({ success: false, error: 'Valid area is required' }, { status: 400 });
    }
    if (bedrooms === undefined || Number(bedrooms) < 0) {
      return NextResponse.json({ success: false, error: 'Bedrooms count is required' }, { status: 400 });
    }
    if (bathrooms === undefined || Number(bathrooms) < 0) {
      return NextResponse.json({ success: false, error: 'Bathrooms count is required' }, { status: 400 });
    }

    const slug = await generateUniqueListingSlug(title.trim(), district);
    const initialStatus = submitForReview ? 'PENDING_REVIEW' : 'DRAFT';

    const listing = await prisma.residentialListing.create({
      data: {
        sellerId: seller.userId,
        title: title.trim(),
        slug,
        propertyType: propertyType || 'Apartment',
        listingPurpose: listingPurpose || 'Sale',
        description: description?.trim() || '',
        district,
        locality: locality.trim(),
        address: address?.trim() || null,
        pincode: pincode?.trim() || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        area: Number(area),
        areaUnit: areaUnit || 'sq ft',
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        floor: floor ? Number(floor) : null,
        totalFloors: totalFloors ? Number(totalFloors) : null,
        furnishedStatus: furnishedStatus || null,
        parking: parking || null,
        balcony: balcony ? Number(balcony) : null,
        propertyAge: propertyAge || null,
        facing: facing || null,
        price: Number(price),
        priceType: priceType || 'Total',
        negotiable: Boolean(negotiable),
        amenities: Array.isArray(amenities) ? amenities : [],
        status: initialStatus,
        images: {
          create: (Array.isArray(images) ? images : []).map((img: any, idx: number) => ({
            storageKey: img.storageKey || `img_${Date.now()}_${idx}`,
            url: img.url,
            filename: img.filename || 'image.jpg',
            mimeType: img.mimeType || 'image/jpeg',
            size: img.size || 0,
            sortOrder: idx,
            isCover: idx === 0 || Boolean(img.isCover),
          })),
        },
      },
      include: {
        images: true,
      },
    });

    // If submitted for review, create notification for admin
    if (initialStatus === 'PENDING_REVIEW') {
      try {
        await prisma.notification.create({
          data: {
            type: 'system',
            title: 'New Residential Listing Submitted',
            message: `Seller submitted "${listing.title}" in ${listing.district} for review.`,
            reference: listing.id,
          },
        });
      } catch (notifErr) {
        console.warn('Notification error:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: initialStatus === 'PENDING_REVIEW'
        ? 'Listing submitted for review successfully'
        : 'Draft listing saved successfully',
      listing,
    });
  } catch (error) {
    console.error('Error in POST /api/seller/listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
