const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const pics = await prisma.pICPartner.findMany({
    select: { id: true, fullName: true, aadhaarDocument: true, panDocument: true, resumeDocument: true }
  });
  console.log(JSON.stringify(pics, null, 2));
}
run().finally(() => prisma.$disconnect());
