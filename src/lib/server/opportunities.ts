import prisma from '@/lib/prisma';
import type { Opportunity, OpportunityStatus } from '@/lib/opportunitiesData';

/**
 * Format a raw Prisma opportunity record into a public-safe Opportunity object.
 * Excludes private landowner data and internal details.
 */
export function formatPublicOpportunity(opp: {
  id: string;
  title: string;
  slug: string;
  location: string;
  district: string;
  locality: string;
  area: number;
  areaUnit: string;
  landownersCount: number;
  status: string;
  image: string;
  shortDescription: string;
  overview: string;
  highlights: string | null;
  developmentPotential: string | null;
  currentStatusDetail: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}): Opportunity & { slug: string } {
  let parsedHighlights: string[] = [];
  if (opp.highlights) {
    try {
      parsedHighlights = JSON.parse(opp.highlights);
    } catch {
      parsedHighlights = [opp.highlights];
    }
  }

  let displayStatus: OpportunityStatus = 'New Opportunity';
  if (opp.status === 'IN_PROGRESS' || opp.status === 'In Progress') {
    displayStatus = 'In Progress';
  } else if (opp.status === 'FORMING' || opp.status === 'Emerging') {
    displayStatus = 'Emerging';
  } else if (opp.status === 'OPEN' || opp.status === 'New Opportunity') {
    displayStatus = 'New Opportunity';
  }

  // Sanitize image path: ensure fallback to reliable public assets
  let resolvedImage = opp.image;
  if (!resolvedImage || resolvedImage.includes('/images/opportunities/')) {
    resolvedImage = '/images/houses_tropical.jpeg';
  }

  return {
    id: opp.id,
    title: opp.title,
    slug: opp.slug,
    location: opp.location,
    district: opp.district,
    locality: opp.locality,
    area: opp.area,
    areaUnit: 'Acres',
    landowners: opp.landownersCount,
    status: displayStatus,
    image: resolvedImage,
    shortDescription: opp.shortDescription,
    overview: opp.overview,
    highlights: parsedHighlights,
    developmentPotential: opp.developmentPotential || '',
    currentStatusDetail: opp.currentStatusDetail || '',
    coordinates: {
      lat: opp.latitude ?? 10.85,
      lng: opp.longitude ?? 76.27,
    },
  };
}

/**
 * Fetch all publicly eligible opportunities from PostgreSQL.
 */
export async function getPublicOpportunities(): Promise<Array<Opportunity & { slug: string }>> {
  try {
    const opps = await prisma.opportunity.findMany({
      where: {
        status: { not: 'CLOSED' },
      },
      orderBy: { createdAt: 'desc' },
    });

    return opps.map(formatPublicOpportunity);
  } catch (error) {
    console.error('Failed to get public opportunities from database:', error);
    return [];
  }
}

/**
 * Fetch a single public opportunity by its ID or slug from PostgreSQL.
 * Returns null if not found.
 */
export async function getPublicOpportunityByIdOrSlug(
  idOrSlug: string
): Promise<(Opportunity & { slug: string }) | null> {
  if (!idOrSlug) return null;

  try {
    const opp = await prisma.opportunity.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: { not: 'CLOSED' },
      },
    });

    if (!opp) return null;
    return formatPublicOpportunity(opp);
  } catch (error) {
    console.error(`Failed to get public opportunity (${idOrSlug}) from database:`, error);
    return null;
  }
}

/**
 * Get the live count of public opportunities for stats.
 */
export async function getPublicOpportunitiesCount(): Promise<number> {
  try {
    return await prisma.opportunity.count({
      where: { status: { not: 'CLOSED' } },
    });
  } catch (error) {
    console.error('Failed to get public opportunities count from database:', error);
    return 0;
  }
}
