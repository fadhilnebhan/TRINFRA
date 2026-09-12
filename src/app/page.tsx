import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FloatingStats from '@/components/FloatingStats';
import HowItWorks from '@/components/HowItWorks';
import FeaturedOpportunities from '@/components/FeaturedOpportunities';
import TargetAudiences from '@/components/TargetAudiences';
import TrustVerification from '@/components/TrustVerification';
import KnowledgeCentre from '@/components/KnowledgeCentre';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';
import { getPublicOpportunities } from '@/lib/server/opportunities';

export const revalidate = 60;

export default async function Home() {
  const opportunities = await getPublicOpportunities();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FloatingStats liveOpportunitiesCount={opportunities.length} />
        <HowItWorks />
        <FeaturedOpportunities opportunities={opportunities.slice(0, 3)} />
        <TargetAudiences />
        <TrustVerification />
        <KnowledgeCentre />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
