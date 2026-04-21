const { neon } = require('@neondatabase/serverless');

async function update() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    const res = await sql`
      UPDATE users 
      SET account_number = 'IPT-10008899' 
      WHERE email = 'reseller@iptone.co.za' 
      RETURNING name, account_number
    `;
    console.log('SUCCESS:', res);
  } catch (error) {
    console.error('FAILED:', error);
  }
}

update();
