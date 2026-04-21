import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import Link from 'next/link';

export default async function ApplicationStatusPage() {
  const session = await getSession();

  if (!session || session.role !== 'reseller') {
    redirect('/login');
  }

  if (session.application_status === 'approved') {
    redirect('/reseller/dashboard');
  }

  // Fetch latest application data
  const rows = await query('SELECT application_status, application_details, application_messages FROM users WHERE id = $1', [session.id]);
  const appData = (rows as any[])[0] || {};
  const status = appData.application_status || 'pending';
  const messages = appData.application_messages || [];

  return (
    <div className="login-container" style={{ padding: '40px 20px', minHeight: '100vh', height: 'auto', alignItems: 'flex-start' }}>
      <div className="login-box animate-fade-in" style={{ maxWidth: '800px', width: '100%', marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="login-logo" style={{ margin: 0 }}>
            <img src="/logo.png" alt="IPT One Telecoms" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn btn-sm btn-secondary">Logout</button>
          </form>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Application Status</h2>
          
          {status === 'pending' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--warning-bg)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '32px' }}>⏳</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--warning)', marginBottom: '8px' }}>Application Under Review</h3>
                <p className="text-secondary" style={{ lineHeight: 1.5 }}>
                  Your application to become a reseller is currently being reviewed by our administrators. We will get back to you shortly. You can check back here for updates.
                </p>
              </div>
            </div>
          )}

          {status === 'info_requested' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--info-bg)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '32px' }}>📝</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--info)', marginBottom: '8px' }}>Additional Information Requested</h3>
                <p className="text-secondary" style={{ lineHeight: 1.5 }}>
                  The administrators have requested additional information regarding your application. Please see the messages below and reply with the required details.
                </p>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--danger-bg)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '32px' }}>❌</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--danger)', marginBottom: '8px' }}>Application Declined</h3>
                <p className="text-secondary" style={{ lineHeight: 1.5 }}>
                  Unfortunately, your application to become a reseller has been declined. Please refer to any notes below for more context.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Communication History</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {messages.length === 0 ? (
              <p className="text-muted text-center py-4">No messages yet.</p>
            ) : (
              messages.map((msg: any, i: number) => (
                <div key={i} style={{ 
                  background: msg.sender === 'admin' ? 'var(--bg-elevated)' : 'var(--brand-secondary)', 
                  color: msg.sender === 'admin' ? 'var(--text-primary)' : '#fff',
                  alignSelf: msg.sender === 'admin' ? 'flex-start' : 'flex-end',
                  padding: '16px', 
                  borderRadius: '12px',
                  maxWidth: '80%',
                  border: msg.sender === 'admin' ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                    {msg.sender === 'admin' ? 'Administrator' : 'You'} • {new Date(msg.timestamp).toLocaleString()}
                  </div>
                  <p style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {status !== 'rejected' && (
            <form action={`/api/applications/message`} method="POST">
               <textarea 
                  name="message"
                  className="form-textarea mb-4" 
                  placeholder="Reply with additional information or questions..." 
                  required
                  rows={4}
                ></textarea>
                <div style={{ textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary">Send Message</button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
