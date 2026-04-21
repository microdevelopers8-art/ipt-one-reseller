import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    let sqlQuery = `
      SELECT i.*, 
             u.name as reseller_name, 
             u.company_name as reseller_company,
             o.order_number
      FROM invoices i
      JOIN users u ON i.reseller_id = u.id
      JOIN orders o ON i.order_id = o.id
    `;
    const params: any[] = [];

    if (session.role === 'reseller') {
      params.push(session.id);
      sqlQuery += ` WHERE i.reseller_id = $1`;
      if (status) {
        params.push(status);
        sqlQuery += ` AND i.status = $2`;
      }
    } else {
      if (status) {
        params.push(status);
        sqlQuery += ` WHERE i.status = $1`;
      }
    }

    sqlQuery += ` ORDER BY i.created_at DESC`;

    const result = await query(sqlQuery, params);
    return NextResponse.json({ invoices: result });
  } catch (error: any) {
    console.error('Invoices GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
