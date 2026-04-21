const { neon } = require('@neondatabase/serverless');

async function checkUsers() {
  const sql = neon('postgresql://neondb_owner:npg_WbvBR1ljOCK3@ep-weathered-rain-abdu4nac-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  const users = await sql`SELECT name, email, role, application_status, account_number, is_active FROM users`;
  console.log('Users:', users);
}

checkUsers();