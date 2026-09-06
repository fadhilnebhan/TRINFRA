import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AboutPageView from '@/components/about/AboutPageView';

export const metadata: Metadata = {
  title: 'About TRINFRA | Building Better Communities Through Land',
  description:
    'Learn how TRINFRA connects landowners, developers, and professional experts to transform fragmented land into structured, sustainable development opportunities.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <AboutPageView />
      <Footer />
    </main>
  );
}
