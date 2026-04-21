import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export async function query(text: string, params?: any[]) {
  if (params && params.length > 0) {
    return sql.query(text, params);
  }
  return sql.query(text);
}
