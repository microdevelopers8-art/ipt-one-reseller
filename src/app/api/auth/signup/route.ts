import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { initializeDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { 
      name, email, password, company_name, phone, mobile, whatsapp, 
      company_registration, vat_number,
      street_number, unit_number, building, suburb, city, province 
    } = body;

    // Validate inputs
    if (!email || !password || !name || !company_name || !mobile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email exists
    const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (emailCheck.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Check if mobile exists
    const mobileCheck = await query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (mobileCheck.length > 0) {
      return NextResponse.json({ error: 'Mobile number already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Address and reg data packaged heavily in application details, but we also save the direct columns
    const applicationDetails = {
      company_registration: company_registration || '',
      vat_number: vat_number || '',
    };

    const rows = await query(
      `INSERT INTO users (
        name, email, password_hash, role, company_name, 
        phone, mobile, whatsapp,
        street_number, unit_number, building, suburb, city, province,
        is_active, application_status, application_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
      [
        name, email.toLowerCase().trim(), passwordHash, 'reseller', company_name, 
        phone || '', mobile, whatsapp || '',
        street_number || '', unit_number || '', building || '', suburb || '', city || '', province || '',
        true, 'pending', JSON.stringify(applicationDetails)
      ]
    );

    return NextResponse.json({ success: true, message: 'Application submitted successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
