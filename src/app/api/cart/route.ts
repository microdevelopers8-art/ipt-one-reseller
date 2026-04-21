import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const items = await query(
      `SELECT ci.*, p.name as product_name, p.sku, p.reseller_price as unit_price,
        p.is_recurring, p.billing_cycle, p.short_description,
        c.name as catalog_name, c.color as catalog_color,
        cat.name as category_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN catalogs c ON c.id = p.catalog_id
       LEFT JOIN categories cat ON cat.id = p.category_id
       WHERE ci.reseller_id = $1 AND p.is_active = true
       ORDER BY ci.created_at DESC`,
      [session.id]
    );

    const total = items.reduce((sum, item) => {
      const i = item as { quantity: number; unit_price: number };
      return sum + (i.quantity * Number(i.unit_price));
    }, 0);

    return NextResponse.json({ items, total, count: items.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { product_id, quantity, selected_options } = await request.json();
    if (!product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 400 });

    await query(
      `INSERT INTO cart_items (reseller_id, product_id, quantity, selected_options)
       VALUES ($1, $2, $3, $4)`,
      [session.id, product_id, quantity || 1, JSON.stringify(selected_options || {})]
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (productId) {
      await query('DELETE FROM cart_items WHERE reseller_id = $1 AND product_id = $2', [session.id, productId]);
    } else {
      await query('DELETE FROM cart_items WHERE reseller_id = $1', [session.id]);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { product_id, quantity } = await request.json();
    if (!product_id || !quantity) return NextResponse.json({ error: 'product_id and quantity required' }, { status: 400 });

    if (quantity <= 0) {
      await query('DELETE FROM cart_items WHERE reseller_id = $1 AND product_id = $2', [session.id, product_id]);
    } else {
      await query('UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE reseller_id = $2 AND product_id = $3', [quantity, session.id, product_id]);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
