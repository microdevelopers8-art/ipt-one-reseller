import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendTicketNotification } from '@/lib/email';

function generateTicketNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let sql = `
      SELECT t.*, u.company_name as reseller_company, u.name as reseller_name
      FROM support_tickets t
      JOIN users u ON u.id = t.reseller_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (session.role === 'reseller') {
      params.push(session.id);
      sql += ` AND t.reseller_id = $${params.length}`;
    }

    sql += ` ORDER BY t.created_at DESC`;
    const tickets = await query(sql, params);
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject, description, category, priority } = await request.json();
    if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });

    const ticketNumber = generateTicketNumber();

    const rows = await query(
      `INSERT INTO support_tickets (reseller_id, ticket_number, subject, description, category, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'open') RETURNING *`,
      [session.id, ticketNumber, subject, description, category || 'general', priority || 'medium']
    );

    const ticket = rows[0];

    // Add initial message
    await query(
      `INSERT INTO support_messages (ticket_id, sender_id, message, is_admin)
       VALUES ($1, $2, $3, false)`,
      [ticket.id, session.id, description]
    );

    // Fetch reseller info for email
    const resellerRows = await query('SELECT company_name, name FROM users WHERE id = $1', [session.id]);
    const reseller = resellerRows[0];

    // SEND NOTIFICATION
    await sendTicketNotification(ticket, reseller);

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('POST /api/support/tickets error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
