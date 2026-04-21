import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'reseller') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify customer belongs to reseller
    const custCheck = await query(`SELECT id FROM reseller_customers WHERE id = $1 AND reseller_id = $2`, [id, session.userId]);
    if (custCheck.length === 0) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const body = await request.json();
    const { product_id, service_name, credentials } = body;

    const rows = await query(
      `INSERT INTO customer_services (customer_id, product_id, service_name, credentials)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, product_id || null, service_name, JSON.stringify(credentials || {})]
    );

    return NextResponse.json({ service: rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
