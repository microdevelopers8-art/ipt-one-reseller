const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('🚀 Starting Customer Manager Migration...');
  
  try {
    // 1. Create Customers Table
    await sql`
      CREATE TABLE IF NOT EXISTS reseller_customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reseller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        account_number VARCHAR(50) UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Created reseller_customers table');

    // 2. Create Customer Services Table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES reseller_customers(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        service_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        credentials JSONB DEFAULT '{}',
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Created customer_services table');

    console.log('💪 Migration Finished Successfully!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
}

migrate();
