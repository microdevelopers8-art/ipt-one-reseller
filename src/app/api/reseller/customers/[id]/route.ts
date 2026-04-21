import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'reseller') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const custRows = await query(`SELECT * FROM reseller_customers WHERE id = $1 AND reseller_id = $2`, [id, session.userId]);
    if (custRows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const serviceRows = await query(`
      SELECT cs.*, p.name as product_name 
      FROM customer_services cs
      LEFT JOIN products p ON p.id = cs.product_id
      WHERE cs.customer_id = $1
    `, [id]);

    return NextResponse.json({ customer: custRows[0], services: serviceRows });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'reseller') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      name, company_name, email, phone, mobile_number, whatsapp_number,
      street_address, suburb, city, province, postal_code 
    } = body;

    await query(
      `UPDATE reseller_customers SET 
        name = $1, 
        company_name = $2,
        email = $3, 
        phone = $4, 
        mobile_number = $5,
        whatsapp_number = $6,
        street_address = $7,
        suburb = $8,
        city = $9,
        province = $10,
        postal_code = $11,
        updated_at = NOW() 
       WHERE id = $12 AND reseller_id = $13`,
      [
        name, company_name, email, phone, mobile_number, whatsapp_number,
        street_address, suburb, city, province, postal_code, id, session.userId
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'reseller') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await query(`DELETE FROM reseller_customers WHERE id = $1 AND reseller_id = $2`, [id, session.userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
