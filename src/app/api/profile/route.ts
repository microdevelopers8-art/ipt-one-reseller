import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await query(
      `SELECT id, name, email, role, company_name, phone, mobile, whatsapp,
              street_number, street_name, unit_number, building, suburb, city, province, postal_code,
              account_number, is_active, created_at, application_status, application_details
       FROM users WHERE id = $1`,
      [session.id]
    );

    if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      name, company_name, phone, mobile, whatsapp,
      street_number, street_name, unit_number, building, suburb, city, province, postal_code,
      currentPassword, newPassword 
    } = body;

    // Fetch user for current password check if changing password
    if (newPassword) {
      const userRows = await query('SELECT password_hash FROM users WHERE id = $1', [session.id]);
      const user = userRows[0] as any;
      
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
         return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, session.id]);
    }

    await query(
      `UPDATE users SET 
        name = $1, company_name = $2, phone = $3, mobile = $4, whatsapp = $5,
        street_number = $6, street_name = $7, unit_number = $8, building = $9, 
        suburb = $10, city = $11, province = $12, postal_code = $13,
        updated_at = NOW() 
       WHERE id = $14`,
      [
        name, company_name, phone, mobile, whatsapp,
        street_number, street_name, unit_number, building, 
        suburb, city, province, postal_code,
        session.id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
