import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    let sql = 'SELECT * FROM notifications';
    const params: any[] = [];
    
    if (activeOnly) {
      sql += ' WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const rows = await query(sql, params);
    return NextResponse.json({ notifications: rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, message, type, expires_at, is_active } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO notifications (title, message, type, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, message, type || 'info', expires_at || null, is_active !== undefined ? is_active : true]
    );

    return NextResponse.json({ notification: rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
