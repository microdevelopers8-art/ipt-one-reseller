import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `IPT-${year}${month}${day}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const resellerId = searchParams.get('reseller_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `SELECT o.*, u.name as reseller_name, u.email as reseller_email, u.company_name as reseller_company, rc.name as customer_name, rc.company_name as customer_company
     FROM orders o
     JOIN users u ON u.id = o.reseller_id
     LEFT JOIN reseller_customers rc ON rc.id = o.customer_id
     WHERE 1=1`;
    const params: unknown[] = [];

    if (session.role === 'reseller') {
      params.push(session.id); sql += ` AND o.reseller_id = $${params.length}`;
    } else if (resellerId) {
      params.push(resellerId); sql += ` AND o.reseller_id = $${params.length}`;
    }

    if (status) { params.push(status); sql += ` AND o.status = $${params.length}`; }

    const countSql = sql.replace(/SELECT o\.\*, [\s\S]*?FROM orders/, 'SELECT COUNT(*) FROM orders');
    const countRows = await query(countSql, params);
    const total = parseInt((countRows[0] as { count: string }).count);

    params.push(limit); sql += ` ORDER BY o.created_at DESC LIMIT $${params.length}`;
    params.push(offset); sql += ` OFFSET $${params.length}`;

    const orders = await query(sql, params);
    return NextResponse.json({ orders, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resellerId = session.role === 'reseller' ? session.id : null;
    
    // SUSPENSION CHECK
    if (resellerId) {
      const userRows = await query('SELECT is_suspended, suspension_reason FROM users WHERE id = $1', [resellerId]);
      const user = userRows[0] as { is_suspended: boolean, suspension_reason: string };
      if (user?.is_suspended) {
        return NextResponse.json({ 
          error: 'Order Blocked', 
          message: `Your account is currently suspended. Reason: ${user.suspension_reason || 'Contact support.'}` 
        }, { status: 403 });
      }
    }

    const body = await request.json();
    const { items, notes, customer_id } = body;
    const finalResellerId = resellerId || body.reseller_id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
    }

    if (!customer_id) {
       return NextResponse.json({ error: 'A customer must be selected to place an order.' }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const productRows = await query(
        'SELECT * FROM products WHERE id = $1 AND is_active = true',
        [item.product_id]
      );
      if (!productRows.length) return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
      
      const product = productRows[0] as any;
      const unitPrice = session.role === 'reseller' ? Number(product.reseller_price) : Number(product.price);
      const qty = parseInt(item.quantity) || 1;
      const totalPrice = unitPrice * qty;
      subtotal += totalPrice;

      orderItems.push({
        product_id: product.id,
        catalog_id: product.catalog_id,
        category_id: product.category_id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        is_recurring: product.is_recurring,
        billing_cycle: product.billing_cycle,
        notes: item.notes,
        selected_options: item.selected_options
      });
    }

    // TAX REMOVAL: IPT One does not charge VAT
    const taxAmount = 0; 
    const totalAmount = subtotal;
    const orderNumber = generateOrderNumber();

    const orderRows = await query(
      `INSERT INTO orders (order_number, reseller_id, customer_id, status, notes, subtotal, tax_amount, total_amount)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7) RETURNING *`,
      [orderNumber, finalResellerId, customer_id, notes, subtotal, taxAmount, totalAmount]
    );

    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, catalog_id, category_id, product_name, product_sku, quantity, unit_price, total_price, is_recurring, billing_cycle, notes, selected_options)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [orderRows[0].id, item.product_id, item.catalog_id, item.category_id, item.product_name, item.product_sku, item.quantity, item.unit_price, item.total_price, item.is_recurring, item.billing_cycle, item.notes, JSON.stringify(item.selected_options || {})]
      );
    }

    if (session.role === 'reseller') {
      await query('DELETE FROM cart_items WHERE reseller_id = $1', [session.id]);
    }

    return NextResponse.json({ order: orderRows[0], order_number: orderNumber }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
