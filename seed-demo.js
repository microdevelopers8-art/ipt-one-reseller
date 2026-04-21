const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function seed() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    const pw = await bcrypt.hash('Reseller@2024!', 12);
    
    await sql.query(`
      INSERT INTO users (name, email, password_hash, role, company_name, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET password_hash = $3, is_active = true
    `, ['Demo Reseller', 'reseller@iptone.co.za', pw, 'reseller', 'Alpha IT Solutions', '082 123 4567', true]);

    
    console.log('SUCCESS: Demo reseller created!');
  } catch (error) {
    console.error('FAILED:', error);
  }
}

seed();
