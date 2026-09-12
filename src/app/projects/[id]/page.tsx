import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectDetailView from '@/components/projects/ProjectDetailView';
import { getPublicProjectByIdOrSlug } from '@/lib/server/projects';
import { getPublicOpportunityByIdOrSlug, getPublicOpportunities } from '@/lib/server/opportunities';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';

interface PageProps {
  params: { id: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getPublicProjectByIdOrSlug(params.id);
  if (project) {
    return {
      title: `${project.projectName} | TRINFRA Projects`,
      description: project.description || `Explore ${project.projectName} in ${project.district}, Kerala on TRINFRA.`,
    };
  }

  // Fallback check for legacy opportunity routes
  const opp = await getPublicOpportunityByIdOrSlug(params.id);
  if (opp) {
    return {
      title: `${opp.title} | TRINFRA Projects`,
      description: opp.shortDescription,
    };
  }

  return {
    title: 'Project Not Found | TRINFRA',
    description: 'The requested project could not be found.',
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  // 1. Primary lookup: Project in PostgreSQL
  const project = await getPublicProjectByIdOrSlug(params.id);

  if (project) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9] font-sans text-foreground">
        <Navbar />
        <main className="flex-grow pt-[72px]">
          <ProjectDetailView initialProject={project} projectId={params.id} />
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Legacy fallback lookup for opportunity if linked
  const opp = await getPublicOpportunityByIdOrSlug(params.id);
  if (opp) {
    const allOpps = await getPublicOpportunities();
    const relatedOpps = allOpps.filter((o) => o.id !== opp.id).slice(0, 3);

    return (
      <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
        <Navbar />
        <main className="flex-grow pt-[72px]">
          <OpportunityDetail
            opportunityId={opp.id}
            initialOpportunity={opp}
            relatedOpportunities={relatedOpps}
            projectId={params.id}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Genuine 404
  notFound();
}
