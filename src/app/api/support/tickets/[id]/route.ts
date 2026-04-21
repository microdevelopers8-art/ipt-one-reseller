import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await query(
      `SELECT t.*, u.company_name as reseller_company, u.name as reseller_name, u.email as reseller_email
       FROM support_tickets t
       JOIN users u ON u.id = t.reseller_id
       WHERE t.id = $1`,
      [id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const ticket = rows[0];
    // Check security
    if (session.role === 'reseller' && ticket.reseller_id !== session.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { status, priority, category } = await request.json();

    // Security check - resellers can only close their own tickets
    const ticketRows = await query('SELECT reseller_id FROM support_tickets WHERE id = $1', [id]);
    if (!ticketRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const ticket = ticketRows[0];

    if (session.role === 'reseller') {
       if (ticket.reseller_id !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       if (status && status !== 'closed') return NextResponse.json({ error: 'Resellers can only close tickets' }, { status: 403 });
    }

    await query(
      `UPDATE support_tickets SET 
        status = COALESCE($1, status),
        priority = COALESCE($2, priority),
        category = COALESCE($3, category),
        updated_at = NOW()
       WHERE id = $4`,
      [status, priority, category, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
