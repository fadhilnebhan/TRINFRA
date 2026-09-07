import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import {
  getPublicOpportunityByIdOrSlug,
  getPublicOpportunities,
} from '@/lib/server/opportunities';

interface PageProps {
  params: { id: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const opp = await getPublicOpportunityByIdOrSlug(params.id);
  if (!opp) {
    return {
      title: 'Opportunity Not Found | Trinfra',
      description: 'The requested land opportunity could not be found.',
    };
  }

  return {
    title: `${opp.title} | Trinfra Opportunities`,
    description: opp.shortDescription || 'View opportunity details on Trinfra.',
  };
}

export default async function OpportunityPage({ params }: PageProps) {
  const opp = await getPublicOpportunityByIdOrSlug(params.id);

  if (!opp) {
    notFound();
  }

  const allOpps = await getPublicOpportunities();
  const relatedOpps = allOpps.filter((o) => o.id !== opp.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <OpportunityDetail
          opportunityId={params.id}
          initialOpportunity={opp}
          relatedOpportunities={relatedOpps}
        />
      </main>
      <Footer />
    </div>
  );
}
