const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require" }
  }
});
async function check() {
  const pic = await prisma.pICPartner.findFirst({ where: { profileImage: { not: null } } });
  console.log(pic?.profileImage);
  prisma.$disconnect();
}
check();
