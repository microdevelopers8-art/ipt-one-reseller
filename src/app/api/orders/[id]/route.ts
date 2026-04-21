import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const rows = await query(
      `SELECT o.*, u.name as reseller_name, u.email as reseller_email, u.company_name as reseller_company, u.phone as reseller_phone
       FROM orders o JOIN users u ON u.id = o.reseller_id
       WHERE o.id = $1`,
      [id]
    );
    if (!rows.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const order = rows[0] as { reseller_id: string };
    if (session.role === 'reseller' && order.reseller_id !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const items = await query(
      `SELECT oi.*, c.name as catalog_name, c.color as catalog_color, cat.name as category_name
       FROM order_items oi
       LEFT JOIN catalogs c ON c.id = oi.catalog_id
       LEFT JOIN categories cat ON cat.id = oi.category_id
       WHERE oi.order_id = $1`,
      [id]
    );

    return NextResponse.json({ order: rows[0], items });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { status, notes, internal_notes } = body;

    // Resellers can only cancel pending orders
    if (session.role === 'reseller') {
      if (status && status !== 'cancelled') {
        return NextResponse.json({ error: 'Resellers can only cancel orders' }, { status: 403 });
      }
      const existing = await query('SELECT status, reseller_id FROM orders WHERE id = $1', [id]);
      if (!existing.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      const ord = existing[0] as { status: string; reseller_id: string };
      if (ord.reseller_id !== session.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      if (ord.status !== 'pending') return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
    }

    const rows = await query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes),
        internal_notes = COALESCE($3, internal_notes),
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, notes, internal_notes, id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
