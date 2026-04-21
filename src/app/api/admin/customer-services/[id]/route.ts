import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { credentials } = await request.json();

    const rows = await query(
      'UPDATE customer_services SET credentials = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [credentials, id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    return NextResponse.json({ service: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
