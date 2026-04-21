import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (session.role === 'reseller' && session.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rows = await query(
      `SELECT id, name, email, role, company_name, phone, address, is_active, 
              deactivation_reason, is_suspended, suspension_reason, account_number, 
              mobile_number, whatsapp_number, street_address, suburb, city, 
              province, postal_code, created_at 
       FROM users WHERE id = $1`,
      [id]
    );
    if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (session.role === 'reseller' && session.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, email, password, company_name, phone, address, 
      is_active, role, deactivation_reason, account_number,
      mobile_number, whatsapp_number, street_address, suburb, city, province, postal_code
    } = body;

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    const sqlParams: any[] = [
      name, email, company_name, phone, address, 
      is_active, role, deactivation_reason, account_number,
      mobile_number, whatsapp_number, street_address, suburb, city, province, postal_code, id
    ];
    let passSql = "";
    if (passwordHash) {
      sqlParams.unshift(passwordHash);
      passSql = "password_hash = $1,";
    }

    const offset = passwordHash ? 1 : 0;

    const rows = await query(
      `UPDATE users SET
        name = COALESCE($${1+offset}, name),
        email = COALESCE($${2+offset}, email),
        ${passSql}
        company_name = COALESCE($${3+offset}, company_name),
        phone = COALESCE($${4+offset}, phone),
        address = COALESCE($${5+offset}, address),
        is_active = COALESCE($${6+offset}, is_active),
        role = COALESCE($${7+offset}, role),
        deactivation_reason = $${8+offset},
        account_number = COALESCE($${9+offset}, account_number),
        mobile_number = COALESCE($${10+offset}, mobile_number),
        whatsapp_number = COALESCE($${11+offset}, whatsapp_number),
        street_address = COALESCE($${12+offset}, street_address),
        suburb = COALESCE($${13+offset}, suburb),
        city = COALESCE($${14+offset}, city),
        province = COALESCE($${15+offset}, province),
        postal_code = COALESCE($${16+offset}, postal_code),
        updated_at = NOW()
       WHERE id = $${17+offset}
       RETURNING *`,
      sqlParams
    );

    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
