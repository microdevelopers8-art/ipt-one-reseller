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
    const customerId = searchParams.get('customer_id');

    if (!customerId) return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 });

    const services = await query(
      'SELECT id, service_name, credentials, status, details, created_at FROM customer_services WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
