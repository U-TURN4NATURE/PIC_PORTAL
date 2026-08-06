import { PrismaClient } from '@prisma/client';

const oldDbUrl = 'postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=60&pool_timeout=0';

const oldPrisma = new PrismaClient({
  datasources: { db: { url: oldDbUrl } },
});

const newPrisma = new PrismaClient(); // uses process.env.DATABASE_URL (new database)

async function syncAllData() {
  console.log('🔄 Attempting to sync all PIC data from old database to new database...\n');

  try {
    const oldPics = await oldPrisma.pICPartner.findMany();
    console.log(`📦 Found ${oldPics.length} PIC Partners in old database.`);

    for (const pic of oldPics) {
      await newPrisma.pICPartner.upsert({
        where: { id: pic.id },
        update: pic,
        create: pic,
      });
      console.log(`✅ Synced PIC: ${pic.fullName} (${pic.email})`);
    }

    const oldWallets = await oldPrisma.wallet.findMany();
    for (const w of oldWallets) {
      await newPrisma.wallet.upsert({ where: { id: w.id }, update: w, create: w });
    }

    const oldReferrals = await oldPrisma.referral.findMany();
    for (const r of oldReferrals) {
      await newPrisma.referral.upsert({ where: { id: r.id }, update: r, create: r });
    }

    const oldOrders = await oldPrisma.order.findMany();
    for (const o of oldOrders) {
      await newPrisma.order.upsert({ where: { id: o.id }, update: o, create: o });
    }

    console.log('\n🎉 ALL RECENT PIC DATA SYNCED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Sync failed:', err.message);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

syncAllData();
