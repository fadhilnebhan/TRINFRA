import prisma from '@/lib/prisma';

export const KERALA_14_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
] as const;

export type KeralaDistrict = (typeof KERALA_14_DISTRICTS)[number];

export interface DistrictSummary {
  district: KeralaDistrict;
  count: number;
  hasListings: boolean;
}

/**
 * Calculate property count per district directly from database
 */
export async function getDistrictPropertyCounts(): Promise<DistrictSummary[]> {
  try {
    const counts = await prisma.residentialListing.groupBy({
      by: ['district'],
      where: { status: 'PUBLISHED' },
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    for (const item of counts) {
      countMap.set(item.district.toLowerCase(), item._count.id);
    }

    return KERALA_14_DISTRICTS.map((district) => {
      const count = countMap.get(district.toLowerCase()) || 0;
      return {
        district,
        count,
        hasListings: count > 0,
      };
    });
  } catch (error) {
    console.error('Failed to get district property counts:', error);
    return KERALA_14_DISTRICTS.map((district) => ({
      district,
      count: 0,
      hasListings: false,
    }));
  }
}

export interface PublicListingFilters {
  district?: string;
  search?: string;
  propertyType?: string;
  listingPurpose?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | string;
  bathrooms?: number | string;
  minArea?: number;
  maxArea?: number;
  furnishedStatus?: string;
  parking?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';
  page?: number;
  limit?: number;
}

export interface PublicListingItem {
  id: string;
  title: string;
  slug: string;
  propertyType: string;
  listingPurpose: string;
  description: string;
  district: string;
  locality: string;
  address: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  area: number;
  areaUnit: string;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  totalFloors: number | null;
  furnishedStatus: string | null;
  parking: string | null;
  balcony: number | null;
  propertyAge: string | null;
  facing: string | null;
  price: number;
  priceType: string;
  negotiable: boolean;
  amenities: string[];
  status: string;
  coverImage: string;
  images: Array<{ id: string; url: string; isCover: boolean; sortOrder: number }>;
  seller: {
    fullName: string;
    companyName: string | null;
  };
  createdAt: string;
  publishedAt: string | null;
}

/**
 * Format a residential listing for safe public consumption
 */
export function formatPublicResidentialListing(listing: any): PublicListingItem {
  const images = (listing.images || []).map((img: any) => ({
    id: img.id,
    url: img.url,
    isCover: img.isCover,
    sortOrder: img.sortOrder,
  }));

  const cover = images.find((i: any) => i.isCover) || images[0];
  const coverImage = cover?.url || '/images/residential-placeholder.jpg';

  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    propertyType: listing.propertyType,
    listingPurpose: listing.listingPurpose,
    description: listing.description,
    district: listing.district,
    locality: listing.locality,
    address: listing.address || null,
    pincode: listing.pincode || null,
    latitude: listing.latitude || null,
    longitude: listing.longitude || null,
    area: listing.area,
    areaUnit: listing.areaUnit,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    floor: listing.floor || null,
    totalFloors: listing.totalFloors || null,
    furnishedStatus: listing.furnishedStatus || null,
    parking: listing.parking || null,
    balcony: listing.balcony || null,
    propertyAge: listing.propertyAge || null,
    facing: listing.facing || null,
    price: listing.price,
    priceType: listing.priceType,
    negotiable: listing.negotiable,
    amenities: listing.amenities || [],
    status: listing.status,
    coverImage,
    images,
    seller: {
      fullName: listing.seller?.fullName || 'Verified Seller',
      companyName: listing.seller?.companyName || null,
    },
    createdAt: listing.createdAt instanceof Date ? listing.createdAt.toISOString() : listing.createdAt,
    publishedAt: listing.publishedAt instanceof Date ? listing.publishedAt.toISOString() : listing.publishedAt || null,
  };
}

/**
 * Query public listings with filtering, search, sorting and pagination
 */
export async function getPublicResidentialListings(filters: PublicListingFilters = {}) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 12));
  const skip = (page - 1) * limit;

  const where: any = {
    status: 'PUBLISHED',
  };

  if (filters.district) {
    where.district = { equals: filters.district, mode: 'insensitive' };
  }

  if (filters.propertyType && filters.propertyType !== 'All') {
    where.propertyType = { equals: filters.propertyType, mode: 'insensitive' };
  }

  if (filters.listingPurpose && filters.listingPurpose !== 'All') {
    where.listingPurpose = { equals: filters.listingPurpose, mode: 'insensitive' };
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    where.price = { ...(where.price || {}), gte: filters.minPrice };
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    where.price = { ...(where.price || {}), lte: filters.maxPrice };
  }

  if (filters.minArea !== undefined && filters.minArea > 0) {
    where.area = { ...(where.area || {}), gte: filters.minArea };
  }
  if (filters.maxArea !== undefined && filters.maxArea > 0) {
    where.area = { ...(where.area || {}), lte: filters.maxArea };
  }

  if (filters.bedrooms && filters.bedrooms !== 'All') {
    if (typeof filters.bedrooms === 'string' && filters.bedrooms.includes('+')) {
      const minBhk = parseInt(filters.bedrooms, 10);
      where.bedrooms = { gte: isNaN(minBhk) ? 4 : minBhk };
    } else {
      const bhk = typeof filters.bedrooms === 'number' ? filters.bedrooms : parseInt(filters.bedrooms, 10);
      if (!isNaN(bhk)) {
        where.bedrooms = bhk;
      }
    }
  }

  if (filters.bathrooms && filters.bathrooms !== 'All') {
    const baths = typeof filters.bathrooms === 'number' ? filters.bathrooms : parseInt(filters.bathrooms, 10);
    if (!isNaN(baths)) {
      where.bathrooms = { gte: baths };
    }
  }

  if (filters.furnishedStatus && filters.furnishedStatus !== 'All') {
    where.furnishedStatus = { equals: filters.furnishedStatus, mode: 'insensitive' };
  }

  if (filters.parking && filters.parking !== 'All') {
    where.parking = { equals: filters.parking, mode: 'insensitive' };
  }

  if (filters.search && filters.search.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { locality: { contains: search, mode: 'insensitive' } },
      { district: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { publishedAt: 'desc' };
  if (filters.sortBy === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (filters.sortBy === 'price_desc') {
    orderBy = { price: 'desc' };
  } else if (filters.sortBy === 'area_asc') {
    orderBy = { area: 'asc' };
  } else if (filters.sortBy === 'area_desc') {
    orderBy = { area: 'desc' };
  } else if (filters.sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  try {
    const [total, records] = await Promise.all([
      prisma.residentialListing.count({ where }),
      prisma.residentialListing.findMany({
        where,
        include: {
          images: {
            orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
          },
          seller: {
            select: {
              fullName: true,
              companyName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const listings = records.map(formatPublicResidentialListing);
    const totalPages = Math.ceil(total / limit);

    return {
      listings,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error('Failed to get public residential listings:', error);
    return {
      listings: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false,
    };
  }
}

/**
 * Fetch a single public listing by slug or ID
 */
export async function getPublicResidentialListingBySlugOrId(idOrSlug: string) {
  if (!idOrSlug) return null;

  try {
    const listing = await prisma.residentialListing.findFirst({
      where: {
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
        status: 'PUBLISHED',
      },
      include: {
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
          },
        },
      },
    });

    if (!listing) return null;
    return formatPublicResidentialListing(listing);
  } catch (error) {
    console.error(`Failed to get public residential listing (${idOrSlug}):`, error);
    return null;
  }
}

/**
 * Helper to generate URL-safe unique slug
 */
export async function generateUniqueListingSlug(title: string, district: string): Promise<string> {
  const base = `${title}-${district}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = base || 'property';
  let counter = 1;

  while (true) {
    const existing = await prisma.residentialListing.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      return slug;
    }
    slug = `${base}-${counter++}`;
  }
}
