import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;

export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Optional: console.log('executed query', { text, duration, rows: res.rowCount });
    return res.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
