/**
 * PIC Portal — Database Seed Script
 * 
 * Creates test data for development:
 * - 1 Admin (if not exists)
 * - 5 PICs in various states (PENDING, APPROVED x2, ACTIVE, REJECTED)
 * - 10 Referrals across the approved PICs
 * - 5 Orders with commissions
 * - Wallets for all PICs
 * 
 * Run: npx ts-node prisma/seed.ts
 * Or:  npx prisma db seed
 */

import { PrismaClient, PICStatus, ReferralStatus, OrderStatus, HandledBy } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── 1. Admin ─────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@uturn4nature.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@uturn4nature.com',
      password: adminPassword,
      phone: '9000000000',
    },
  });
  console.log('✅ Admin:', admin.email);

  // ─── 2. PICs ──────────────────────────────────────
  const password = await bcrypt.hash('Test@1234', 10);

  const picsData = [
    {
      fullName: 'Anjali Mehra',
      email: 'anjali.mehra@test.com',
      phone: '9111111111',
      status: PICStatus.PENDING,
      referralCode: null,
      isEmailVerified: true,
    },
    {
      fullName: 'Ravi Kumar',
      email: 'ravi.kumar@test.com',
      phone: '9222222222',
      status: PICStatus.APPROVED,
      referralCode: 'RAVI001',
      isEmailVerified: true,
      approvedAt: new Date(),
    },
    {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@test.com',
      phone: '9333333333',
      status: PICStatus.APPROVED,
      referralCode: 'PRIY002',
      isEmailVerified: true,
      approvedAt: new Date(),
    },
    {
      fullName: 'Mohit Singh',
      email: 'mohit.singh@test.com',
      phone: '9444444444',
      status: PICStatus.ACTIVE,
      referralCode: 'MOHI003',
      isEmailVerified: true,
      approvedAt: new Date(),
    },
    {
      fullName: 'Sneha Patel',
      email: 'sneha.patel@test.com',
      phone: '9555555555',
      status: PICStatus.REJECTED,
      referralCode: null,
      isEmailVerified: true,
      rejectionReason: 'Incomplete information provided.',
      rejectedAt: new Date(),
    },
  ];

  const pics = [];
  for (const data of picsData) {
    const pic = await prisma.pICPartner.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password,
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isPolicyAccepted: true,
        wallet: { create: { totalEarnings: 0, pendingEarnings: 0, paidEarnings: 0, availableBalance: 0 } },
      },
    });
    pics.push(pic);
    console.log(`✅ PIC [${pic.status}]: ${pic.fullName} — ${pic.email}`);
  }

  // ─── 3. Referrals (for approved/active PICs) ──────
  const activePics = pics.filter(p => p.status === PICStatus.APPROVED || p.status === PICStatus.ACTIVE);
  
  const referralsData = [
    { personName: 'Ramesh Joshi', personPhone: '9600000001', status: ReferralStatus.PENDING },
    { personName: 'Kavita Nair', personPhone: '9600000002', status: ReferralStatus.CONTACTED },
    { personName: 'Arjun Verma', personPhone: '9600000003', status: ReferralStatus.INTERESTED },
    { personName: 'Deepika Rao', personPhone: '9600000004', status: ReferralStatus.BUYING },
    { personName: 'Suresh Gupta', personPhone: '9600000005', status: ReferralStatus.ACTIVE_SELLER },
    { personName: 'Pooja Bhat', personPhone: '9600000006', status: ReferralStatus.NOT_BUYING },
    { personName: 'Nitin Shah', personPhone: '9600000007', status: ReferralStatus.PENDING },
    { personName: 'Anita Desai', personPhone: '9600000008', status: ReferralStatus.CONTACTED },
    { personName: 'Rohit Pillai', personPhone: '9600000009', status: ReferralStatus.INTERESTED },
    { personName: 'Meena Iyer', personPhone: '9600000010', status: ReferralStatus.BUYING },
  ];

  for (let i = 0; i < referralsData.length; i++) {
    const picId = activePics[i % activePics.length].id;
    await prisma.referral.create({
      data: {
        ...referralsData[i],
        picId,
        handledBy: HandledBy.U_TURN_NATURE,
        totalSalesAmount: 0,
        commissionAmount: 0,
      },
    });
  }
  console.log(`✅ Created 10 referrals across ${activePics.length} PICs`);

  // ─── 4. Orders + Commissions (for active PIC) ─────
  const activePic = pics.find(p => p.status === PICStatus.ACTIVE);
  if (activePic) {
    const orderAmounts = [2000, 3500, 1500, 4000, 2500];
    for (let i = 0; i < orderAmounts.length; i++) {
      const amount = orderAmounts[i];
      const commission = amount * 0.05;
      await prisma.order.create({
        data: {
          shopifyOrderId: `SEED_ORDER_${i + 1}`,
          picId: activePic.id,
          customerName: `Customer ${i + 1}`,
          customerEmail: `customer${i + 1}@test.com`,
          orderAmount: amount,
          commissionAmount: commission,
          commissionRate: 5,
          status: OrderStatus.PAID,
        },
      });
    }
    // Update wallet
    const totalCommission = orderAmounts.reduce((s, a) => s + a * 0.05, 0);
    await prisma.wallet.update({
      where: { picId: activePic.id },
      data: {
        totalEarnings: totalCommission,
        paidEarnings: totalCommission * 0.6,
        availableBalance: totalCommission * 0.4,
      },
    });
    console.log(`✅ Created 5 orders for active PIC: ${activePic.fullName}`);
  }

  // ─── 5. Announcement ──────────────────────────────
  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-1' },
    update: {},
    create: {
      id: 'seed-announcement-1',
      title: '🌿 Welcome to PIC Portal!',
      content: 'We are excited to have you as a PIC Partner. Start referring customers using your unique referral link and earn 5% commission on every sale. If you have any questions, feel free to reach out to our support team.',
      authorId: admin.id,
      isActive: true,
    },
  });
  console.log('✅ Created welcome announcement');

  console.log('\n🎉 Seeding complete!\n');
  console.log('🔑 Test Credentials:');
  console.log('   Admin:  admin@uturn4nature.com / Admin@1234');
  console.log('   PICs:   [email above] / Test@1234');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
