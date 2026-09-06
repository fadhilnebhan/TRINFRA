import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import {
  OPPORTUNITIES,
  getOpportunityById,
  getOpportunitySlug,
} from '@/lib/opportunitiesData';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  const ids = OPPORTUNITIES.map((o) => ({ id: o.id }));
  const slugs = OPPORTUNITIES.map((o) => ({ id: getOpportunitySlug(o) }));
  return [...ids, ...slugs];
}

export function generateMetadata({ params }: PageProps): Metadata {
  const opp = getOpportunityById(params.id);
  return {
    title: opp
      ? `${opp.title} | Trinfra Opportunities`
      : 'Opportunity | Trinfra',
    description: opp
      ? opp.shortDescription
      : 'View opportunity details on Trinfra.',
  };
}

export default function OpportunityPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <OpportunityDetail opportunityId={params.id} />
      </main>
      <Footer />
    </div>
  );
}
