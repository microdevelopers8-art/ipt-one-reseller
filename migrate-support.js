const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('🚀 Building Support Ticketing Infrastructure...');
  
  try {
    // 1. Create Tickets Table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        ticket_number VARCHAR(20) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
        priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
        category VARCHAR(50) DEFAULT 'general', -- 'billing', 'technical', 'sales', 'general'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created support_tickets table');

    // 2. Create Messages Table (The Thread)
    await sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created support_messages table');

    console.log('💪 Support System Ready!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
}

migrate();
