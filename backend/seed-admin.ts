import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1'
    }
  }
});

async function seed() {
  const hash = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'iteabhinavsharma@gmail.com' },
    update: { role: 'ADMIN', status: 'ACTIVE', isEmailVerified: true },
    create: {
      fullName: 'Super Admin',
      email: 'iteabhinavsharma@gmail.com',
      phone: '7983299389',
      passwordHash: hash,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      address: 'Admin Address',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
    }
  });
  console.log('✅ Admin seeded successfully:', admin.email);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
