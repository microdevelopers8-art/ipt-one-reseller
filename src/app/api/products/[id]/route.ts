import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      catalog_id, category_id, name, sku, description, short_description,
      price, cost_price, reseller_price, unit, is_recurring, billing_cycle,
      stock_quantity, specifications, sort_order, is_active, requires_dialing_code, images
    } = body;

    await query(
      `UPDATE products SET 
        catalog_id = $1, category_id = $2, name = $3, sku = $4, description = $5, 
        short_description = $6, price = $7, cost_price = $8, reseller_price = $9, 
        unit = $10, is_recurring = $11, billing_cycle = $12, stock_quantity = $13, 
        specifications = $14, sort_order = $15, is_active = $16, 
        requires_dialing_code = $17, images = $18, updated_at = NOW()
       WHERE id = $19`,
      [
        catalog_id, category_id || null, name, sku, description, short_description,
        price, cost_price, reseller_price, unit, is_recurring, billing_cycle,
        stock_quantity, JSON.stringify(specifications || {}), sort_order, is_active,
        requires_dialing_code || false, JSON.stringify(images || []), id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete / deactivate
    await query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
