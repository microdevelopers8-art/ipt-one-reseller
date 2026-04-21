import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { type, items } = await request.json();
    if (!type || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const table = type === 'catalog' ? 'catalogs' : 'categories';
    
    // Perform bulk update in a transaction-like manner (individual queries for simplicity with lib/db)
    await Promise.all(items.map((item: { id: string, sort_order: number }) => {
      return query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [item.sort_order, item.id]);
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
