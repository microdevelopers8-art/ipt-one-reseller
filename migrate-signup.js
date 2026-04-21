const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    // Add columns if they don't exist
    await sql.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS mobile VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50),
      ADD COLUMN IF NOT EXISTS street_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS unit_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS building VARCHAR(255),
      ADD COLUMN IF NOT EXISTS suburb VARCHAR(255),
      ADD COLUMN IF NOT EXISTS city VARCHAR(255),
      ADD COLUMN IF NOT EXISTS province VARCHAR(100);
    `);

    // Ensure account_number exists (retrying from previous cancelled call)
    await sql.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(50) UNIQUE;
    `);

    console.log('SUCCESS: Users table altered for updated signup requirements!');
  } catch (error) {
    console.error('FAILED:', error);
  }
}

migrate();
