const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('🚀 Updating User Schema for Suspension Logic...');
  
  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS suspension_reason TEXT
    `;
    console.log('✅ Added is_suspended and suspension_reason to users table');
    console.log('💪 Migration Finished Successfully!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
}

migrate();
