import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import { PROJECTS, getProjectById } from '@/lib/projectsData';
import {
  OPPORTUNITIES,
  getOpportunityById,
  getOpportunitySlug,
} from '@/lib/opportunitiesData';

interface PageProps {
  params: { id: string };
}

// Project to Opportunity mapping for seamless detail reuse
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
  'PROJ-6': 'OPP-2',
  'capital-logistics-hub': 'OPP-2',
  'PROJ-7': 'OPP-3',
  'wayanad-eco-retreat': 'OPP-3',
};

export function generateStaticParams() {
  const projectIds = PROJECTS.map((p) => ({ id: p.id }));
  const projectSlugs = PROJECTS.map((p) => ({ id: p.slug }));
  const oppIds = OPPORTUNITIES.map((o) => ({ id: o.id }));
  const oppSlugs = OPPORTUNITIES.map((o) => ({ id: getOpportunitySlug(o) }));
  return [...projectIds, ...projectSlugs, ...oppIds, ...oppSlugs];
}

export function generateMetadata({ params }: PageProps): Metadata {
  const project = getProjectById(params.id);
  if (project) {
    return {
      title: `${project.projectName} | TRINFRA Projects`,
      description: project.description,
    };
  }
  const opp = getOpportunityById(params.id);
  return {
    title: opp ? `${opp.title} | TRINFRA Projects` : 'Project | TRINFRA',
    description: opp ? opp.shortDescription : 'View project details on TRINFRA.',
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProjectDetailPage({ params }: PageProps) {
  // Resolve mapped opportunity ID or direct ID
  const mappedOppId = PROJECT_OPPORTUNITY_MAP[params.id] || params.id;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <OpportunityDetail opportunityId={mappedOppId} />
      </main>
      <Footer />
    </div>
  );
}
