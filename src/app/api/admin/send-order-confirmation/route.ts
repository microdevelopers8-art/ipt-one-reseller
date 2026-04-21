import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { order_id, send_confirmation = true } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Fetch the order
    const orders = await query(
      'SELECT * FROM orders WHERE id = $1',
      [order_id]
    );

    if (!orders[0]) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    if (session.role === 'reseller' && order.reseller_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!order.customer_id) {
      return NextResponse.json({ error: 'Order has no customer attached' }, { status: 400 });
    }

    // Fetch customer details
    const customers = await query(
      'SELECT id, name, company_name, email FROM reseller_customers WHERE id = $1',
      [order.customer_id]
    );

    if (!customers[0]) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customers[0];

    if (!customer.email) {
      return NextResponse.json({ error: 'Customer does not have an email address' }, { status: 400 });
    }

    const orderItems = await query(
      'SELECT product_name, quantity, total_price FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
      [order_id]
    );

    let emailResult = { success: false };
    if (send_confirmation) {
      emailResult = await sendOrderConfirmation(
        {
          order_number: order.order_number,
          total_amount: order.total_amount,
          items: orderItems,
        },
        {
        email: customer.email,
        name: customer.name,
          company_name: customer.company_name,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: send_confirmation ? `Order confirmation email sent: ${emailResult.success}` : 'Order processed',
      order_id,
      email_sent: emailResult.success,
    });
  } catch (error) {
    console.error('Send order confirmation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
