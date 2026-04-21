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
    const { title, message, type, expires_at, is_active } = await request.json();

    const rows = await query(
      `UPDATE notifications SET 
        title = $1, 
        message = $2, 
        type = $3, 
        expires_at = $4, 
        is_active = $5 
       WHERE id = $6 RETURNING *`,
      [title, message, type, expires_at || null, is_active, id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ notification: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await query('DELETE FROM notifications WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
