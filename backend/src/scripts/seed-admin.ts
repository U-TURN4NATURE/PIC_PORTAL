import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'iteabhinavsharma@gmail.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';
  const name = process.env.ADMIN_SEED_NAME || 'Super Admin';
  const phone = process.env.ADMIN_SEED_PHONE || '7983299389';

  console.log(`🌱 Upserting admin user: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 12);

  // Upsert: update if exists, create if not
  await prisma.admin.upsert({
    where: { email },
    update: {
      name,
      phone,
      email,
    },
    create: {
      name,
      email,
      phone,
      password: hashedPassword,
    },
  });

  // Also add secondary admin email
  await prisma.admin.upsert({
    where: { email: 'abhinavsharma75990@gmail.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Abhinav Sharma',
      email: 'abhinavsharma75990@gmail.com',
      phone: '7983299389',
      password: hashedPassword,
    },
  });

  // Also clean up the old default admin if it exists
  try {
    await prisma.admin.delete({
      where: { email: 'admin@uturn4nature.com' },
    });
    console.log('🗑️  Removed old default admin (admin@uturn4nature.com)');
  } catch {
    // Old admin didn't exist, that's fine
  }

  console.log(`✅ Admin user ready: ${email} | Phone: ${phone}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
