// Trinfra — Projects Data
// Structured data for projects that have progressed through the TRINFRA process.

export type ProjectStatus = 'Planning' | 'In Progress' | 'Development' | 'Completed';

export type DevelopmentStage =
  | 'Land Aggregation'
  | 'Planning'
  | 'Approvals'
  | 'Development'
  | 'Completed';

export interface Project {
  id: string;
  projectName: string;
  slug: string;
  location: string;
  district: string;
  approximateArea: string;
  areaNum: number;
  participatingLandowners: number;
  status: ProjectStatus;
  developmentStage: DevelopmentStage;
  image: string;
  description: string;
  overview: string;
  tags: string[];
  featured?: boolean;
  progressPercentage: number;
  updatedAt: string;
  opportunityId?: string | null;
  opportunity?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  } | null;
}

export const PROJECTS: Project[] = [
  {
    id: 'PROJ-1',
    projectName: 'Riverside Development Project',
    slug: 'riverside-development-project',
    location: 'Kottayam, Kerala',
    district: 'Kottayam',
    approximateArea: 'Approx. 120 Acres',
    areaNum: 120,
    participatingLandowners: 22,
    status: 'In Progress',
    developmentStage: 'Development',
    image: '/images/hero_landscape.jpeg',
    description:
      'A mixed-use development project with residential, commercial and community spaces, created through collaborative land pooling with multiple landowners.',
    overview:
      'The Riverside Development Project in Kottayam stands as a premier example of collaborative land pooling. Positioned along key transit and riverfront corridors, this 120-acre contiguous land parcel unites 22 local landholders into a single integrated master plan. Featuring eco-sensitive zoning, community waterfront promenades, and commercial hubs, this project is currently advancing through coordinated infrastructure execution.',
    tags: ['In Progress', 'Mixed Use', 'Sustainable Development'],
    featured: true,
    progressPercentage: 65,
    updatedAt: '2026-08-15',
  },
  {
    id: 'PROJ-2',
    projectName: 'Greenfield Township',
    slug: 'greenfield-township',
    location: 'Thrissur, Kerala',
    district: 'Thrissur',
    approximateArea: 'Approx. 80 Acres',
    areaNum: 80,
    participatingLandowners: 16,
    status: 'Planning',
    developmentStage: 'Planning',
    image: '/images/farm_grid.jpeg',
    description:
      'A planned residential township with modern amenities, internal arterial access, and expansive green spaces.',
    overview:
      'Greenfield Township aggregates 80 acres of fertile and gently rolling terrain in Thrissur. By pooling 16 contiguous agricultural and suburban parcels, TRINFRA has enabled a cohesive master plan that reserves 30% for open ecological buffers, modern civic infrastructure, and high-quality residential zones.',
    tags: ['Residential', 'Township'],
    progressPercentage: 35,
    updatedAt: '2026-07-20',
  },
  {
    id: 'PROJ-3',
    projectName: 'Lakeside Living',
    slug: 'lakeside-living',
    location: 'Alappuzha, Kerala',
    district: 'Alappuzha',
    approximateArea: 'Approx. 65 Acres',
    areaNum: 65,
    participatingLandowners: 12,
    status: 'In Progress',
    developmentStage: 'Approvals',
    image: '/images/rolling_hills.jpeg',
    description:
      'A premium residential and recreational development near the backwaters with sustainable water management.',
    overview:
      'Spanning 65 acres along the scenic backwater periphery of Alappuzha, Lakeside Living demonstrates how land pooling can harmonize premium residential architecture with sensitive wetland ecology. 12 participating landowners have structured collective covenants to ensure long-term value realization and environmental stewardship.',
    tags: ['Residential', 'Recreation'],
    progressPercentage: 55,
    updatedAt: '2026-08-01',
  },
  {
    id: 'PROJ-4',
    projectName: 'Tech Park Corridor',
    slug: 'tech-park-corridor',
    location: 'Ernakulam, Kerala',
    district: 'Ernakulam',
    approximateArea: 'Approx. 150 Acres',
    areaNum: 150,
    participatingLandowners: 28,
    status: 'Development',
    developmentStage: 'Development',
    image: '/images/digital_map.jpeg',
    description:
      'An integrated business and technology park with excellent connectivity to metro transit and major expressways.',
    overview:
      'Situated in the fast-expanding metropolitan perimeter of Ernakulam, the Tech Park Corridor consolidates 150 acres across 28 individual parcels. The master-planned park caters to global technology enterprises, research centres, and corporate logistics, offering plug-and-play developmental readiness.',
    tags: ['Commercial', 'IT / Business'],
    progressPercentage: 80,
    updatedAt: '2026-08-28',
  },
  {
    id: 'PROJ-5',
    projectName: 'Community Living',
    slug: 'community-living',
    location: 'Kozhikode, Kerala',
    district: 'Kozhikode',
    approximateArea: 'Approx. 45 Acres',
    areaNum: 45,
    participatingLandowners: 9,
    status: 'Completed',
    developmentStage: 'Completed',
    image: '/images/houses_tropical.jpeg',
    description:
      'A completed residential community with modern infrastructure, community centres, and shared facilities.',
    overview:
      'Completed in early 2026, Community Living in Kozhikode brought 9 disparate landowners together to create a 45-acre harmonious residential enclave. Landowners retained substantial equity shares and developed plots, achieving up to 3.2x value appreciation compared to isolated pre-pooling valuations.',
    tags: ['Residential', 'Completed'],
    progressPercentage: 100,
    updatedAt: '2026-06-10',
  },
  {
    id: 'PROJ-6',
    projectName: 'Trivandrum Outer Ring Road',
    slug: 'trivandrum-outer-ring-road',
    location: 'Navaikulam to Vizhinjam, Thiruvananthapuram, Kerala',
    district: 'Thiruvananthapuram',
    approximateArea: 'Approx. 240 Acres',
    areaNum: 240,
    participatingLandowners: 42,
    status: 'In Progress',
    developmentStage: 'Planning',
    image: '/images/digital_map.jpeg',
    description:
      'Strategic infrastructure corridor connecting Navaikulam to Vizhinjam Port through collaborative land pooling.',
    overview:
      'The Trivandrum Outer Ring Road (ORR) is a transformative 240-acre infrastructure growth corridor uniting 42 participating landowners. Connecting Navaikulam to the international seaport at Vizhinjam, this project coordinates land aggregation for logistics nodes, commercial zones, and smart transit infrastructure.',
    tags: ['Infrastructure', 'Logistics', 'In Progress'],
    featured: true,
    progressPercentage: 45,
    updatedAt: '2026-08-30',
  },
  {
    id: 'PROJ-7',
    projectName: 'Capital Logistics Hub',
    slug: 'capital-logistics-hub',
    location: 'Thiruvananthapuram, Kerala',
    district: 'Thiruvananthapuram',
    approximateArea: 'Approx. 95 Acres',
    areaNum: 95,
    participatingLandowners: 19,
    status: 'In Progress',
    developmentStage: 'Approvals',
    image: '/images/agri_land.jpeg',
    description:
      'Modern logistics and warehousing infrastructure located near port and national highway corridors.',
    overview:
      'Capital Logistics Hub aggregates 95 acres strategically adjacent to national freight arteries in Thiruvananthapuram. Catering to institutional grade logistics operators, the cluster resolves multi-party access easements into dedicated 30-metre right-of-ways.',
    tags: ['Logistics', 'Industrial'],
    progressPercentage: 50,
    updatedAt: '2026-08-10',
  },
  {
    id: 'PROJ-8',
    projectName: 'Wayanad Eco-Retreat',
    slug: 'wayanad-eco-retreat',
    location: 'Wayanad, Kerala',
    district: 'Wayanad',
    approximateArea: 'Approx. 55 Acres',
    areaNum: 55,
    participatingLandowners: 8,
    status: 'Planning',
    developmentStage: 'Land Aggregation',
    image: '/images/houses_valley.jpeg',
    description:
      'Sustainable hospitality and agro-tourism retreat preserving pristine mountain contours and coffee plantations.',
    overview:
      'Nestled in the high altitudes of Wayanad, this 55-acre development aggregates plantation land for low-density, sustainable tourism. The initiative safeguards indigenous biodiversity while generating long-term revenue yields for local families.',
    tags: ['Hospitality', 'Eco-Tourism'],
    progressPercentage: 25,
    updatedAt: '2026-07-05',
  },
];

export function getAllProjects(): Project[] {
  return PROJECTS;
}

export function getFeaturedProject(): Project | undefined {
  return PROJECTS.find((p) => p.featured) || PROJECTS[0];
}

export function getProjectById(idOrSlug: string): Project | undefined {
  const normalized = idOrSlug.toLowerCase();
  return PROJECTS.find(
    (p) =>
      p.id.toLowerCase() === normalized ||
      p.slug.toLowerCase() === normalized
  );
}

export function getProjectSlug(project: Project): string {
  return project.slug;
}
