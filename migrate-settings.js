const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    console.log('Creating site_settings table...');
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        company_details JSONB DEFAULT '{}',
        branding JSONB DEFAULT '{}',
        banking JSONB DEFAULT '[]',
        smtp JSONB DEFAULT '{}',
        templates JSONB DEFAULT '{}',
        payments JSONB DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT one_row CHECK (id = 1)
      );
    `);

    // Insert initial empty row if not exists
    await sql.query(`
      INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed!', err);
  }
}

migrate();
