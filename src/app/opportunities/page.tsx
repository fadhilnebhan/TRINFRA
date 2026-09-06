import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpportunitiesPage from '@/components/opportunities/OpportunitiesPage';

export const metadata: Metadata = {
  title: 'Opportunities | Trinfra — Land-Pooling & Development Facilitation',
  description:
    'Explore credible land-pooling opportunities across Kerala. Discover structured information for developers, investors, and stakeholders.',
};

export default function OpportunitiesRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <OpportunitiesPage />
      </main>
      <Footer />
    </div>
  );
}
