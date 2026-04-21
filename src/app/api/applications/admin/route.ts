import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Return everyone whose application_status is not 'approved'
    const rows = await query("SELECT id, name, email, company_name, phone, application_status, application_details, application_messages, created_at FROM users WHERE role = 'reseller' AND application_status != 'approved' ORDER BY created_at DESC");
    return NextResponse.json({ applications: rows });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Update status or add message
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, message } = await request.json();

    // Get current user data
    const rows = await query('SELECT application_messages FROM users WHERE id = $1', [id]);
    const user = (rows as any[])[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const messages = user.application_messages || [];

    if (message && message.trim() !== '') {
      messages.push({
        sender: 'admin',
        text: message.trim(),
        timestamp: new Date().toISOString()
      });
    }

    // Only update and generate account_number if approved and it doesn't already have one
    if (status === 'approved') {
      const dbUser = await query('SELECT account_number FROM users WHERE id = $1', [id]);
      let accountNum = (dbUser as any[])[0]?.account_number;
      
      if (!accountNum) {
        let isUnique = false;
        while (!isUnique) {
          const numericCore = Math.floor(10000000 + Math.random() * 90000000).toString();
          accountNum = `IPT-${numericCore}`;
          
          const existing = await query('SELECT id FROM users WHERE account_number = $1', [accountNum]);
          if ((existing as any[]).length === 0) {
            isUnique = true;
          }
        }
      }

      await query(
        `UPDATE users SET application_status = $1, application_messages = $2, is_active = $3, account_number = $4 WHERE id = $5`,
        [status, JSON.stringify(messages), true, accountNum, id]
      );
    } else {
      await query(
        `UPDATE users SET application_status = $1, application_messages = $2, is_active = $3 WHERE id = $4`,
        [status, JSON.stringify(messages), true, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
