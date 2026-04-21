import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = `SELECT * FROM reseller_customers WHERE reseller_id = $1`;
    const params: any[] = [session.userId];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR company_name ILIKE $${params.length} OR email ILIKE $${params.length} OR account_number ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC`;
    const customers = await query(sql, params);

    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, company_name, email, phone, mobile_number, whatsapp_number,
      street_address, suburb, city, province, postal_code 
    } = body;

    const accNum = `CUST-${Math.floor(100000 + Math.random() * 899999)}`;

    const rows = await query(
      `INSERT INTO reseller_customers (
        reseller_id, name, company_name, email, phone, mobile_number, whatsapp_number, 
        street_address, suburb, city, province, postal_code, account_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        session.userId, name, company_name, email, phone, mobile_number, whatsapp_number,
        street_address, suburb, city, province, postal_code, accNum
      ]
    );

    return NextResponse.json({ customer: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reseller/customers error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
