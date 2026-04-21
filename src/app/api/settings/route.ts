import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM site_settings WHERE id = 1');
    return NextResponse.json({ settings: rows[0] || {} });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { company_details, branding, banking, smtp, templates, payments } = body;

    const rows = await query(
      `UPDATE site_settings SET 
        company_details = $1,
        branding = $2,
        banking = $3,
        smtp = $4,
        templates = $5,
        payments = $6,
        updated_at = NOW()
       WHERE id = 1 RETURNING *`,
      [
        JSON.stringify(company_details || {}),
        JSON.stringify(branding || {}),
        JSON.stringify(banking || []),
        JSON.stringify(smtp || {}),
        JSON.stringify(templates || {}),
        JSON.stringify(payments || {}),
      ]
    );

    return NextResponse.json({ settings: rows[0] });
  } catch (error) {
    console.error('Save Settings Error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
