import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up dummy seed data & Restoring exact backup data...\n');

  const backupFilePath = path.join(__dirname, '../../backups/backup_2026-06-06.json');
  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file not found at: ${backupFilePath}`);
  }

  const rawData = fs.readFileSync(backupFilePath, 'utf8');
  const backup = JSON.parse(rawData);
  const { data } = backup;

  // Clean existing tables in reverse dependency order
  await prisma.policyAcceptanceLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.followUpRequest.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.saleEntry.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.pICPartner.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('🧹 Existing dummy data cleaned.\n');

  // 1. Admins
  if (data.admins && data.admins.length > 0) {
    for (const admin of data.admins) {
      await prisma.admin.create({ data: admin });
      console.log(`✅ Restored Admin: ${admin.email}`);
    }
  }

  // 2. PIC Partners
  if (data.picPartners && data.picPartners.length > 0) {
    for (const pic of data.picPartners) {
      await prisma.pICPartner.create({ data: pic });
      console.log(`✅ Restored PIC Partner: ${pic.fullName} (${pic.email}) | Code: ${pic.referralCode}`);
    }
  }

  // 3. Wallets
  if (data.wallets && data.wallets.length > 0) {
    for (const wallet of data.wallets) {
      await prisma.wallet.create({ data: wallet });
      console.log(`✅ Restored Wallet for PIC: ${wallet.picId}`);
    }
  }

  // 4. Referrals
  if (data.referrals && data.referrals.length > 0) {
    for (const referral of data.referrals) {
      await prisma.referral.create({ data: referral });
      console.log(`✅ Restored Referral: ${referral.personName} (${referral.personPhone})`);
    }
  }

  // 5. Sale Entries
  if (data.saleEntries && data.saleEntries.length > 0) {
    for (const sale of data.saleEntries) {
      await prisma.saleEntry.create({ data: sale });
      console.log(`✅ Restored Sale Entry: ₹${sale.saleAmount}`);
    }
  }

  // 6. Orders
  if (data.orders && data.orders.length > 0) {
    for (const order of data.orders) {
      await prisma.order.create({ data: order });
      console.log(`✅ Restored Order: ${order.shopifyOrderId}`);
    }
  }

  // 7. Payouts
  if (data.payouts && data.payouts.length > 0) {
    for (const payout of data.payouts) {
      await prisma.payout.create({ data: payout });
      console.log(`✅ Restored Payout: ₹${payout.amount}`);
    }
  }

  // 8. Notifications
  if (data.notifications && data.notifications.length > 0) {
    for (const notif of data.notifications) {
      await prisma.notification.create({ data: notif });
      console.log(`✅ Restored Notification: ${notif.title}`);
    }
  }

  // 9. FollowUp Requests
  if (data.followUpRequests && data.followUpRequests.length > 0) {
    for (const req of data.followUpRequests) {
      await prisma.followUpRequest.create({ data: req });
      console.log(`✅ Restored FollowUp Request: ${req.id}`);
    }
  }

  // 10. Audit Logs
  if (data.auditLogs && data.auditLogs.length > 0) {
    for (const log of data.auditLogs) {
      await prisma.auditLog.create({ data: log });
      console.log(`✅ Restored Audit Log: ${log.action}`);
    }
  }

  console.log('\n🎉 ALL REAL BACKUP DATA RESTORED 100% SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Restore failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
