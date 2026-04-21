const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    await sql.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(50) UNIQUE;
    `);

    // Backfill any existing approved resellers with an account number
    const rows = await sql.query(`SELECT id FROM users WHERE role = 'reseller' AND application_status = 'approved' AND account_number IS NULL`);
    
    for (let i = 0; i < rows.length; i++) {
      const user = rows[i];
      const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
      const accountNum = `IPT-${randomPart}`;
      await sql.query(`UPDATE users SET account_number = $1 WHERE id = $2`, [accountNum, user.id]);
    }

    console.log('SUCCESS: Users table altered for account_number!');
  } catch (error) {
    console.error('FAILED:', error);
  }
}

migrate();
