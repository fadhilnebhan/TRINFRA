import { NextResponse } from 'next/server';
import { getDistrictPropertyCounts } from '@/lib/server/residential';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const districts = await getDistrictPropertyCounts();
    return NextResponse.json({
      success: true,
      districts,
    });
  } catch (error) {
    console.error('Error in /api/residential/districts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch district property counts' },
      { status: 500 }
    );
  }
}
