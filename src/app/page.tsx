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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FloatingStats />
        <HowItWorks />
        <FeaturedOpportunities />
        <TargetAudiences />
        <TrustVerification />
        <KnowledgeCentre />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
