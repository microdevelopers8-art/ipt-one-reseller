import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role === 'reseller') {
      const [orders, pendingOrders, cartItems] = await Promise.all([
        query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total FROM orders WHERE reseller_id = $1', [session.id]),
        query("SELECT COUNT(*) as count FROM orders WHERE reseller_id = $1 AND status = 'pending'", [session.id]),
        query('SELECT COUNT(*) as count FROM cart_items WHERE reseller_id = $1', [session.id]),
      ]);
      const recentOrders = await query(
        "SELECT id, order_number, status, total_amount, created_at FROM orders WHERE reseller_id = $1 ORDER BY created_at DESC LIMIT 5",
        [session.id]
      );
      const userRows = await query('SELECT account_number, is_suspended, suspension_reason FROM users WHERE id = $1', [session.id]);
      const userData = (userRows[0] as any) || {};

      return NextResponse.json({
        total_orders: (orders[0] as { count: string }).count,
        total_spent: (orders[0] as { total: string }).total,
        pending_orders: (pendingOrders[0] as { count: string }).count,
        cart_items: (cartItems[0] as { count: string }).count,
        recent_orders: recentOrders,
        account_number: userData.account_number,
        is_suspended: userData.is_suspended,
        suspension_reason: userData.suspension_reason
      });
    }

    const [users, resellers, orders, products, catalogs, categories] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE is_active = true"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'reseller' AND is_active = true"),
      query("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total FROM orders"),
      query("SELECT COUNT(*) as count FROM products WHERE is_active = true"),
      query("SELECT COUNT(*) as count FROM catalogs WHERE is_active = true"),
      query("SELECT COUNT(*) as count FROM categories WHERE is_active = true"),
    ]);

    const pendingOrders = await query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const monthlyRevenue = await query(
      "SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE created_at >= date_trunc('month', NOW())"
    );
    const recentOrders = await query(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
        u.name as reseller_name, u.company_name as reseller_company
       FROM orders o JOIN users u ON u.id = o.reseller_id
       ORDER BY o.created_at DESC LIMIT 8`
    );
    const ordersByStatus = await query(
      "SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC"
    );

    return NextResponse.json({
      total_users: (users[0] as { count: string }).count,
      total_resellers: (resellers[0] as { count: string }).count,
      total_orders: (orders[0] as { count: string }).count,
      total_revenue: (orders[0] as { total: string }).total,
      total_products: (products[0] as { count: string }).count,
      total_catalogs: (catalogs[0] as { count: string }).count,
      total_categories: (categories[0] as { count: string }).count,
      pending_orders: (pendingOrders[0] as { count: string }).count,
      monthly_revenue: (monthlyRevenue[0] as { total: string }).total,
      recent_orders: recentOrders,
      orders_by_status: ordersByStatus,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
