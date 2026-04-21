import nodemailer from 'nodemailer';
import { query } from './db';

interface SMTPSettings {
  host: string;
  port: number;
  encryption: 'TLS' | 'SSL' | 'None';
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  recipients: string[];
}

interface EmailTemplate {
  subject: string;
  body: string;
}

interface TemplateSettings {
  approval: EmailTemplate;
  rejection: EmailTemplate;
  new_order: EmailTemplate;
  suspension?: EmailTemplate;
  upgrade_downgrade?: EmailTemplate;
  payment_received?: EmailTemplate;
  support_response?: EmailTemplate;
  password_reset?: EmailTemplate;
}

interface BrandingSettings {
  accent_color?: string;
  secondary_color?: string;
  support_url?: string;
}

interface CompanySettings {
  smtp?: SMTPSettings;
  templates?: TemplateSettings;
  branding?: BrandingSettings;
}

interface SettingsRow {
  smtp?: SMTPSettings | string | null;
  templates?: TemplateSettings | string | null;
  branding?: BrandingSettings | string | null;
}

interface ApplicantEmailData {
  email: string;
  name?: string | null;
  company_name?: string | null;
  account_number?: string | null;
}

interface OrderItemSummary {
  product_name?: string | null;
  quantity?: number | string | null;
  total_price?: number | string | null;
}

interface OrderEmailData {
  order_number?: string | null;
  total_amount?: number | string | null;
  items?: OrderItemSummary[];
}

interface CustomerEmailData {
  email: string;
  name?: string | null;
  company_name?: string | null;
}

interface TicketEmailData {
  ticket_number: string;
  subject: string;
  description: string;
  priority?: string | null;
  category?: string | null;
}

interface ResellerEmailData {
  company_name?: string | null;
  name?: string | null;
}

type EmailResult = { success: true } | { success: false; error: string };

const DEFAULT_SUPPORT_EMAIL = 'support@iptone.co.za';
const DEFAULT_SUPPORT_PHONE = '+27 (0)11 XXX XXXX';
const DEFAULT_SUPPORT_URL = 'https://support.iptone.co.za';
const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iptone.co.za';

function parseStoredValue<T>(value: T | string | null | undefined): T | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }

  return value;
}

async function loadCompanySettings(): Promise<CompanySettings> {
  try {
    const rows = await query('SELECT smtp, templates, branding FROM site_settings WHERE id = 1');
    const row = rows[0] as SettingsRow | undefined;

    if (!row) {
      return {};
    }

    return {
      smtp: parseStoredValue<SMTPSettings>(row.smtp),
      templates: parseStoredValue<TemplateSettings>(row.templates),
      branding: parseStoredValue<BrandingSettings>(row.branding),
    };
  } catch (error) {
    console.error('Error loading company settings:', error);
    return {};
  }
}

async function createTransporter() {
  const settings = await loadCompanySettings();
  const smtp = settings.smtp;

  if (!smtp || !smtp.host || !smtp.username || !smtp.password) {
    console.warn('SMTP settings not configured. Using environment variables.');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.encryption === 'SSL',
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });
}

function interpolateTemplate(template: string, variables: Record<string, string>): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  });

  return result;
}

function formatCurrency(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return 'R0.00';
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
}

function formatOrderItems(items: OrderItemSummary[] | undefined): string {
  if (!items || items.length === 0) {
    return 'No order items listed.';
  }

  return items
    .map((item) => {
      const quantity = Number(item.quantity ?? 1) || 1;
      return `- ${item.product_name || 'Item'} x${quantity} (${formatCurrency(item.total_price)})`;
    })
    .join('\n');
}

async function getUniversalVariables(settings?: CompanySettings): Promise<Record<string, string>> {
  const resolvedSettings = settings ?? (await loadCompanySettings());

  return {
    date: new Date().toLocaleDateString('en-ZA'),
    support_email: resolvedSettings.smtp?.reply_to || DEFAULT_SUPPORT_EMAIL,
    support_phone: DEFAULT_SUPPORT_PHONE,
    support_url: resolvedSettings.branding?.support_url || DEFAULT_SUPPORT_URL,
  };
}

function getBrandColors(settings: CompanySettings) {
  return {
    start: settings.branding?.secondary_color || '#0066CC',
    end: settings.branding?.accent_color || '#00A3FF',
  };
}

function buildEmailHtml(
  title: string,
  body: string,
  colors: { start: string; end: string },
  action?: { href: string; label: string }
) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%); padding: 24px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">${title}</h2>
      </div>
      <div style="padding: 24px; color: #333; line-height: 1.6;">
        ${body.replace(/\n/g, '<br>')}
      </div>
      ${
        action
          ? `<div style="background: #f4f4f4; padding: 16px; text-align: center; border-top: 1px solid #eee;">
        <a href="${action.href}" style="background: ${colors.start}; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">${action.label}</a>
      </div>`
          : ''
      }
    </div>
  `;
}

function getFromAddress(smtp?: SMTPSettings, defaultName = 'IPT One Telecoms') {
  return `"${smtp?.from_name || defaultName}" <${smtp?.from_email || process.env.SMTP_USER || 'noreply@iptone.co.za'}>`;
}

export async function sendApprovalEmail(applicant: ApplicantEmailData): Promise<EmailResult> {
  try {
    const settings = await loadCompanySettings();
    const smtp = settings.smtp;
    const template = settings.templates?.approval;

    if (!template) {
      console.warn('Approval template not configured');
      return { success: false, error: 'Template not configured' };
    }

    const transporter = await createTransporter();
    const universal = await getUniversalVariables(settings);
    const variables = {
      ...universal,
      user_name: applicant.name || 'Valued Partner',
      company_name: applicant.company_name || '',
      account_number: applicant.account_number || 'N/A',
    };

    await transporter.sendMail({
      from: getFromAddress(smtp),
      to: applicant.email,
      replyTo: smtp?.reply_to || DEFAULT_SUPPORT_EMAIL,
      subject: interpolateTemplate(template.subject, variables),
      html: buildEmailHtml(
        'Application Approved',
        interpolateTemplate(template.body, variables),
        getBrandColors(settings),
        {
          href: `${DEFAULT_APP_URL}/login`,
          label: 'Login to Your Account',
        }
      ),
    });

    console.log(`Approval email sent to ${applicant.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendRejectionEmail(applicant: ApplicantEmailData, reason?: string): Promise<EmailResult> {
  try {
    const settings = await loadCompanySettings();
    const smtp = settings.smtp;
    const template = settings.templates?.rejection;

    if (!template) {
      console.warn('Rejection template not configured');
      return { success: false, error: 'Template not configured' };
    }

    const transporter = await createTransporter();
    const universal = await getUniversalVariables(settings);
    const variables = {
      ...universal,
      user_name: applicant.name || 'Valued Partner',
      company_name: applicant.company_name || '',
      rejection_reason: reason || 'Not specified',
    };

    await transporter.sendMail({
      from: getFromAddress(smtp),
      to: applicant.email,
      replyTo: smtp?.reply_to || DEFAULT_SUPPORT_EMAIL,
      subject: interpolateTemplate(template.subject, variables),
      html: buildEmailHtml(
        'Application Update',
        interpolateTemplate(template.body, variables),
        { start: '#dc2626', end: '#ef4444' },
        {
          href: DEFAULT_APP_URL,
          label: 'Contact Support',
        }
      ),
    });

    console.log(`Rejection email sent to ${applicant.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendOrderConfirmation(
  order: OrderEmailData,
  customer: CustomerEmailData
): Promise<EmailResult> {
  try {
    const settings = await loadCompanySettings();
    const smtp = settings.smtp;
    const template = settings.templates?.new_order;

    if (!template) {
      console.warn('New order template not configured');
      return { success: false, error: 'Template not configured' };
    }

    const transporter = await createTransporter();
    const universal = await getUniversalVariables(settings);
    const variables = {
      ...universal,
      user_name: customer.name || 'Valued Customer',
      company_name: customer.company_name || '',
      order_number: order.order_number || 'N/A',
      order_total: formatCurrency(order.total_amount),
      order_items: formatOrderItems(order.items),
    };

    await transporter.sendMail({
      from: getFromAddress(smtp),
      to: customer.email,
      replyTo: smtp?.reply_to || DEFAULT_SUPPORT_EMAIL,
      subject: interpolateTemplate(template.subject, variables),
      html: buildEmailHtml(
        'Order Received',
        interpolateTemplate(template.body, variables),
        getBrandColors(settings),
        {
          href: `${DEFAULT_APP_URL}/reseller/orders`,
          label: 'Track Order',
        }
      ),
    });

    console.log(`Order confirmation email sent to ${customer.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendAlertEmail(subject: string, message: string): Promise<EmailResult> {
  try {
    const settings = await loadCompanySettings();
    const smtp = settings.smtp;
    const recipients = smtp?.recipients || ['admin@iptone.co.za'];
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: getFromAddress(smtp),
      to: recipients.join(','),
      replyTo: smtp?.reply_to || DEFAULT_SUPPORT_EMAIL,
      subject: `[Alert] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #fca5a5; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ff6b35 100%); padding: 24px; color: white;">
            <h2 style="margin: 0; font-size: 20px;">System Alert</h2>
          </div>
          <div style="padding: 24px; color: #333; line-height: 1.6;">
            <strong>Subject:</strong> ${subject}<br><br>
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div style="background: #fef2f2; padding: 16px; border-top: 1px solid #fca5a5; font-size: 12px; color: #666;">
            Timestamp: ${new Date().toISOString()}
          </div>
        </div>
      `,
    });

    console.log(`Alert email sent to ${recipients.length} recipient(s)`);
    return { success: true };
  } catch (error) {
    console.error('Error sending alert email:', error);
    return { success: false, error: String(error) };
  }
}

export async function testSMTPConnection() {
  try {
    const settings = await loadCompanySettings();
    const smtp = settings.smtp;

    if (!smtp || !smtp.host || !smtp.username || !smtp.password) {
      return { success: false, error: 'SMTP settings not configured' };
    }

    const transporter = await createTransporter();
    await transporter.verify();

    console.log('SMTP connection verified successfully');
    return { success: true, message: 'SMTP connection verified successfully' };
  } catch (error) {
    console.error('SMTP verification failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendTicketNotification(
  ticket: TicketEmailData,
  reseller: ResellerEmailData
): Promise<EmailResult> {
  try {
    const settings = await loadCompanySettings();
    const smtp = settings.smtp;
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: getFromAddress(smtp, 'IPT One Support'),
      to: smtp?.recipients?.[0] || DEFAULT_SUPPORT_EMAIL,
      replyTo: smtp?.reply_to || DEFAULT_SUPPORT_EMAIL,
      subject: `[New Ticket] ${ticket.ticket_number}: ${ticket.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, ${getBrandColors(settings).start} 0%, ${getBrandColors(settings).end} 100%); padding: 24px; color: white;">
            <h2 style="margin: 0; font-size: 20px;">New Support Ticket Received</h2>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Ticket Reference: <strong>${ticket.ticket_number}</strong></p>
          </div>
          <div style="padding: 24px; color: #333;">
            <div style="margin-bottom: 20px;">
              <label style="font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase;">Reseller Partner</label>
              <div style="font-size: 16px; margin-top: 4px;"><strong>${reseller.company_name || 'Unknown reseller'}</strong> (${reseller.name || 'Unknown contact'})</div>
            </div>
            <div style="margin-bottom: 20px;">
              <label style="font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase;">Subject</label>
              <div style="font-size: 16px; margin-top: 4px;">${ticket.subject}</div>
            </div>
            <div style="margin-bottom: 24px; background: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid ${settings.branding?.accent_color || '#00A3FF'};">
              <label style="font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase;">Description</label>
              <div style="font-size: 14px; margin-top: 8px; line-height: 1.6;">${ticket.description}</div>
            </div>
            <div style="display: flex; gap: 12px;">
              <div style="background: #eee; padding: 6px 12px; border-radius: 4px; font-size: 12px;"><strong>Priority:</strong> ${ticket.priority || 'Normal'}</div>
              <div style="background: #eee; padding: 6px 12px; border-radius: 4px; font-size: 12px;"><strong>Category:</strong> ${ticket.category || 'General'}</div>
            </div>
          </div>
          <div style="background: #f4f4f4; padding: 16px; text-align: center; border-top: 1px solid #eee;">
            <a href="${DEFAULT_APP_URL}/admin/support" style="background: ${getBrandColors(settings).start}; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View in Helpdesk</a>
          </div>
        </div>
      `,
    });

    console.log(`Ticket notification sent for ${ticket.ticket_number}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending ticket notification:', error);
    return { success: false, error: String(error) };
  }
}
