const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const opps = await prisma.opportunity.findMany({
    select: {
      id: true,
      title: true,
      isPinned: true,
      pinnedAt: true,
      createdAt: true,
      status: true,
      image: true
    },
    orderBy: { createdAt: 'asc' }
  });
  console.log('=== OPPORTUNITIES IN DB (COUNT: ' + opps.length + ') ===');
  opps.forEach(o => {
    console.log(JSON.stringify(o));
  });

  const projs = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });
  console.log('=== PROJECTS IN DB (COUNT: ' + projs.length + ') ===');
  projs.forEach(p => {
    console.log(JSON.stringify(p));
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
