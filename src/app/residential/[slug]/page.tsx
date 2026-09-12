import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicResidentialListingBySlugOrId } from '@/lib/server/residential';
import ResidentialDetail from '@/components/residential/ResidentialDetail';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getPublicResidentialListingBySlugOrId(params.slug);
  if (!listing) {
    notFound();
  }

  return {
    title: `${listing.title} | TRINFRA`,
    description: listing.description
      ? listing.description.substring(0, 155)
      : `${listing.propertyType} for ${listing.listingPurpose} in ${listing.locality}, ${listing.district}.`,
    openGraph: {
      title: `${listing.title} | TRINFRA`,
      description: `${listing.bedrooms} BHK ${listing.propertyType} in ${listing.locality}, ${listing.district}`,
      images: [listing.coverImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const listing = await getPublicResidentialListingBySlugOrId(params.slug);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow">
        <ResidentialDetail listing={listing} />
      </main>
      <Footer />
    </div>
  );
}
