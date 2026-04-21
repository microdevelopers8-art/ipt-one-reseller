const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    // Add columns for applications
    await sql.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS application_status VARCHAR(50) DEFAULT 'approved',
      ADD COLUMN IF NOT EXISTS application_details JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS application_messages JSONB DEFAULT '[]';
    `);
    
    // For any existing resellers, make sure they are 'approved' so they don't lose access
    await sql.query(`
      UPDATE users SET application_status = 'approved' WHERE application_status IS NULL;
    `);

    console.log('SUCCESS: Users table altered for applications!');
  } catch (error) {
    console.error('FAILED:', error);
  }
}

migrate();
