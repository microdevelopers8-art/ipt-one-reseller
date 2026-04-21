import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { is_suspended, suspension_reason } = await request.json();

    await query(
      `UPDATE users SET is_suspended = $1, suspension_reason = $2 WHERE id = $3`,
      [is_suspended, suspension_reason || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update suspension status' }, { status: 500 });
  }
}
