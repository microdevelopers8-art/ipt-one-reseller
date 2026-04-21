'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    mobile: '',
    whatsapp: '',
    company_registration: '',
    vat_number: '',
    street_number: '',
    unit_number: '',
    building: '',
    suburb: '',
    city: '',
    province: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
        <div className="login-box animate-fade-in" style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Application Submitted</h2>
          <p className="text-secondary mb-8" style={{ fontSize: '18px', lineHeight: 1.6 }}>
            Thank you for applying to be an IPT One Telecoms reseller. Your application is currently pending review by our administration team.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg w-full" style={{ padding: '16px' }}>Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Pane - Image Background */}
      <div style={{
        flex: 1,
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        backgroundColor: 'var(--brand-secondary)',
        backgroundImage: 'linear-gradient(135deg, rgba(0, 163, 255, 0.9) 0%, rgba(9, 9, 11, 0.8) 100%), url("https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }} className="desktop-only-flex">
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <img src="/logo.png" alt="IPT One Telecoms" style={{ width: '100%', maxWidth: '180px', height: 'auto', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', lineHeight: 1.2 }}>Partner with Excellence.</h1>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '500px', lineHeight: 1.6 }}>
          Join IPT One's reseller network to gain access to reseller telecommunication solutions, dynamic provisioning, and dedicated support.
        </p>
      </div>

      {/* Right Pane - Form */}
      <div style={{
        flex: 1.2,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 20px',
        backgroundColor: 'var(--bg-main)',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '520px' }} className="animate-fade-in">
          
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>Become a Reseller</h2>
          <p className="text-secondary" style={{ marginBottom: '24px', fontSize: '14px' }}>Submit your details to apply for wholesale access.</p>

          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded mb-6 text-sm border border-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Account Info */}
            <div>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.4px' }}>Login Details</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Password *</label>
                <input type="password" name="password" className="form-input" minLength={6} required value={formData.password} onChange={handleChange} />
              </div>
            </div>

            {/* Business Info */}
            <div>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.4px' }}>Business Details</h3>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input type="text" name="company_name" className="form-input" required value={formData.company_name} onChange={handleChange} />
              </div>
              <div className="grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">Company Reg</label>
                  <input type="text" name="company_registration" className="form-input" value={formData.company_registration} onChange={handleChange} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">VAT Number</label>
                  <input type="text" name="vat_number" className="form-input" value={formData.vat_number} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.4px' }}>Contact</h3>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input type="text" name="mobile" className="form-input" required value={formData.mobile} onChange={handleChange} placeholder="Required" />
              </div>
              <div className="grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">WhatsApp</label>
                  <input type="text" name="whatsapp" className="form-input" value={formData.whatsapp} onChange={handleChange} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Landline</label>
                  <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Physical Address */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.4px' }}>Address (Optional)</h3>
              <div className="grid-2">
                <div className="form-group mb-2">
                  <label className="form-label">Street</label>
                  <input type="text" name="street_number" className="form-input" value={formData.street_number} onChange={handleChange} />
                </div>
                <div className="form-group mb-2">
                  <label className="form-label">City</label>
                  <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">Suburb</label>
                  <input type="text" name="suburb" className="form-input" value={formData.suburb} onChange={handleChange} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Province</label>
                  <select name="province" className="form-select" value={formData.province} onChange={handleChange}>
                    <option value="" disabled>Select Province</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="North West">North West</option>
                    <option value="Western Cape">Western Cape</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ padding: '12px 16px', fontSize: '16px', marginTop: '12px' }}
            >
              {loading ? 'Submitting...' : 'Apply Now'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Have an account? <Link href="/login" style={{ color: 'var(--brand-secondary)', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 900px) {
          .desktop-only-flex {
            display: flex !important;
          }
        }
      `}} />
    </div>
  );
}
