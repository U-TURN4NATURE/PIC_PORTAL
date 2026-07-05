const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAll() {
  const policies = await prisma.policyDocument.findMany();
  console.log(JSON.stringify(policies, null, 2));
}

checkAll().catch(console.error).finally(() => prisma.$disconnect());
