const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPolicies() {
  const policies = await prisma.policyDocument.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(policies, null, 2));
}

checkPolicies().catch(console.error).finally(() => prisma.$disconnect());
