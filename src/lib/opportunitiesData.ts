// Trinfra — Opportunities Data
// Seed data for land-pooling opportunities. Swap for API later.

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
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-1',
    title: 'Kozhikode North',
    location: 'Kozhikode, Kerala',
    district: 'Kozhikode',
    locality: 'Vadakara',
    area: 125,
    areaUnit: 'Acres',
    landowners: 18,
    status: 'In Progress',
    image: '/images/houses_tropical.jpeg',
    shortDescription: 'Strategic location with strong development potential and excellent connectivity.',
    overview: 'Kozhikode North presents a significant opportunity for planned, sustainable development through a collaborative land-pooling model. The area benefits from strategic connectivity, proximity to key infrastructure, and strong growth potential. With 18 participating landowners and approximately 125 acres of consolidated land, this opportunity offers developers and investors a structured pathway to engage with a well-organized land pool.',
    highlights: [
      'Strategic location with excellent connectivity',
      'Suitable for residential and commercial development',
      'Growing infrastructure in the region',
      'Collaborative land-pooling model',
      'Strong interest from developers and investors',
    ],
    developmentPotential: 'The Kozhikode North area is positioned for significant growth, with planned road expansions, proximity to the Kozhikode International Airport, and increasing demand for residential, commercial, and mixed-use developments. The consolidated land pool offers scale advantages that individual parcels cannot provide.',
    currentStatusDetail: 'Land aggregation is actively in progress. 18 landowners have expressed interest and initial documentation is under review. Trinfra is facilitating discussions between stakeholders and coordinating due diligence processes.',
    coordinates: { lat: 11.35, lng: 75.78 },
  },
  {
    id: 'OPP-2',
    title: 'Malappuram Growth Corridor',
    location: 'Malappuram, Kerala',
    district: 'Malappuram',
    locality: 'Manjeri',
    area: 210,
    areaUnit: 'Acres',
    landowners: 26,
    status: 'In Progress',
    image: '/images/rolling_hills.jpeg',
    shortDescription: 'Well-connected corridor with multi-sector development opportunities.',
    overview: 'The Malappuram Growth Corridor represents one of the largest consolidated land-pooling opportunities in the region. Spanning approximately 210 acres across 26 participating landowners, this corridor benefits from proximity to major transport links and a rapidly growing urban fringe. The area is seeing increasing interest from developers looking for large-scale, well-organized land parcels.',
    highlights: [
      'Large-scale consolidated opportunity',
      'Proximity to major transport links',
      'Rapidly growing urban fringe area',
      'Multi-sector development potential',
      'Strong community participation',
    ],
    developmentPotential: 'The Malappuram Growth Corridor is ideal for integrated township development, combining residential, commercial, and institutional spaces. The region\'s demographic growth and infrastructure investments make it a prime candidate for sustainable, planned development.',
    currentStatusDetail: 'Active land pooling with 26 landowners participating. Survey and documentation processes are underway. Developer interest sessions have been conducted with positive responses.',
    coordinates: { lat: 11.07, lng: 76.07 },
  },
  {
    id: 'OPP-3',
    title: 'Palakkad West',
    location: 'Palakkad, Kerala',
    district: 'Palakkad',
    locality: 'Ottapalam',
    area: 86,
    areaUnit: 'Acres',
    landowners: 11,
    status: 'New Opportunity',
    image: '/images/agri_land.jpeg',
    shortDescription: 'Emerging cluster with high development and investment potential.',
    overview: 'Palakkad West is an emerging land-pooling opportunity in one of Kerala\'s fastest-growing districts. The area offers a unique combination of agricultural land transitioning towards development potential, with 86 acres and 11 landowners forming the initial pool. Palakkad\'s strategic position as a gateway to Tamil Nadu and its growing IT presence make this an attractive proposition.',
    highlights: [
      'Gateway location between Kerala and Tamil Nadu',
      'Growing IT and commercial presence',
      'Agricultural land with development reclassification potential',
      'Affordable land values with upside potential',
      'Well-organized initial landowner group',
    ],
    developmentPotential: 'Palakkad is experiencing a transformation driven by IT parks, educational institutions, and improved rail and road connectivity. The western corridor is particularly well-positioned for residential and commercial projects targeting professionals and families relocating to the region.',
    currentStatusDetail: 'Newly formed opportunity. Initial landowner discussions are underway and preliminary site assessments are being conducted. The opportunity is open for developer and investor interest.',
    coordinates: { lat: 10.78, lng: 76.58 },
  },
  {
    id: 'OPP-4',
    title: 'Thrissur East',
    location: 'Thrissur, Kerala',
    district: 'Thrissur',
    locality: 'Chalakudy',
    area: 160,
    areaUnit: 'Acres',
    landowners: 22,
    status: 'Emerging',
    image: '/images/farm_grid.jpeg',
    shortDescription: 'Close to industrial and residential hubs with strong infrastructure.',
    overview: 'Thrissur East offers a compelling land-pooling opportunity near one of Kerala\'s most vibrant economic centers. With 160 acres across 22 landowners, this cluster benefits from proximity to industrial zones, educational institutions, and healthcare facilities. The area is well-connected by road and rail, making it suitable for a range of development scenarios.',
    highlights: [
      'Proximity to Thrissur\'s industrial and commercial zones',
      'Strong existing infrastructure backbone',
      'Diverse development potential',
      'Well-connected transport network',
      'Growing residential demand',
    ],
    developmentPotential: 'Thrissur\'s economic dynamism creates sustained demand for quality residential and commercial spaces. The eastern corridor is experiencing infrastructure upgrades that will further enhance land values and development feasibility.',
    currentStatusDetail: 'Emerging opportunity with initial stakeholder discussions underway. Trinfra is coordinating preliminary assessments and landowner engagement sessions.',
    coordinates: { lat: 10.52, lng: 76.28 },
  },
  {
    id: 'OPP-5',
    title: 'Ernakulam South',
    location: 'Ernakulam, Kerala',
    district: 'Ernakulam',
    locality: 'Thrippunithura',
    area: 200,
    areaUnit: 'Acres',
    landowners: 28,
    status: 'In Progress',
    image: '/images/houses_valley.jpeg',
    shortDescription: 'Prime location with multi-sector opportunities near Kochi.',
    overview: 'Ernakulam South represents a premium land-pooling opportunity in the greater Kochi metropolitan area. With approximately 200 acres and 28 landowners, this is one of the most strategically located opportunities in the Trinfra portfolio. Proximity to Kochi\'s commercial districts, port facilities, and international airport creates exceptional development potential.',
    highlights: [
      'Premium metropolitan location near Kochi',
      'Strong commercial and residential demand',
      'Excellent connectivity to port, airport, and metro',
      'Diverse development possibilities',
      'Mature infrastructure in surrounding areas',
    ],
    developmentPotential: 'The greater Kochi area continues to attract significant investment in commercial, residential, and mixed-use developments. Ernakulam South\'s proximity to key economic drivers makes it ideal for premium development projects with strong return potential.',
    currentStatusDetail: 'Active land pooling with strong participation. Documentation and due diligence processes are well underway. Multiple developers have expressed preliminary interest.',
    coordinates: { lat: 9.93, lng: 76.32 },
  },
  {
    id: 'OPP-6',
    title: 'Kannur Coastal',
    location: 'Kannur, Kerala',
    district: 'Kannur',
    locality: 'Thalassery',
    area: 75,
    areaUnit: 'Acres',
    landowners: 9,
    status: 'New Opportunity',
    image: '/images/agri_fields.jpeg',
    shortDescription: 'Scenic location with tourism and residential potential.',
    overview: 'Kannur Coastal is a newly emerging opportunity that combines scenic coastal landscapes with development potential. The 75-acre pool across 9 landowners is situated in an area experiencing growing tourism and residential interest, particularly following the opening of Kannur International Airport.',
    highlights: [
      'Scenic coastal setting',
      'Growing tourism and hospitality demand',
      'Airport proximity driving land value appreciation',
      'Residential development potential',
      'Small, well-organized landowner group',
    ],
    developmentPotential: 'Kannur\'s coastal belt is emerging as a premium destination for tourism, hospitality, and high-end residential development. The international airport has catalyzed economic growth, creating opportunities for well-planned coastal developments.',
    currentStatusDetail: 'Newly identified opportunity. Preliminary discussions with landowners are underway. The opportunity is open for developers interested in coastal and tourism-oriented projects.',
    coordinates: { lat: 11.87, lng: 75.37 },
  },
  {
    id: 'OPP-7',
    title: 'Kollam Industrial Belt',
    location: 'Kollam, Kerala',
    district: 'Kollam',
    locality: 'Karunagappally',
    area: 180,
    areaUnit: 'Acres',
    landowners: 20,
    status: 'Emerging',
    image: '/images/digital_map.jpeg',
    shortDescription: 'Industrial zone proximity with mixed-use development scope.',
    overview: 'The Kollam Industrial Belt opportunity is positioned near one of Kerala\'s established industrial corridors. With 180 acres and 20 participating landowners, this pool offers significant potential for industrial, commercial, and residential development that can serve the growing workforce and business community in the region.',
    highlights: [
      'Adjacent to established industrial zone',
      'Mixed-use development potential',
      'Growing workforce and residential demand',
      'Well-connected by road and rail',
      'Competitive land values',
    ],
    developmentPotential: 'Kollam\'s industrial belt is undergoing modernization, attracting new industries and creating demand for quality commercial and residential infrastructure. The area\'s competitive land values and growing economic activity present strong development fundamentals.',
    currentStatusDetail: 'Emerging opportunity with 20 landowners in preliminary discussions. Site assessment and infrastructure mapping are in progress.',
    coordinates: { lat: 9.0, lng: 76.58 },
  },
  {
    id: 'OPP-8',
    title: 'Wayanad Highlands',
    location: 'Wayanad, Kerala',
    district: 'Wayanad',
    locality: 'Kalpetta',
    area: 95,
    areaUnit: 'Acres',
    landowners: 14,
    status: 'New Opportunity',
    image: '/images/rolling_hills.jpeg',
    shortDescription: 'Premium highland location for eco-tourism and residential projects.',
    overview: 'Wayanad Highlands presents a unique opportunity in one of Kerala\'s most sought-after hill station areas. The 95-acre pool across 14 landowners offers potential for eco-tourism, wellness retreats, and premium residential developments that leverage the area\'s natural beauty and growing tourism appeal.',
    highlights: [
      'Premium hill station location',
      'Strong tourism and wellness demand',
      'Natural beauty as a key asset',
      'Eco-friendly development potential',
      'Growing domestic tourism market',
    ],
    developmentPotential: 'Wayanad continues to attract domestic and international tourists, creating demand for quality hospitality and residential developments. Eco-tourism and wellness-oriented projects are particularly well-suited to the area\'s character and regulatory environment.',
    currentStatusDetail: 'New opportunity with initial landowner interest confirmed. Preliminary feasibility assessments are underway, focusing on eco-sensitive development parameters.',
    coordinates: { lat: 11.62, lng: 76.08 },
  },
  {
    id: 'OPP-9',
    title: 'Thiruvananthapuram North',
    location: 'Thiruvananthapuram, Kerala',
    district: 'Thiruvananthapuram',
    locality: 'Kazhakkoottam',
    area: 150,
    areaUnit: 'Acres',
    landowners: 19,
    status: 'In Progress',
    image: '/images/houses_tropical.jpeg',
    shortDescription: 'IT corridor adjacent opportunity with strong residential demand.',
    overview: 'Thiruvananthapuram North is strategically located near the Technopark IT corridor, one of India\'s largest IT parks. The 150-acre pool with 19 landowners is positioned to serve the growing demand for residential and commercial spaces driven by the IT sector\'s continued expansion in the state capital.',
    highlights: [
      'Adjacent to Technopark IT corridor',
      'Strong residential demand from IT workforce',
      'State capital advantages',
      'Growing social infrastructure',
      'Established educational and healthcare facilities nearby',
    ],
    developmentPotential: 'The IT-driven growth in Thiruvananthapuram is creating sustained demand for quality housing, commercial spaces, and social infrastructure. The northern corridor is well-positioned to capture this demand with planned, integrated development.',
    currentStatusDetail: 'Active land pooling in progress. Documentation review is underway for most participating parcels. Developer presentations have been conducted.',
    coordinates: { lat: 8.58, lng: 76.88 },
  },
  {
    id: 'OPP-10',
    title: 'Alappuzha Backwaters',
    location: 'Alappuzha, Kerala',
    district: 'Alappuzha',
    locality: 'Cherthala',
    area: 65,
    areaUnit: 'Acres',
    landowners: 8,
    status: 'Emerging',
    image: '/images/agri_fields.jpeg',
    shortDescription: 'Unique backwater-adjacent location for tourism and premium residential.',
    overview: 'Alappuzha Backwaters offers a distinctive opportunity near Kerala\'s famous backwater network. The 65-acre pool across 8 landowners is suited for tourism-oriented and premium residential developments that can leverage the area\'s unique natural assets and established tourism brand.',
    highlights: [
      'Proximity to famous Kerala backwaters',
      'Established tourism brand and infrastructure',
      'Premium residential potential',
      'Unique natural setting',
      'Compact, manageable landowner group',
    ],
    developmentPotential: 'Alappuzha\'s backwater tourism brand is internationally recognized, creating opportunities for premium hospitality and residential projects. Sustainable waterfront development can command significant premiums while respecting the ecological sensitivity of the area.',
    currentStatusDetail: 'Emerging opportunity with 8 landowners expressing initial interest. Ecological and regulatory assessments are being planned.',
    coordinates: { lat: 9.5, lng: 76.33 },
  },
  {
    id: 'OPP-11',
    title: 'Kottayam Central',
    location: 'Kottayam, Kerala',
    district: 'Kottayam',
    locality: 'Ettumanoor',
    area: 110,
    areaUnit: 'Acres',
    landowners: 15,
    status: 'Emerging',
    image: '/images/houses_valley.jpeg',
    shortDescription: 'Central Kerala hub with education and healthcare sector demand.',
    overview: 'Kottayam Central is positioned in one of Kerala\'s major educational and healthcare hubs. The 110-acre opportunity across 15 landowners benefits from the city\'s established institutional presence and growing demand for quality residential and commercial spaces to serve students, professionals, and families.',
    highlights: [
      'Major educational and healthcare hub',
      'Strong institutional demand drivers',
      'Central Kerala location with good connectivity',
      'Growing residential market',
      'Established urban services',
    ],
    developmentPotential: 'Kottayam\'s role as an educational and healthcare center creates consistent demand for quality real estate. Residential projects serving institutional communities and commercial spaces for supporting businesses present strong development cases.',
    currentStatusDetail: 'Emerging opportunity. Landowner engagement sessions are being organized. Preliminary land assessment is planned.',
    coordinates: { lat: 9.6, lng: 76.52 },
  },
  {
    id: 'OPP-12',
    title: 'Idukki Spice Valley',
    location: 'Idukki, Kerala',
    district: 'Idukki',
    locality: 'Thodupuzha',
    area: 140,
    areaUnit: 'Acres',
    landowners: 16,
    status: 'New Opportunity',
    image: '/images/farm_grid.jpeg',
    shortDescription: 'Spice plantation area with agri-tourism and eco-resort potential.',
    overview: 'Idukki Spice Valley is a unique opportunity set in Kerala\'s famous spice-growing region. The 140-acre pool across 16 landowners combines agricultural heritage with development potential, particularly for agri-tourism, eco-resorts, and sustainable living communities that celebrate the area\'s cultural and natural assets.',
    highlights: [
      'Famous spice-growing heritage',
      'Agri-tourism and eco-resort potential',
      'Sustainable living community opportunity',
      'Scenic hill country setting',
      'Growing interest in experiential tourism',
    ],
    developmentPotential: 'The global trend towards experiential and agri-tourism aligns perfectly with Idukki\'s assets. Eco-resorts, spice experience centers, and sustainable residential communities represent high-value development opportunities in this unique setting.',
    currentStatusDetail: 'Newly formed opportunity. Initial landowner interest has been confirmed and preliminary feasibility discussions are underway. Open for developer and investor expressions of interest.',
    coordinates: { lat: 9.85, lng: 76.72 },
  },
];

/**
 * Get all unique districts from opportunities.
 */
export function getOpportunityDistricts(): string[] {
  return Array.from(new Set(OPPORTUNITIES.map(o => o.district))).sort();
}

/**
 * Get all unique localities from opportunities.
 */
export function getOpportunityLocalities(): string[] {
  return Array.from(new Set(OPPORTUNITIES.map(o => o.locality))).sort();
}

/**
 * Get URL slug for an opportunity (e.g. 'kozhikode-north').
 */
export function getOpportunitySlug(opp: Opportunity): string {
  return opp.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get an opportunity by its ID or slug (e.g. 'OPP-1' or 'kozhikode-north').
 */
export function getOpportunityById(idOrSlug: string): Opportunity | undefined {
  if (!idOrSlug) return undefined;
  const q = decodeURIComponent(idOrSlug).toLowerCase().trim();
  return OPPORTUNITIES.find(
    o => o.id.toLowerCase() === q || getOpportunitySlug(o) === q
  );
}

/**
 * Filter opportunities by criteria.
 */
export function filterOpportunities(filters: {
  district?: string;
  locality?: string;
  areaRange?: string;
  status?: string;
  search?: string;
}): Opportunity[] {
  let results = [...OPPORTUNITIES];

  if (filters.district) {
    results = results.filter(o => o.district === filters.district);
  }
  if (filters.locality) {
    results = results.filter(o =>
      o.locality.toLowerCase().includes(filters.locality!.toLowerCase())
    );
  }
  if (filters.areaRange) {
    switch (filters.areaRange) {
      case 'under-50':
        results = results.filter(o => o.area < 50);
        break;
      case '50-100':
        results = results.filter(o => o.area >= 50 && o.area <= 100);
        break;
      case '100-200':
        results = results.filter(o => o.area >= 100 && o.area <= 200);
        break;
      case 'above-200':
        results = results.filter(o => o.area > 200);
        break;
    }
  }
  if (filters.status) {
    results = results.filter(o => o.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      o =>
        o.title.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.shortDescription.toLowerCase().includes(q)
    );
  }

  return results;
}
