import prisma from '../src/lib/prisma';

async function main() {
  console.log('Checking and restoring demo opportunities...');

  // 1. OPP-1
  await prisma.opportunity.upsert({
    where: { id: 'OPP-1' },
    update: {},
    create: {
      id: 'OPP-1',
      title: 'Kozhikode North',
      slug: 'kozhikode-north',
      location: 'Kozhikode, Kerala',
      district: 'Kozhikode',
      locality: 'Vadakara',
      area: 125,
      areaUnit: 'Acres',
      landownersCount: 18,
      status: 'IN_PROGRESS',
      image: '/images/houses_tropical.jpeg',
      shortDescription: 'Strategic location with strong development potential and excellent connectivity.',
      overview: 'Kozhikode North presents a significant opportunity for planned, sustainable development through a collaborative land-pooling model. The area benefits from strategic connectivity, proximity to key infrastructure, and strong growth potential. With 18 participating landowners and approximately 125 acres of consolidated land, this opportunity offers developers and investors a structured pathway to engage with a well-organized land pool.',
      highlights: JSON.stringify([
        'Strategic location with excellent connectivity',
        'Suitable for residential and commercial development',
        'Growing infrastructure in the region',
        'Collaborative land-pooling model',
        'Strong interest from developers and investors',
      ]),
      developmentPotential: 'Positioned for significant growth, with planned road expansions and proximity to transit corridors.',
      currentStatusDetail: 'Land aggregation is actively in progress with 18 participating landowners.',
      latitude: 11.35,
      longitude: 75.78,
    },
  });

  // 2. OPP-3
  await prisma.opportunity.upsert({
    where: { id: 'OPP-3' },
    update: {},
    create: {
      id: 'OPP-3',
      title: 'Palakkad West',
      slug: 'palakkad-west',
      location: 'Palakkad, Kerala',
      district: 'Palakkad',
      locality: 'Ottapalam',
      area: 86,
      areaUnit: 'Acres',
      landownersCount: 11,
      status: 'FORMING',
      image: '/images/agri_land.jpeg',
      shortDescription: 'Emerging cluster with high development and investment potential.',
      overview: 'Palakkad West is an emerging land-pooling opportunity in one of Kerala fastest-growing districts.',
      highlights: JSON.stringify([
        'Gateway location between Kerala and Tamil Nadu',
        'Growing IT and commercial presence',
      ]),
      developmentPotential: 'Residential and commercial projects targeting growing business corridors.',
      currentStatusDetail: 'Preliminary site assessments and owner coordination in progress.',
      latitude: 10.78,
      longitude: 76.58,
    },
  });

  const allOpps = await prisma.opportunity.findMany({ select: { id: true, title: true } });
  console.log('Current Opportunities in DB:', allOpps);

  const allProjs = await prisma.project.findMany({ select: { id: true, title: true } });
  console.log('Current Projects in DB:', allProjs);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
