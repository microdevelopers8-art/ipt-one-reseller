import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { testSMTPConnection, sendAlertEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { type = 'connection', recipient_email } = body;

    if (type === 'connection') {
      const result = await testSMTPConnection();
      return NextResponse.json(result);
    }

    if (type === 'alert') {
      const result = await sendAlertEmail(
        'Test Email from IPT One',
        `This is a test email sent at ${new Date().toISOString()} by user ${session.name}`
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
