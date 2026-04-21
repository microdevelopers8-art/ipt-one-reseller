const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('🚀 Updating Cart & Order schema for Custom Options...');
  
  try {
    // Add selected_options to cart_items
    await sql`
      ALTER TABLE cart_items 
      ADD COLUMN IF NOT EXISTS selected_options JSONB DEFAULT '{}'
    `;
    console.log('✅ Added selected_options to cart_items');

    // Add selected_options to order_items
    await sql`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS selected_options JSONB DEFAULT '{}'
    `;
    console.log('✅ Added selected_options to order_items');

    console.log('💪 Migration Finished Successfully!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
}

migrate();
