import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { application_id, status, rejection_reason } = body;

    if (!application_id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Fetch the application
    const applications = await query(
      'SELECT * FROM applications WHERE id = $1',
      [application_id]
    );

    if (!applications[0]) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = applications[0];

    // Generate account number if approving
    let account_number = null;
    if (status === 'approved') {
      account_number = `ACC${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Update application status
    await query(
      'UPDATE applications SET status = $1, processed_by = $2, processed_at = NOW(), account_number = $3 WHERE id = $4',
      [status, session.id, account_number, application_id]
    );

    // Send appropriate email
    let emailResult;
    if (status === 'approved') {
      emailResult = await sendApprovalEmail({
        email: application.email,
        name: application.name,
        company_name: application.company_name,
        account_number: account_number,
      });
    } else {
      emailResult = await sendRejectionEmail(
        {
          email: application.email,
          name: application.name,
          company_name: application.company_name,
        },
        rejection_reason
      );
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status}. Email sent: ${emailResult.success}`,
      application: {
        id: application_id,
        status,
        account_number,
      },
    });
  } catch (error) {
    console.error('Process application error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
