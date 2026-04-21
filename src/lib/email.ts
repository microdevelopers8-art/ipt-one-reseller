import nodemailer from 'nodemailer';

// Configure transporter with environment variables (To be set in .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTicketNotification(ticket: any, reseller: any) {
  const mailOptions = {
    from: `"IPT One Support" <${process.env.SMTP_USER || 'noreply@iptone.co.za'}>`,
    to: 'support@iptone.co.za',
    subject: `[New Ticket] ${ticket.ticket_number}: ${ticket.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0066CC 0%, #00A3FF 100%); padding: 24px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">New Support Ticket Received</h2>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Ticket Reference: <strong>${ticket.ticket_number}</strong></p>
        </div>
        <div style="padding: 24px; color: #333;">
          <div style="margin-bottom: 20px;">
            <label style="font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase;">Reseller Partner</label>
            <div style="font-size: 16px; margin-top: 4px;"><strong>${reseller.company_name}</strong> (${reseller.name})</div>
          </div>
          <div style="margin-bottom: 20px;">
            <label style="font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase;">Subject</label>
            <div style="font-size: 16px; margin-top: 4px;">${ticket.subject}</div>
          </div>
          <div style="margin-bottom: 24px; background: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #00A3FF;">
            <label style="font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase;">Description</label>
            <div style="font-size: 14px; margin-top: 8px; line-height: 1.6;">${ticket.description}</div>
          </div>
          <div style="display: flex; gap: 12px;">
             <div style="background: #eee; padding: 6px 12px; border-radius: 4px; font-size: 12px;"><strong>Priority:</strong> ${ticket.priority}</div>
             <div style="background: #eee; padding: 6px 12px; border-radius: 4px; font-size: 12px;"><strong>Category:</strong> ${ticket.category}</div>
          </div>
        </div>
        <div style="background: #f4f4f4; padding: 16px; text-align: center; border-top: 1px solid #eee;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support" style="background: #0066CC; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View in Helpdesk</a>
        </div>
      </div>
    `,
  };

  try {
    // Only send if SMTP_USER is set, otherwise log it
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent for ticket ${ticket.ticket_number}`);
    } else {
      console.log('--- MOCK EMAIL ---');
      console.log('To: support@iptone.co.za');
      console.log('Subject:', mailOptions.subject);
      console.log('Content Summary:', ticket.description.substring(0, 100));
      console.log('--- END MOCK ---');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}
