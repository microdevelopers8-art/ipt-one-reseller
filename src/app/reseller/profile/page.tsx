'use client';

import { useEffect, useState } from 'react';

export default function ResellerProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    mobile: '',
    whatsapp: '',
    // Address Fields
    street_number: '',
    street_name: '',
    unit_number: '',
    building: '',
    suburb: '',
    city: '',
    province: '',
    postal_code: '',
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setFormData({
          ...formData,
          name: data.user.name || '',
          company_name: data.user.company_name || '',
          phone: data.user.phone || '',
          mobile: data.user.mobile || '',
          whatsapp: data.user.whatsapp || 'None',
          street_number: data.user.street_number || '',
          street_name: data.user.street_name || '',
          unit_number: data.user.unit_number || '',
          building: data.user.building || '',
          suburb: data.user.suburb || '',
          city: data.user.city || '',
          province: data.user.province || '',
          postal_code: data.user.postal_code || ''
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMode && formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Profile updated successfully!');
        setPasswordMode(false);
        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        fetchProfile();
      } else {
        alert(data.error || 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20"><span className="spinner"></span></div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Reseller Profile</h2>
        <p className="text-muted">Manage your ISP identity, service address, and security protocols.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="space-y-6">
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="w-20 h-20 bg-brand-gradient text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ fontSize: '32px' }}>
              🏢
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{user?.company_name}</h3>
            <p className="text-sm text-muted mb-4">{user?.name}</p>
            
            <div className="flex flex-col gap-2 mt-4">
              <div className="badge badge-success block">Active Partner</div>
              <div className="text-[10px] uppercase font-bold text-muted mt-2">Registration Status</div>
              <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700 }} className="text-brand">
                 {user?.application_status}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-subtle text-left">
              <label className="text-[10px] font-bold text-muted uppercase">Payment Reference (Pay@)</label>
              <div className="flex items-center gap-2 mt-1">
                 <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-primary)' }}>{user?.account_number}</span>
              </div>
              <p className="text-[11px] text-muted mt-2">Use this ID for all financial reconciliations.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleUpdate} className="space-y-8">
              
              {/* Basic Info */}
              <section>
                <h4 className="text-sm font-bold uppercase text-brand mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand"></span> Basic Identity
                </h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Trading Name</label>
                    <input className="form-input" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Contact Vectors */}
              <section>
                <h4 className="text-sm font-bold uppercase text-brand mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand"></span> Contact Channels
                </h4>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Office Phone</label>
                    <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Direct Mobile</label>
                    <input className="form-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input className="form-input" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Global Address Format */}
              <section>
                <h4 className="text-sm font-bold uppercase text-brand mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand"></span> Registered Business Address
                </h4>
                <div className="space-y-4">
                  <div className="grid-3">
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                      <label className="form-label">Street Number</label>
                      <input className="form-input" value={formData.street_number} onChange={e => setFormData({...formData, street_number: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Street Name</label>
                      <input className="form-input" value={formData.street_name} onChange={e => setFormData({...formData, street_name: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Unit / Suite Number</label>
                      <input className="form-input" placeholder="e.g. Unit 4B" value={formData.unit_number} onChange={e => setFormData({...formData, unit_number: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Building / Office Park</label>
                      <input className="form-input" placeholder="e.g. Greenview Plaza" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">Suburb</label>
                      <input className="form-input" value={formData.suburb} onChange={e => setFormData({...formData, suburb: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Province</label>
                      <select className="form-select" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                         <option value="">Select Province</option>
                         <option value="Gauteng">Gauteng</option>
                         <option value="Western Cape">Western Cape</option>
                         <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                         <option value="Eastern Cape">Eastern Cape</option>
                         <option value="Free State">Free State</option>
                         <option value="Limpopo">Limpopo</option>
                         <option value="Mpumalanga">Mpumalanga</option>
                         <option value="North West">North West</option>
                         <option value="Northern Cape">Northern Cape</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ maxWidth: '200px' }}>
                    <label className="form-label">Postal Code</label>
                    <input className="form-input" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Security */}
              <section className="pt-6 border-t border-subtle">
                <button type="button" className="btn btn-secondary btn-sm flex items-center gap-2" onClick={() => setPasswordMode(!passwordMode)}>
                  {passwordMode ? 'Cancel Password Change' : '🔒 Update Account Password'}
                </button>

                {passwordMode && (
                  <div className="mt-6 space-y-4 p-6 bg-elevated rounded-xl animate-slide-up">
                    <div className="form-group">
                      <label className="form-label font-bold">Verify Current Password</label>
                      <input type="password" className="form-input" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} required />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input type="password"  className="form-input" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password"  className="form-input" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="flex justify-end sticky bottom-0 bg-main py-4 border-t border-subtle">
                <button type="submit" className="btn btn-primary btn-lg px-12" disabled={saving}>
                  {saving ? 'Updating System...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
