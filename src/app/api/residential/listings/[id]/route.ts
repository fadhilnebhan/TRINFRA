import { NextResponse } from 'next/server';
import { getPublicResidentialListingBySlugOrId } from '@/lib/server/residential';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    if (!idOrSlug) {
      return NextResponse.json({ success: false, error: 'Listing ID or slug is required' }, { status: 400 });
    }

    const listing = await getPublicResidentialListingBySlugOrId(idOrSlug);
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Error in GET /api/residential/listings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing detail' },
      { status: 500 }
    );
  }
}
