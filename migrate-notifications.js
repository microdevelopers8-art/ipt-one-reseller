const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    console.log('Creating notifications table...');
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed!', err);
  }
}

migrate();
