/**
 * PIC Portal — Database Backup Script
 * Run: node backup-db.js
 * Saves a JSON backup of all data to /backups/ folder
 */

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('./node_modules/@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
  console.log('🔄 Starting PIC Portal Database Backup...\n');

  try {
    // Fetch all tables
    const [
      admins,
      picPartners,
      wallets,
      referrals,
      saleEntries,
      orders,
      payouts,
      notifications,
      followUpRequests,
      auditLogs,
      shopifySettings,
    ] = await Promise.all([
      prisma.admin.findMany(),
      prisma.pICPartner.findMany(),
      prisma.wallet.findMany(),
      prisma.referral.findMany(),
      prisma.saleEntry.findMany(),
      prisma.order.findMany(),
      prisma.payout.findMany(),
      prisma.notification.findMany(),
      prisma.followUpRequest.findMany(),
      prisma.auditLog.findMany(),
      prisma.shopifySettings.findMany(),
    ]);

    const backup = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'backup-db.js',
        version: '1.0',
        counts: {
          admins: admins.length,
          picPartners: picPartners.length,
          wallets: wallets.length,
          referrals: referrals.length,
          saleEntries: saleEntries.length,
          orders: orders.length,
          payouts: payouts.length,
          notifications: notifications.length,
          followUpRequests: followUpRequests.length,
          auditLogs: auditLogs.length,
        },
      },
      data: {
        admins,
        picPartners,
        wallets,
        referrals,
        saleEntries,
        orders,
        payouts,
        notifications,
        followUpRequests,
        auditLogs,
        shopifySettings,
      },
    };

    // Create backups directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save with timestamp in filename
    const date = new Date().toISOString().split('T')[0]; // e.g. 2026-06-06
    const filename = `backup_${date}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8');

    console.log('✅ Backup completed successfully!\n');
    console.log('📁 Saved to:', filepath);
    console.log('\n📊 Summary:');
    Object.entries(backup.meta.counts).forEach(([table, count]) => {
      console.log(`   ${table.padEnd(20)} → ${count} records`);
    });

    console.log('\n💡 Keep this file safe — it contains all your data!');
    console.log('   Recommended: Copy to Google Drive or email to yourself.\n');

  } catch (err) {
    console.error('❌ Backup failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
