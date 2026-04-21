const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('🚀 Updating Address Schema...');
  
  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS street_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)
    `;
    console.log('✅ Added street_name and postal_code to users table');
    console.log('💪 Migration Finished Successfully!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
}

migrate();
