import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { initializeDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Explicitly fetch is_active
    const rows = await query(
      'SELECT id, name, email, password_hash, role, company_name, is_active, application_status FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = rows[0] as any;

    // RIGOROUS DEACTIVATION CHECK
    // Logic: If is_active is false, null, or undefined, then access is denied.
    if (user.is_active === false || user.is_active === null || user.is_active === undefined) {
      return NextResponse.json({ 
        error: 'Access Denied',
        message: 'Access Denied, Contact IPT One Admin - admin@iptone.co.za'
      }, { status: 403 });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      application_status: user.application_status,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false, // TODO: set to true once HTTPS/SSL is active on the domain
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
