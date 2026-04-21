import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.redirect(new URL('/login', request.url));

    const formData = await request.formData();
    const text = formData.get('message') as string;

    if (!text || text.trim() === '') {
      return NextResponse.redirect(new URL('/application?error=Message+is+required', request.url));
    }

    // Get current messages
    const rows = await query('SELECT application_messages FROM users WHERE id = $1', [session.id]);
    const currentMessages = (rows as any[])[0]?.application_messages || [];

    currentMessages.push({
      sender: 'reseller',
      text: text.trim(),
      timestamp: new Date().toISOString()
    });

    await query('UPDATE users SET application_messages = $1 WHERE id = $2', [JSON.stringify(currentMessages), session.id]);

    return NextResponse.redirect(new URL('/application', request.url));
  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.redirect(new URL('/application?error=Server+error', request.url));
  }
}
