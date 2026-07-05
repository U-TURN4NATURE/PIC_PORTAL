const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function insertTestPolicy() {
  try {
    const policy = await prisma.policyDocument.update({
      where: { type: 'TERMS_CONDITIONS' },
      data: {
        title: 'System Proof Policy',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // A standard 1-page dummy PDF
        version: '9.9'
      }
    });
    console.log("Successfully updated test policy:", policy);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

insertTestPolicy();
