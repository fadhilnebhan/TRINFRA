import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectsPageView from '@/components/projects/ProjectsPageView';
import { getPublicProjects } from '@/lib/server/projects';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Projects | TRINFRA',
  description:
    'Explore land opportunities that have progressed through the TRINFRA process — from structured planning to development.',
};

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <ProjectsPageView initialProjects={projects} />
      <Footer />
    </main>
  );
}
