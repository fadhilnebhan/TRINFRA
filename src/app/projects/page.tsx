import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectsPageView from '@/components/projects/ProjectsPageView';

export const metadata: Metadata = {
  title: 'Projects | TRINFRA',
  description:
    'Explore land opportunities that have progressed through the TRINFRA process — from structured planning to development.',
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <ProjectsPageView />
      <Footer />
    </main>
  );
}
