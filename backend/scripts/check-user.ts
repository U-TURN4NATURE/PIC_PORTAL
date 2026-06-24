import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const email = 'abhinavsharma75990@gmail.com';
  
  const pic = await prisma.pICPartner.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
      isEmailVerified: true,
      profileCompleted: true,
      password: true,
      createdAt: true,
    }
  });

  if (!pic) {
    console.log('❌ NO ACCOUNT FOUND with email:', email);
    console.log('→ The user does not exist in the PICPartner table.');
  } else {
    console.log('✅ Account found:');
    console.log('  Name      :', pic.fullName);
    console.log('  Email     :', pic.email);
    console.log('  Status    :', pic.status);
    console.log('  Email Verified :', pic.isEmailVerified);
    console.log('  Profile Done   :', pic.profileCompleted);
    console.log('  Password  :', pic.password ? 'SET ✅' : '❌ NULL (Google-only account)');
    console.log('  Created   :', pic.createdAt);
  }

  // Also check Admin table
  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true, email: true, name: true }
  });
  if (admin) {
    console.log('\n⚠️  This email is also an ADMIN account!');
    console.log('→ PIC login will fail — use /admin/login instead.');
  }

  await prisma.$disconnect();
}

checkUser().catch(console.error);
