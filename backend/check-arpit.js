const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArpit() {
  const arpit = await prisma.referral.findFirst({
    where: { personName: 'Arpit' },
    include: { sales: true }
  });
  console.log(JSON.stringify(arpit, null, 2));
}

checkArpit().catch(console.error).finally(() => prisma.$disconnect());
