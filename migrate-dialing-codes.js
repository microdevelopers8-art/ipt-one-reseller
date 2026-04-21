const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('🚀 Starting Dialing Code System Migration...');
  
  try {
    // 1. Create Dialing Codes Table
    await sql`
      CREATE TABLE IF NOT EXISTS dialing_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        region VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Created dialing_codes table');

    // 2. Add flag to products table
    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS requires_dialing_code BOOLEAN DEFAULT false
    `;
    console.log('✅ Added requires_dialing_code flag to products');

    // 3. Seed initial codes
    const codes = [
      '010', '011', '012', '013', '014', '015', '016', '017', '018',
      '021', '022', '023', '027', '028',
      '031', '032', '033', '034', '035', '036', '039',
      '041', '042', '043', '044', '045', '046', '047', '048', '049',
      '051', '053', '054', '056', '057', '058',
      '086', '087'
    ];

    for (const code of codes) {
      await sql`
        INSERT INTO dialing_codes (code) 
        VALUES (${code}) 
        ON CONFLICT (code) DO NOTHING
      `;
    }
    console.log(`✅ Seeded ${codes.length} dialing codes`);

    console.log('💪 Migration Finished Successfully!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
}

migrate();
