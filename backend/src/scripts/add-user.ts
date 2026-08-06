import { PrismaClient, PICStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'abhinavsharma75990@gmail.com';
  const password = await bcrypt.hash('Admin@123456', 10);

  const pic = await prisma.pICPartner.upsert({
    where: { email },
    update: {
      status: PICStatus.ACTIVE,
      isEmailVerified: true,
      profileCompleted: true,
    },
    create: {
      fullName: 'Abhinav Sharma',
      email,
      phone: '7983299389',
      password,
      address: '123 Main St',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      status: PICStatus.ACTIVE,
      referralCode: 'ABHI759',
      isEmailVerified: true,
      profileCompleted: true,
      isPolicyAccepted: true,
      approvedAt: new Date(),
    },
  });

  await prisma.wallet.upsert({
    where: { picId: pic.id },
    update: {},
    create: {
      picId: pic.id,
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      availableBalance: 0,
    },
  });

  console.log(`✅ Created/Updated PIC Partner: ${pic.email}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
