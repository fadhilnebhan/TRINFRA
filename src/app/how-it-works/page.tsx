import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HowItWorksView from '@/components/how-it-works/HowItWorksView';

export const metadata: Metadata = {
  title: 'How Trinfra Works | Simple, Structured, Transparent Land Pooling',
  description:
    'Discover how TRINFRA brings landowners, developers, and professional experts together through a structured 4-step process: Register, Verify, Cluster, and Facilitate.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <HowItWorksView />
      <Footer />
    </main>
  );
}
