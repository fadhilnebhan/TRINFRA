import { Metadata } from 'next';
import { getDistrictPropertyCounts, getPublicResidentialListings } from '@/lib/server/residential';
import ResidentialPage from '@/components/residential/ResidentialPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    district?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const district = searchParams.district;
  if (district && district !== 'ALL') {
    return {
      title: `Residential Flats & Apartments in ${district} | TRINFRA`,
      description: `Explore verified residential properties, flats, and luxury apartments for sale and rent in ${district}, Kerala on TRINFRA.`,
    };
  }

  return {
    title: 'Residential Property Marketplace | Kerala Flats & Apartments | TRINFRA',
    description: 'Find verified residential flats, apartments, and villas across all 14 Kerala districts on TRINFRA.',
  };
}

import { Suspense } from 'react';

export default async function Page({ searchParams }: PageProps) {
  const initialDistrict = searchParams.district || 'ALL';

  const [districts, initialResult] = await Promise.all([
    getDistrictPropertyCounts(),
    getPublicResidentialListings({
      district: initialDistrict !== 'ALL' ? initialDistrict : undefined,
      page: 1,
      limit: 12,
    }),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf9] pt-32 text-center text-xs text-gray-400">Loading marketplace...</div>}>
      <ResidentialPage
        initialDistricts={districts}
        initialListings={initialResult.listings}
        initialTotal={initialResult.total}
        initialDistrict={initialDistrict}
      />
    </Suspense>
  );
}
