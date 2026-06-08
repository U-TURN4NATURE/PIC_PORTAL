process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1';

const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addAdmin() {
  try {
    const hash = await bcrypt.hash('Abhishek@1005', 12);
    const admin = await prisma.admin.upsert({
      where: { email: 'abku73@gmail.com' },
      update: {
        password: hash,
        name: 'Abhishek Admin',
      },
      create: {
        name: 'Abhishek Admin',
        email: 'abku73@gmail.com',
        password: hash,
      }
    });
    console.log('✅ Admin added successfully!');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin();
