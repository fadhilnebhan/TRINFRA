// Trinfra — Opportunities Data
// Schema and helper utilities for land-pooling opportunities.

export type OpportunityStatus = 'Emerging' | 'In Progress' | 'New Opportunity';

export interface Opportunity {
  id: string;
  title: string;
  location: string;
  district: string;
  locality: string;
  area: number;
  areaUnit: 'Acres';
  landowners: number;
  status: OpportunityStatus;
  image: string;
  shortDescription: string;
  overview: string;
  highlights: string[];
  developmentPotential: string;
  currentStatusDetail: string;
  coordinates: { lat: number; lng: number }; // approximate, public-safe
  isPinned?: boolean;
  pinnedAt?: string | null;
}

// Single source of truth is PostgreSQL. No hardcoded mock opportunities.
export const OPPORTUNITIES: Opportunity[] = [];

/**
 * Get all unique districts from opportunities list.
 */
export function getOpportunityDistricts(list: Opportunity[] = OPPORTUNITIES): string[] {
  return Array.from(new Set(list.map((o) => o.district))).sort();
}

/**
 * Get all unique localities from opportunities list.
 */
export function getOpportunityLocalities(list: Opportunity[] = OPPORTUNITIES): string[] {
  return Array.from(new Set(list.map((o) => o.locality))).sort();
}

/**
 * Get URL slug for an opportunity (e.g. 'kozhikode-north').
 */
export function getOpportunitySlug(opp: Opportunity | { title: string; slug?: string }): string {
  if ('slug' in opp && opp.slug) return opp.slug;
  return opp.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get an opportunity by its ID or slug from a given list.
 */
export function getOpportunityById(
  idOrSlug: string,
  list: Opportunity[] = OPPORTUNITIES
): Opportunity | undefined {
  if (!idOrSlug) return undefined;
  const q = decodeURIComponent(idOrSlug).toLowerCase().trim();
  return list.find(
    (o) => o.id.toLowerCase() === q || getOpportunitySlug(o) === q
  );
}

/**
 * Filter opportunities by criteria.
 */
export function filterOpportunities(
  filters: {
    district?: string;
    locality?: string;
    areaRange?: string;
    status?: string;
    search?: string;
  },
  list: Opportunity[] = OPPORTUNITIES
): Opportunity[] {
  let results = [...list];

  if (filters.district) {
    results = results.filter((o) => o.district === filters.district);
  }
  if (filters.locality) {
    results = results.filter((o) =>
      o.locality.toLowerCase().includes(filters.locality!.toLowerCase())
    );
  }
  if (filters.areaRange) {
    switch (filters.areaRange) {
      case 'under-50':
        results = results.filter((o) => o.area < 50);
        break;
      case '50-100':
        results = results.filter((o) => o.area >= 50 && o.area <= 100);
        break;
      case '100-200':
        results = results.filter((o) => o.area >= 100 && o.area <= 200);
        break;
      case 'above-200':
        results = results.filter((o) => o.area > 200);
        break;
    }
  }
  if (filters.status) {
    results = results.filter((o) => o.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.shortDescription.toLowerCase().includes(q)
    );
  }

  return results;
}
