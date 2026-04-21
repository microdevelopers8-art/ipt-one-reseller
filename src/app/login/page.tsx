'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role === 'super_admin' || data.role === 'admin') {
          router.push('/admin/dashboard');
          router.refresh();
        } else {
          router.push('/reseller/dashboard');
          router.refresh();
        }
      } else {
        if (res.status === 403) {
          setShowAccessDeniedModal(true);
        } else {
          setError(data.error || 'Failed to authenticate');
        }
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #0f1f2e 0%, #1a2d3e 100%)' }}>
      {/* Left Pane - Image Background */}
      <div style={{
        flex: 0.4,
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        backgroundColor: 'var(--brand-primary)',
        backgroundImage: 'linear-gradient(135deg, rgba(0, 102, 204, 0.9) 0%, rgba(0, 163, 255, 0.8) 100%), url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
      }} className="desktop-only-flex">
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', lineHeight: 1.2 }}>Welcome to IPT One Telecoms.</h1>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '500px', lineHeight: 1.6 }}>Portal Access for Authorized Reseller Partners.</p>
      </div>

      {/* Right Pane - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
          <div style={{ marginBottom: '40px' }}>
            <img src="/logo.png" alt="IPT One Telecoms Logo" style={{ maxWidth: '100%', height: 'auto', maxHeight: '120px' }} />
          </div>
          
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Sign in</h2>
          <p className="text-secondary" style={{ marginBottom: '32px' }}>Enter your credentials to access the portal.</p>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '24px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required autoComplete="off" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading}>
              {loading ? 'Validating...' : 'Sign in to Portal'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Don't have an account? <Link href="/signup" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
          </p>
        </div>
      </div>

      {/* ACCESS DENIED POPUP */}
      {showAccessDeniedModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal animate-bounce-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
             <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
             <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--danger)', marginBottom: '12px' }}>Access Denied</h3>
             <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '32px' }}>
               Your account has been deactivated. Please contact the IPT One Administration team for further assistance.
             </p>
             <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '32px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Email:</span>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>admin@iptone.co.za</div>
             </div>
             <button className="btn btn-secondary w-full" onClick={() => setShowAccessDeniedModal(false)}>Close Message</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 900px) { .desktop-only-flex { display: flex !important; } }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
      `}} />
    </div>
  );
}
