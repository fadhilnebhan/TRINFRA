import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeveloperEnquiryView from '@/components/opportunities/DeveloperEnquiryView';
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
      ? `Enquiry — ${opp.title} | Trinfra`
      : 'Developer & Investor Enquiry | Trinfra',
    description: opp
      ? `Submit an enquiry for ${opp.title}. Connect with Trinfra for credible land-pooling opportunities.`
      : 'Submit a developer or investor enquiry on Trinfra.',
  };
}

export default function OpportunityEnquiryPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <DeveloperEnquiryView initialOpportunityId={params.id} />
      </main>
      <Footer />
    </div>
  );
}
