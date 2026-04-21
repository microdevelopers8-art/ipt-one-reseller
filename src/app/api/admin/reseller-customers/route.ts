import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const resellerId = searchParams.get('reseller_id');

    if (!resellerId) return NextResponse.json({ error: 'Missing reseller_id' }, { status: 400 });

    const customers = await query(
      'SELECT id, name, email, phone, address, account_number, created_at FROM reseller_customers WHERE reseller_id = $1 ORDER BY created_at DESC',
      [resellerId]
    );

    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
