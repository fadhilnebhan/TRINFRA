import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import { getPublicProjectByIdOrSlug } from '@/lib/server/projects';
import {
  getPublicOpportunityByIdOrSlug,
  getPublicOpportunities,
} from '@/lib/server/opportunities';

interface PageProps {
  params: { id: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Project to Opportunity mapping for legacy detail reuse
const PROJECT_OPPORTUNITY_MAP: Record<string, string> = {
  'PROJ-1': 'OPP-1',
  'riverside-development-project': 'OPP-1',
  'PROJ-2': 'OPP-4',
  'greenfield-township': 'OPP-4',
  'PROJ-3': 'OPP-2',
  'lakeside-living': 'OPP-2',
  'PROJ-4': 'OPP-3',
  'tech-park-corridor': 'OPP-3',
  'PROJ-5': 'OPP-1',
  'community-living': 'OPP-1',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getPublicProjectByIdOrSlug(params.id);
  if (project) {
    return {
      title: `${project.projectName} | TRINFRA Projects`,
      description: project.description,
    };
  }
  const mappedOppId = PROJECT_OPPORTUNITY_MAP[params.id] || params.id;
  const opp = await getPublicOpportunityByIdOrSlug(mappedOppId);
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
  const project = await getPublicProjectByIdOrSlug(params.id);
  const mappedOppId = PROJECT_OPPORTUNITY_MAP[params.id] || params.id;
  const opp = await getPublicOpportunityByIdOrSlug(mappedOppId);

  if (!project && !opp) {
    notFound();
  }

  const allOpps = await getPublicOpportunities();
  const relatedOpps = opp ? allOpps.filter((o) => o.id !== opp.id).slice(0, 3) : allOpps.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <OpportunityDetail
          opportunityId={opp ? opp.id : mappedOppId}
          initialOpportunity={opp}
          relatedOpportunities={relatedOpps}
        />
      </main>
      <Footer />
    </div>
  );
}
