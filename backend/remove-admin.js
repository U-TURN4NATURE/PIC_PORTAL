process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1';

const { PrismaClient } = require('./node_modules/@prisma/client');

const prisma = new PrismaClient();

async function removeAdmin(email) {
  try {
    const admin = await prisma.admin.delete({
      where: { email: email },
    });
    console.log('✅ Admin removed successfully!');
    console.log('   Removed Email:', admin.email);
    console.log('   Removed Name:', admin.name);
  } catch (e) {
    if (e.code === 'P2025') {
      console.error(`❌ Failed: Admin with email '${email}' not found.`);
    } else {
      console.error('❌ Failed:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Change the email below to the email of the admin you want to remove
removeAdmin('admin_email_to_remove@example.com');
