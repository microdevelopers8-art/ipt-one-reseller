import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const messages = await query(
      `SELECT m.*, u.name as sender_name, u.role as sender_role
       FROM support_messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const isAdmin = ['super_admin', 'admin'].includes(session.role);

    const rows = await query(
      `INSERT INTO support_messages (ticket_id, sender_id, message, is_admin)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, session.id, message, isAdmin]
    );

    // Update ticket updated_at and potentially status if admin replies
    await query(
      `UPDATE support_tickets SET updated_at = NOW() ${isAdmin ? ", status = 'in_progress'" : ""} WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ message: rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
