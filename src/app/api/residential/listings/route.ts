import { NextResponse } from 'next/server';
import { getPublicResidentialListings } from '@/lib/server/residential';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const district = searchParams.get('district') || undefined;
    const search = searchParams.get('search') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const listingPurpose = searchParams.get('listingPurpose') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const bedrooms = searchParams.get('bedrooms') || undefined;
    const bathrooms = searchParams.get('bathrooms') || undefined;
    const minArea = searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined;
    const maxArea = searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined;
    const furnishedStatus = searchParams.get('furnishedStatus') || undefined;
    const parking = searchParams.get('parking') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'newest';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;

    const result = await getPublicResidentialListings({
      district,
      search,
      propertyType,
      listingPurpose,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      furnishedStatus,
      parking,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in GET /api/residential/listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch residential listings' },
      { status: 500 }
    );
  }
}
