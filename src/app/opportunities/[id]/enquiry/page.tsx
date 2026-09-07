import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeveloperEnquiryView from '@/components/opportunities/DeveloperEnquiryView';
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
    title: `Enquiry — ${opp.title} | Trinfra`,
    description: `Submit an enquiry for ${opp.title}. Connect with Trinfra for credible land-pooling opportunities.`,
  };
}

export default async function OpportunityEnquiryPage({ params }: PageProps) {
  const opp = await getPublicOpportunityByIdOrSlug(params.id);

  if (!opp) {
    notFound();
  }

  const allOpps = await getPublicOpportunities();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <DeveloperEnquiryView
          initialOpportunityId={opp.id}
          initialOpportunity={opp}
          opportunitiesList={allOpps}
        />
      </main>
      <Footer />
    </div>
  );
}
