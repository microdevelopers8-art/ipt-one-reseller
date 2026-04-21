import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let sql = `SELECT id, name, email, role, company_name, phone, address, 
               is_active, is_suspended, suspension_reason, deactivation_reason,
               account_number, mobile_number, whatsapp_number, street_address,
               suburb, city, province, postal_code, created_at 
               FROM users WHERE 1=1`;
    const params: unknown[] = [];

    if (role) { 
      params.push(role); 
      sql += ` AND role = $${params.length}`; 
      if (role === 'reseller') {
        sql += ` AND application_status = 'approved'`;
      }
    }

    if (search) { 
      params.push(`%${search}%`); 
      sql += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR company_name ILIKE $${params.length} OR account_number ILIKE $${params.length})`; 
    }

    if (status) {
      if (status === 'active') {
        sql += ` AND is_active = true AND is_suspended = false`;
      } else if (status === 'inactive') {
        sql += ` AND is_active = false`;
      } else if (status === 'suspended') {
        sql += ` AND is_suspended = true`;
      }
    }

    sql += ` ORDER BY created_at DESC`;
    const users = await query(sql, params);
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, email, password, role, company_name, phone, address,
      mobile_number, whatsapp_number, street_address, suburb, city, province, postal_code
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const accNo = `IPT-${Math.floor(100000 + Math.random() * 900000)}`;

    const rows = await query(
      `INSERT INTO users (
        name, email, password_hash, role, company_name, phone, address, account_number,
        mobile_number, whatsapp_number, street_address, suburb, city, province, postal_code
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        name, email.toLowerCase().trim(), passwordHash, role || 'reseller', company_name, phone, address, accNo,
        mobile_number, whatsapp_number, street_address, suburb, city, province, postal_code
      ]
    );

    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
