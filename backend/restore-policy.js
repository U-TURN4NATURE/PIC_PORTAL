const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function restorePolicy() {
  try {
    const policy = await prisma.policyDocument.update({
      where: { type: 'TERMS_CONDITIONS' },
      data: {
        title: 'Abhinav',
        fileUrl: 'https://res.cloudinary.com/dxvr20qlb/image/upload/v1783015917/pic-portal/docs/document-1783015917432.pdf',
        version: '1.1'
      }
    });
    console.log("Successfully restored policy:", policy);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

restorePolicy();
