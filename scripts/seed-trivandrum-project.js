const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Trivandrum Outer Ring Road project...');

  const torr = await prisma.project.upsert({
    where: { slug: 'trivandrum-outer-ring-road' },
    update: {
      title: 'Trivandrum Outer Ring Road',
      location: 'Thiruvananthapuram, Kerala',
      district: 'Thiruvananthapuram',
      approximateArea: 'Approx. 180 Acres',
      areaNum: 180,
      participatingLandowners: 34,
      status: 'IN_PROGRESS',
      developmentStage: 'PLANNING',
      progressPercentage: 45,
      image: '/images/hero_landscape.jpeg',
      description: "Strategic multi-cluster land pooling initiative along the capital's proposed 78km Outer Ring Road growth corridor.",
      overview: "The Trivandrum Outer Ring Road project aggregates high-potential land clusters along the capital's major growth axis. Uniting 34 participating landholders, this collaborative master plan coordinates logistics buffers, commercial zones, and sustainable residential communities directly connected to NH-66 and Vizhinjam Port transit arteries.",
      tags: JSON.stringify(['Infrastructure', 'Growth Corridor', 'Logistics']),
      featured: true,
    },
    create: {
      id: 'PROJ-6',
      title: 'Trivandrum Outer Ring Road',
      slug: 'trivandrum-outer-ring-road',
      location: 'Thiruvananthapuram, Kerala',
      district: 'Thiruvananthapuram',
      approximateArea: 'Approx. 180 Acres',
      areaNum: 180,
      participatingLandowners: 34,
      status: 'IN_PROGRESS',
      developmentStage: 'PLANNING',
      progressPercentage: 45,
      image: '/images/hero_landscape.jpeg',
      description: "Strategic multi-cluster land pooling initiative along the capital's proposed 78km Outer Ring Road growth corridor.",
      overview: "The Trivandrum Outer Ring Road project aggregates high-potential land clusters along the capital's major growth axis. Uniting 34 participating landholders, this collaborative master plan coordinates logistics buffers, commercial zones, and sustainable residential communities directly connected to NH-66 and Vizhinjam Port transit arteries.",
      tags: JSON.stringify(['Infrastructure', 'Growth Corridor', 'Logistics']),
      featured: true,
    },
  });

  console.log('Project upserted successfully:', torr);
}

main()
  .catch((err) => {
    console.error('Failed to seed project:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
