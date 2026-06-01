// Set production DATABASE_URL before requiring prisma
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1';

const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    const hash = await bcrypt.hash('Admin@123456', 12);
    const admin = await prisma.admin.upsert({
      where: { email: 'iteabhinavsharma@gmail.com' },
      update: { 
        password: hash,
        name: 'Super Admin',
      },
      create: {
        name: 'Super Admin',
        email: 'iteabhinavsharma@gmail.com',
        phone: '7983299389',
        password: hash,
      }
    });
    console.log('✅ Admin seeded successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin@123456');
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
