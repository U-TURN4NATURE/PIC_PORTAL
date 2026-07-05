const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const policies = await prisma.policyDocument.findMany({
    select: { id: true, title: true, type: true, version: true, fileUrl: true }
  });
  console.log(JSON.stringify(policies, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
