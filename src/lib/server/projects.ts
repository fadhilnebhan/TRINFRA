import prisma from '@/lib/prisma';
import type { Project, ProjectStatus, DevelopmentStage } from '@/lib/projectsData';

/**
 * Format a raw Prisma project record into a public Project object.
 */
export function formatPublicProject(proj: {
  id: string;
  title: string;
  slug: string;
  location: string;
  district: string;
  approximateArea: string;
  areaNum: number;
  participatingLandowners: number;
  status: string;
  developmentStage: string;
  progressPercentage: number;
  image: string;
  description: string;
  overview: string;
  tags: string | null;
  featured: boolean;
  opportunityId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}): Project {
  let parsedTags: string[] = [];
  if (proj.tags) {
    try {
      parsedTags = JSON.parse(proj.tags);
    } catch {
      parsedTags = [proj.tags];
    }
  }

  let displayStatus: ProjectStatus = 'Planning';
  if (proj.status === 'IN_PROGRESS' || proj.status === 'In Progress') {
    displayStatus = 'In Progress';
  } else if (proj.status === 'DEVELOPMENT' || proj.status === 'Development') {
    displayStatus = 'Development';
  } else if (proj.status === 'COMPLETED' || proj.status === 'Completed') {
    displayStatus = 'Completed';
  }

  let displayStage: DevelopmentStage = 'Planning';
  if (proj.developmentStage === 'LAND_AGGREGATION' || proj.developmentStage === 'Land Aggregation') {
    displayStage = 'Land Aggregation';
  } else if (proj.developmentStage === 'PLANNING' || proj.developmentStage === 'Planning') {
    displayStage = 'Planning';
  } else if (proj.developmentStage === 'APPROVALS' || proj.developmentStage === 'Approvals') {
    displayStage = 'Approvals';
  } else if (proj.developmentStage === 'DEVELOPMENT' || proj.developmentStage === 'Development') {
    displayStage = 'Development';
  } else if (proj.developmentStage === 'COMPLETED' || proj.developmentStage === 'Completed') {
    displayStage = 'Completed';
  }

  return {
    id: proj.id,
    projectName: proj.title,
    slug: proj.slug,
    location: proj.location,
    district: proj.district,
    approximateArea: proj.approximateArea,
    areaNum: proj.areaNum,
    participatingLandowners: proj.participatingLandowners,
    status: displayStatus,
    developmentStage: displayStage,
    progressPercentage: proj.progressPercentage,
    image: (!proj.image || proj.image.includes('/images/projects/')) ? '/images/houses_tropical.jpeg' : proj.image,
    description: proj.description,
    overview: proj.overview,
    tags: parsedTags,
    featured: proj.featured,
    updatedAt: proj.updatedAt ? proj.updatedAt.toISOString().split('T')[0] : '2026-08-15',
    opportunityId: proj.opportunityId,
    opportunity: (proj as any).opportunity
      ? {
          id: (proj as any).opportunity.id,
          title: (proj as any).opportunity.title,
          slug: (proj as any).opportunity.slug,
          status: (proj as any).opportunity.status,
        }
      : null,
  };
}

/**
 * Fetch all public projects from PostgreSQL.
 */
export async function getPublicProjects(): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      include: { opportunity: true },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(formatPublicProject);
  } catch (error) {
    console.error('Failed to get public projects from database:', error);
    return [];
  }
}

/**
 * Fetch a single public project by ID or slug from PostgreSQL.
 */
export async function getPublicProjectByIdOrSlug(idOrSlug: string): Promise<Project | null> {
  if (!idOrSlug) return null;

  try {
    const proj = await prisma.project.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        opportunity: true,
      },
    });
    if (!proj) return null;
    return formatPublicProject(proj);
  } catch (error) {
    console.error(`Failed to get public project (${idOrSlug}) from database:`, error);
    return null;
  }
}
