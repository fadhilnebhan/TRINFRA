import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpportunitiesPage from '@/components/opportunities/OpportunitiesPage';
import { getPublicOpportunities } from '@/lib/server/opportunities';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Opportunities | Trinfra — Land-Pooling & Development Facilitation',
  description:
    'Explore credible land-pooling opportunities across Kerala. Discover structured information for developers, investors, and stakeholders.',
};

export default async function OpportunitiesRoute() {
  const opportunities = await getPublicOpportunities();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <OpportunitiesPage initialOpportunities={opportunities} />
      </main>
      <Footer />
    </div>
  );
}
