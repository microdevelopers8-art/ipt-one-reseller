import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    let sql = 'SELECT * FROM dialing_codes';
    const params: any[] = [];
    if (activeOnly) {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY code ASC';
    
    const codes = await query(sql, params);
    return NextResponse.json({ codes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { code, region } = await request.json();
    if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

    const rows = await query(
      'INSERT INTO dialing_codes (code, region) VALUES ($1, $2) RETURNING *',
      [code, region || '']
    );
    return NextResponse.json({ code: rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add code' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await query('DELETE FROM dialing_codes WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
