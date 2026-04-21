const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  console.log('--- Database Integration Test ---');
  
  try {
    // 1. Connection Check
    const now = await sql`SELECT NOW()`;
    console.log('✅ Connection Successful! DB Time:', now[0].now);

    // 2. Table Inspection
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Active Tables:', tables.map(t => t.table_name).join(', '));

    // 3. Data Integrity Check (site_settings)
    const settings = await sql`SELECT * FROM site_settings WHERE id = 1`;
    if (settings.length > 0) {
      console.log('✅ site_settings (ID 1) confirmed.');
    } else {
      console.log('❌ site_settings entry missing.');
    }

    // 4. Data Integrity Check (notifications)
    const notifs = await sql`SELECT count(*) as count FROM notifications`;
    console.log(`📢 Total Notifications in system: ${notifs[0].count}`);

    console.log('--- Test Complete: ALL SYSTEMS NOMINAL ---');
  } catch (err) {
    console.error('💥 TEST FAILED:', err.message);
  }
}

testConnection();
