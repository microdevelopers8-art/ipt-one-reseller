'use client';

import { useEffect, useState } from 'react';

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Unified settings state
  const [settings, setSettings] = useState<any>({
    company_details: {
      legal_name: '',
      trading_name: '',
      registration_number: '',
      vat_number: '',
      address: '',
      support_email: '',
      support_phone: ''
    },
    branding: {
      accent_color: '#00a3ff',
      secondary_color: '#0066cc',
      logo_url: '/logo.png'
    },
    banking: [],
    smtp: {
      host: '',
      port: 587,
      encryption: 'TLS',
      username: '',
      password: '',
      recipients: ['admin@iptone.co.za']
    },
    templates: {
      active_template: 'approval',
      approval: { 
        subject: 'Welcome to IPT One! Your application is approved.', 
        body: 'Dear {{user_name}},\n\nYour application was approved!\n\nYour Account Number: {{account_number}}\n\n*Note: Please use your Account Number (e.g. {{account_number}}) as your unique payment reference for all Pay@ and EFT transactions.*' 
      },
      rejection: { subject: 'Application Update', body: 'Dear {{user_name}},\n\nUnfortunately...' },
      new_order: { subject: 'Order Received', body: 'Order confirmation...' }
    },
    payments: {
      payfast: { enabled: false, merchant_id: '', merchant_key: '', passphrase: '', sandbox: true },
      payat: { enabled: false, api_key: '' },
      yoco: { enabled: false, secret_key: '', public_key: '' }
    }
  });

  const tabs = [
    { id: 'company', label: '🏢 Company Details' },
    { id: 'branding', label: '✨ Branding' },
    { id: 'banking', label: '🏦 Bank Accounts' },
    { id: 'smtp', label: '📨 SMTP Settings' },
    { id: 'templates', label: '📝 Email Templates' },
    { id: 'payments', label: '💳 Payment Processors' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        // Merge with defaults to ensure all keys exist
        setSettings({
          ...settings,
          ...data.settings,
          company_details: { ...settings.company_details, ...data.settings.company_details },
          branding: { ...settings.branding, ...data.settings.branding },
          banking: Array.isArray(data.settings.banking) ? data.settings.banking : [],
          smtp: { ...settings.smtp, ...data.settings.smtp },
          templates: { ...settings.templates, ...data.settings.templates },
          payments: { ...settings.payments, ...data.settings.payments }
        });
      }
    } catch (error) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  }

  const updateSubState = (category: string, field: string, value: any) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };

  const addBank = () => {
    setSettings({
      ...settings,
      banking: [...settings.banking, { bank_name: '', account_name: '', account_number: '', branch_code: '' }]
    });
  };

  const updateBank = (index: number, field: string, value: string) => {
    const newBanking = [...settings.banking];
    newBanking[index] = { ...newBanking[index], [field]: value };
    setSettings({ ...settings, banking: newBanking });
  };

  const removeBank = (index: number) => {
    setSettings({ ...settings, banking: settings.banking.filter((_: any, i: number) => i !== index) });
  };

  const addRecipient = () => {
    setSettings({
      ...settings,
      smtp: { ...settings.smtp, recipients: [...(settings.smtp.recipients || []), ''] }
    });
  };

  const updateRecipient = (index: number, val: string) => {
    const newRec = [...settings.smtp.recipients];
    newRec[index] = val;
    setSettings({ ...settings, smtp: { ...settings.smtp, recipients: newRec } });
  };

  const removeRecipient = (index: number) => {
    setSettings({ ...settings, smtp: { ...settings.smtp, recipients: settings.smtp.recipients.filter((_: any, i: number) => i !== index) } });
  };

  if (loading) return <div className="flex items-center justify-center p-20"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div className="flex justify-between items-center mb-6" style={{ flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Company Settings</h2>
          <p className="text-muted">Configure your business identity and connectivity.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        
        <div style={{ 
          width: '260px', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Menis</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '4px',
                    cursor: 'pointer', transition: 'all 0.2s ease', background: isActive ? 'var(--brand-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)', border: 'none', fontWeight: isActive ? 600 : 500, fontSize: '14px',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ 
          flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-main)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <form onSubmit={handleSave} style={{ maxWidth: '640px' }}>
              
              {activeTab === 'company' && (
                <div className="grid gap-4">
                  <div className="form-group">
                    <label className="form-label">Legal Name</label>
                    <input className="form-input" value={settings.company_details.legal_name} onChange={e => updateSubState('company_details', 'legal_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trading Name</label>
                    <input className="form-input" value={settings.company_details.trading_name} onChange={e => updateSubState('company_details', 'trading_name', e.target.value)} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Reg #</label>
                      <input className="form-input" value={settings.company_details.registration_number} onChange={e => updateSubState('company_details', 'registration_number', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">VAT #</label>
                      <input className="form-input" value={settings.company_details.vat_number} onChange={e => updateSubState('company_details', 'vat_number', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-textarea" rows={3} value={settings.company_details.address} onChange={e => updateSubState('company_details', 'address', e.target.value)} />
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="grid gap-4">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Accent Color</label>
                      <input type="color" className="form-input" value={settings.branding.accent_color} onChange={e => updateSubState('branding', 'accent_color', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Secondary Color</label>
                      <input type="color" className="form-input" value={settings.branding.secondary_color} onChange={e => updateSubState('branding', 'secondary_color', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'banking' && (
                <div className="grid gap-4">
                  {settings.banking.map((bank: any, idx: number) => (
                    <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                       <div className="flex justify-between items-center mb-3">
                         <span className="font-bold">Account #{idx + 1}</span>
                         <button type="button" className="btn btn-sm btn-danger" onClick={() => removeBank(idx)}>Remove</button>
                       </div>
                       <div className="grid-2">
                         <div className="form-group"><label className="form-label">Bank</label><input className="form-input" value={bank.bank_name} onChange={e => updateBank(idx, 'bank_name', e.target.value)} /></div>
                         <div className="form-group"><label className="form-label">Acc Holder</label><input className="form-input" value={bank.account_name} onChange={e => updateBank(idx, 'account_name', e.target.value)} /></div>
                         <div className="form-group"><label className="form-label">Acc #</label><input className="form-input" value={bank.account_number} onChange={e => updateBank(idx, 'account_number', e.target.value)} /></div>
                         <div className="form-group"><label className="form-label">Branch</label><input className="form-input" value={bank.branch_code} onChange={e => updateBank(idx, 'branch_code', e.target.value)} /></div>
                       </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addBank}>+ Add Bank Account</button>
                </div>
              )}

              {activeTab === 'smtp' && (
                <div className="grid gap-4">
                  <div className="form-group"><label className="form-label">Host</label><input className="form-input" value={settings.smtp.host} onChange={e => updateSubState('smtp', 'host', e.target.value)} /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Port</label><input type="number" className="form-input" value={settings.smtp.port} onChange={e => updateSubState('smtp', 'port', parseInt(e.target.value))} /></div>
                    <div className="form-group"><label className="form-label">User</label><input className="form-input" value={settings.smtp.username} onChange={e => updateSubState('smtp', 'username', e.target.value)} /></div>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-bold">Alert Recipients</label>
                    <div className="flex flex-col gap-2">
                      {settings.smtp.recipients?.map((r: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input className="form-input" value={r} onChange={e => updateRecipient(idx, e.target.value)} />
                          <button type="button" className="btn btn-icon btn-danger" onClick={() => removeRecipient(idx)}>🗑️</button>
                        </div>
                      ))}
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addRecipient}>+ Add Email</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="grid gap-6">
                  <div style={{ padding: '16px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold">PayFast</h4>
                      <input type="checkbox" checked={settings.payments.payfast.enabled} onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, enabled: e.target.checked })} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group"><label className="form-label text-xs">M-ID</label><input className="form-input" value={settings.payments.payfast.merchant_id} onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, merchant_id: e.target.value })} /></div>
                      <div className="form-group"><label className="form-label text-xs">M-Key</label><input className="form-input" type="password" value={settings.payments.payfast.merchant_key} onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, merchant_key: e.target.value })} /></div>
                    </div>
                    <div className="form-group"><label className="form-label text-xs">Phassphrase</label><input className="form-input" type="password" value={settings.payments.payfast.passphrase} onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, passphrase: e.target.value })} /></div>
                    <label className="flex items-center gap-2 text-xs mt-2"><input type="checkbox" checked={settings.payments.payfast.sandbox} onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, sandbox: e.target.checked })} /> Sandbox Mode</label>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
