'use client';

import { useEffect, useState } from 'react';

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState('company');
  const [activeTemplateTab, setActiveTemplateTab] = useState('approval');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  
  // Unified settings state
  const [settings, setSettings] = useState<any>({
    company_details: {
      legal_name: '',
      trading_name: '',
      registration_number: '',
      vat_number: '',
      tax_number: '',
      business_type: '',
      industry: '',
      founded_year: '',
      employee_count: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'South Africa',
      support_email: '',
      support_phone: '',
      support_phone_alt: '',
      website_url: '',
      linkedin_url: '',
      twitter_url: '',
      facebook_url: '',
      business_hours: 'Mon-Fri 08:00-17:00',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      language: 'en'
    },
    branding: {
      accent_color: '#00a3ff',
      secondary_color: '#0066cc',
      tertiary_color: '#ff6b35',
      dark_mode_bg: '#0a0a0a',
      dark_mode_text: '#ffffff',
      logo_url: '/logo.png',
      favicon_url: '/favicon.ico',
      brand_font: 'Inter',
      heading_font: 'Poppins',
      footer_text: '© 2026 IPT One Telecoms. All rights reserved.',
      support_url: 'https://support.iptone.co.za',
      terms_url: 'https://iptone.co.za/terms',
      privacy_url: 'https://iptone.co.za/privacy'
    },
    banking: [],
    smtp: {
      host: '',
      port: 587,
      encryption: 'TLS',
      username: '',
      password: '',
      from_email: 'noreply@iptone.co.za',
      from_name: 'IPT One Telecoms',
      reply_to: 'support@iptone.co.za',
      recipients: ['admin@iptone.co.za']
    },
    templates: {
      active_template: 'approval',
      approval: { 
        subject: 'Welcome to IPT One! Your application is approved.', 
        body: 'Dear {{user_name}},\n\nYour application was approved!\n\nYour Account Number: {{account_number}}\n\nBusiness: {{company_name}}\n\n*Note: Please use your Account Number as your unique payment reference for all transactions.*\n\nIf you have any questions, contact us at {{support_email}} or {{support_phone}}' 
      },
      rejection: { 
        subject: 'Application Update - {{company_name}}', 
        body: 'Dear {{user_name}},\n\nThank you for your application. Unfortunately, we are unable to proceed at this time.\n\nReason: {{rejection_reason}}\n\nFor more information, please contact {{support_email}}' 
      },
      new_order: { 
        subject: 'Order Confirmation #{{order_number}}', 
        body: 'Dear {{user_name}},\n\nThank you for your order!\n\nOrder Number: {{order_number}}\nTotal: {{order_total}}\n\nItems:\n{{order_items}}\n\nYour order is being processed and will be activated shortly.\n\nTrack your order at: {{support_url}}/orders' 
      },
      suspension: {
        subject: 'Account Suspension Notice',
        body: 'Dear {{user_name}},\n\nYour account ({{account_number}}) has been suspended effective {{suspension_date}}.\n\nReason: {{suspension_reason}}\n\nTo appeal this decision or for more information, please contact {{support_email}}.'
      },
      upgrade_downgrade: {
        subject: 'Your Plan Has Been Updated',
        body: 'Dear {{user_name}},\n\nYour account plan has been updated to: {{plan_name}}\n\nRenewal Date: {{renewal_date}}\n\nThe new pricing will apply from your next billing cycle.\n\nFor details, visit: {{support_url}}/account'
      },
      payment_received: {
        subject: 'Payment Received - Invoice #{{invoice_number}}',
        body: 'Dear {{user_name}},\n\nThank you! We have received your payment.\n\nAmount: {{payment_amount}}\nDate: {{payment_date}}\nInvoice: {{invoice_number}}\nAccount: {{account_number}}\n\nYour account credit has been updated. Thank you for your business!'
      },
      support_response: {
        subject: 'Re: Support Ticket #{{ticket_number}}',
        body: 'Dear {{user_name}},\n\nThank you for contacting us regarding ticket #{{ticket_number}}.\n\nResolution:\n{{resolution}}\n\nIf you have any further questions, please reply to this email or contact {{support_email}}.'
      },
      password_reset: {
        subject: 'Password Reset Request',
        body: 'Dear {{user_name}},\n\nYou requested a password reset for your account.\n\nClick the link below to reset your password:\n{{reset_link}}\n\nThis link expires in {{expiry_time}}.\n\nIf you did not request this reset, please ignore this email.'
      }
    },
    payments: {
      currency: 'ZAR',
      environment: 'production',
      fee_model: 'merchant',
      min_amount: '',
      max_amount: '',
      payfast: {
        enabled: false,
        merchant_id: '',
        merchant_key: '',
        passphrase: '',
        sandbox: true,
        return_url: '',
        cancel_url: '',
        notify_url: ''
      },
      payat: {
        enabled: false,
        api_key: '',
        merchant_id: '',
        webhook_url: ''
      },
      yoco: {
        enabled: false,
        secret_key: '',
        public_key: '',
        webhook_url: '',
        webhook_secret: ''
      }
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
        // Handle backward compatibility for old address field
        let companyDetails = { ...settings.company_details, ...data.settings.company_details };
        if (data.settings.company_details?.address && !data.settings.company_details?.address_line1) {
          // Split old address into new format
          companyDetails.address_line1 = data.settings.company_details.address;
        }

        // Handle backward compatibility for old banking structure
        let bankingData = Array.isArray(data.settings.banking) ? data.settings.banking : [];
        bankingData = bankingData.map((bank: any, idx: number) => ({
          bank_name: bank.bank_name || '',
          account_name: bank.account_name || '',
          account_number: bank.account_number || '',
          branch_code: bank.branch_code || '',
          account_type: bank.account_type || 'business',
          currency: bank.currency || 'ZAR',
          country: bank.country || 'South Africa',
          swift_code: bank.swift_code || '',
          iban: bank.iban || '',
          routing_number: bank.routing_number || '',
          is_primary: bank.is_primary !== undefined ? bank.is_primary : idx === 0,
          is_active: bank.is_active !== undefined ? bank.is_active : true,
          notes: bank.notes || ''
        }));

        // Handle backward compatibility for payments structure
        let paymentsData = { ...settings.payments, ...data.settings.payments };

        // Ensure all payment processors have the new structure
        paymentsData = {
          ...paymentsData,
          currency: paymentsData.currency || 'ZAR',
          environment: paymentsData.environment || 'production',
          fee_model: paymentsData.fee_model || 'merchant',
          min_amount: paymentsData.min_amount || '',
          max_amount: paymentsData.max_amount || '',
          payfast: {
            enabled: paymentsData.payfast?.enabled || false,
            merchant_id: paymentsData.payfast?.merchant_id || '',
            merchant_key: paymentsData.payfast?.merchant_key || '',
            passphrase: paymentsData.payfast?.passphrase || '',
            sandbox: paymentsData.payfast?.sandbox || false,
            return_url: paymentsData.payfast?.return_url || '',
            cancel_url: paymentsData.payfast?.cancel_url || '',
            notify_url: paymentsData.payfast?.notify_url || ''
          },
          payat: {
            enabled: paymentsData.payat?.enabled || false,
            api_key: paymentsData.payat?.api_key || '',
            merchant_id: paymentsData.payat?.merchant_id || '',
            webhook_url: paymentsData.payat?.webhook_url || ''
          },
          yoco: {
            enabled: paymentsData.yoco?.enabled || false,
            secret_key: paymentsData.yoco?.secret_key || '',
            public_key: paymentsData.yoco?.public_key || '',
            webhook_url: paymentsData.yoco?.webhook_url || '',
            webhook_secret: paymentsData.yoco?.webhook_secret || ''
          }
        };

        setSettings({
          ...settings,
          ...data.settings,
          company_details: companyDetails,
          branding: { ...settings.branding, ...data.settings.branding },
          banking: bankingData,
          smtp: { ...settings.smtp, ...data.settings.smtp },
          templates: { ...settings.templates, ...data.settings.templates },
          payments: paymentsData
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

  const handleTestSMTP = async () => {
    setTestResult(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'connection' }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: String(err) });
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
      banking: [...settings.banking, {
        bank_name: '',
        account_name: '',
        account_number: '',
        branch_code: '',
        account_type: 'business',
        currency: 'ZAR',
        country: 'South Africa',
        swift_code: '',
        iban: '',
        routing_number: '',
        is_primary: settings.banking.length === 0,
        is_active: true,
        notes: ''
      }]
    });
  };

  const updateBank = (index: number, field: string, value: any) => {
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

      <div style={{ display: 'flex', gap: '32px', flex: 1, minHeight: 0 }}>
        
        <div style={{ 
          width: '300px', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Settings Tabs</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '8px',
                    cursor: 'pointer', transition: 'all 0.2s ease', background: isActive ? 'var(--brand-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)', border: 'none', fontWeight: isActive ? 600 : 500, fontSize: '15px',
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

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', display: 'flex', justifyContent: 'center' }}>
            <form onSubmit={handleSave} style={{ maxWidth: '720px', width: '100%' }}>
              
              {activeTab === 'company' && (
                <div className="grid gap-6">
                  {/* Basic Information */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🏢 Basic Company Information</h4>
                    <div className="grid gap-4">
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Legal Company Name *</label>
                          <input
                            className="form-input"
                            placeholder="e.g., IPT One Telecoms (Pty) Ltd"
                            value={settings.company_details.legal_name}
                            onChange={e => updateSubState('company_details', 'legal_name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Trading Name (DBA)</label>
                          <input
                            className="form-input"
                            placeholder="e.g., IPT One"
                            value={settings.company_details.trading_name}
                            onChange={e => updateSubState('company_details', 'trading_name', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid-3">
                        <div className="form-group">
                          <label className="form-label">Registration Number</label>
                          <input
                            className="form-input"
                            placeholder="e.g., 2020/123456/07"
                            value={settings.company_details.registration_number}
                            onChange={e => updateSubState('company_details', 'registration_number', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">VAT Number</label>
                          <input
                            className="form-input"
                            placeholder="e.g., 4123456789"
                            value={settings.company_details.vat_number}
                            onChange={e => updateSubState('company_details', 'vat_number', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tax Number</label>
                          <input
                            className="form-input"
                            placeholder="e.g., 9876543210"
                            value={settings.company_details.tax_number}
                            onChange={e => updateSubState('company_details', 'tax_number', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid-3">
                        <div className="form-group">
                          <label className="form-label">Business Type</label>
                          <select
                            className="form-input"
                            value={settings.company_details.business_type}
                            onChange={e => updateSubState('company_details', 'business_type', e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="private_company">Private Company (Pty Ltd)</option>
                            <option value="public_company">Public Company (Ltd)</option>
                            <option value="sole_proprietorship">Sole Proprietorship</option>
                            <option value="partnership">Partnership</option>
                            <option value="cc">Close Corporation (CC)</option>
                            <option value="trust">Trust</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Industry</label>
                          <select
                            className="form-input"
                            value={settings.company_details.industry}
                            onChange={e => updateSubState('company_details', 'industry', e.target.value)}
                          >
                            <option value="">Select Industry</option>
                            <option value="telecommunications">Telecommunications</option>
                            <option value="technology">Technology</option>
                            <option value="internet_services">Internet Services</option>
                            <option value="consulting">Consulting</option>
                            <option value="retail">Retail</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Founded Year</label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="e.g., 2020"
                            min="1900"
                            max="2030"
                            value={settings.company_details.founded_year}
                            onChange={e => updateSubState('company_details', 'founded_year', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>📍 Address & Location</h4>
                    <div className="grid gap-4">
                      <div className="form-group">
                        <label className="form-label">Address Line 1 *</label>
                        <input
                          className="form-input"
                          placeholder="Street address"
                          value={settings.company_details.address_line1}
                          onChange={e => updateSubState('company_details', 'address_line1', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Address Line 2</label>
                        <input
                          className="form-input"
                          placeholder="Suite, floor, building (optional)"
                          value={settings.company_details.address_line2}
                          onChange={e => updateSubState('company_details', 'address_line2', e.target.value)}
                        />
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            className="form-input"
                            placeholder="e.g., Johannesburg"
                            value={settings.company_details.city}
                            onChange={e => updateSubState('company_details', 'city', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">State/Province</label>
                          <input
                            className="form-input"
                            placeholder="e.g., Gauteng"
                            value={settings.company_details.state_province}
                            onChange={e => updateSubState('company_details', 'state_province', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Postal Code</label>
                          <input
                            className="form-input"
                            placeholder="e.g., 2196"
                            value={settings.company_details.postal_code}
                            onChange={e => updateSubState('company_details', 'postal_code', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Country *</label>
                          <select
                            className="form-input"
                            value={settings.company_details.country}
                            onChange={e => updateSubState('company_details', 'country', e.target.value)}
                            required
                          >
                            <option value="South Africa">South Africa</option>
                            <option value="Namibia">Namibia</option>
                            <option value="Botswana">Botswana</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                            <option value="Mozambique">Mozambique</option>
                            <option value="Eswatini">Eswatini</option>
                            <option value="Lesotho">Lesotho</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>📞 Contact Information</h4>
                    <div className="grid gap-4">
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Primary Support Email *</label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="support@company.com"
                            value={settings.company_details.support_email}
                            onChange={e => updateSubState('company_details', 'support_email', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Website URL</label>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="https://www.company.com"
                            value={settings.company_details.website_url}
                            onChange={e => updateSubState('company_details', 'website_url', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Primary Phone *</label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="+27 11 123 4567"
                            value={settings.company_details.support_phone}
                            onChange={e => updateSubState('company_details', 'support_phone', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Alternative Phone</label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="+27 21 987 6543"
                            value={settings.company_details.support_phone_alt}
                            onChange={e => updateSubState('company_details', 'support_phone_alt', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Business Hours</label>
                        <input
                          className="form-input"
                          placeholder="e.g., Mon-Fri 08:00-17:00, Sat 09:00-13:00"
                          value={settings.company_details.business_hours}
                          onChange={e => updateSubState('company_details', 'business_hours', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media & Online Presence */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🌐 Social Media & Online Presence</h4>
                    <div className="grid gap-4">
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">LinkedIn</label>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="https://linkedin.com/company/..."
                            value={settings.company_details.linkedin_url}
                            onChange={e => updateSubState('company_details', 'linkedin_url', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Twitter/X</label>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="https://twitter.com/..."
                            value={settings.company_details.twitter_url}
                            onChange={e => updateSubState('company_details', 'twitter_url', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Facebook</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://facebook.com/..."
                          value={settings.company_details.facebook_url}
                          onChange={e => updateSubState('company_details', 'facebook_url', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🌍 Regional & Business Settings</h4>
                    <div className="grid gap-4">
                      <div className="grid-3">
                        <div className="form-group">
                          <label className="form-label">Timezone</label>
                          <select
                            className="form-input"
                            value={settings.company_details.timezone}
                            onChange={e => updateSubState('company_details', 'timezone', e.target.value)}
                          >
                            <option value="Africa/Johannesburg">South Africa (GMT+2)</option>
                            <option value="Africa/Windhoek">Namibia (GMT+2)</option>
                            <option value="Africa/Gaborone">Botswana (GMT+2)</option>
                            <option value="Africa/Harare">Zimbabwe (GMT+2)</option>
                            <option value="Africa/Maputo">Mozambique (GMT+2)</option>
                            <option value="Africa/Mbabane">Eswatini (GMT+2)</option>
                            <option value="Africa/Maseru">Lesotho (GMT+2)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Currency</label>
                          <select
                            className="form-input"
                            value={settings.company_details.currency}
                            onChange={e => updateSubState('company_details', 'currency', e.target.value)}
                          >
                            <option value="ZAR">South African Rand (ZAR)</option>
                            <option value="NAD">Namibian Dollar (NAD)</option>
                            <option value="BWP">Botswana Pula (BWP)</option>
                            <option value="ZWL">Zimbabwe Dollar (ZWL)</option>
                            <option value="MZN">Mozambican Metical (MZN)</option>
                            <option value="SZL">Swazi Lilangeni (SZL)</option>
                            <option value="LSL">Lesotho Loti (LSL)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Primary Language</label>
                          <select
                            className="form-input"
                            value={settings.company_details.language}
                            onChange={e => updateSubState('company_details', 'language', e.target.value)}
                          >
                            <option value="en">English</option>
                            <option value="af">Afrikaans</option>
                            <option value="zu">Zulu</option>
                            <option value="xh">Xhosa</option>
                            <option value="st">Sesotho</option>
                            <option value="tn">Tswana</option>
                            <option value="pt">Portuguese</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Company Size (Employees)</label>
                        <select
                          className="form-input"
                          value={settings.company_details.employee_count}
                          onChange={e => updateSubState('company_details', 'employee_count', e.target.value)}
                        >
                          <option value="">Select Size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501-1000">501-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="grid gap-6">
                  {/* Logo & Favicon Section */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>Logo & Branding Assets</h4>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Logo URL</label>
                        <input className="form-input" placeholder="e.g., /logo.png" value={settings.branding.logo_url} onChange={e => updateSubState('branding', 'logo_url', e.target.value)} />
                        {settings.branding.logo_url && (
                          <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <img src={settings.branding.logo_url} alt="Logo Preview" style={{ maxHeight: '80px', objectFit: 'contain' }} />
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Favicon URL</label>
                        <input className="form-input" placeholder="e.g., /favicon.ico" value={settings.branding.favicon_url} onChange={e => updateSubState('branding', 'favicon_url', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Color Scheme Section */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🎨 Color Scheme</h4>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Primary Color</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="color" className="form-input" style={{ width: '60px', padding: '4px' }} value={settings.branding.accent_color} onChange={e => updateSubState('branding', 'accent_color', e.target.value)} />
                          <input type="text" className="form-input" style={{ flex: 1 }} value={settings.branding.accent_color} onChange={e => updateSubState('branding', 'accent_color', e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Secondary Color</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="color" className="form-input" style={{ width: '60px', padding: '4px' }} value={settings.branding.secondary_color} onChange={e => updateSubState('branding', 'secondary_color', e.target.value)} />
                          <input type="text" className="form-input" style={{ flex: 1 }} value={settings.branding.secondary_color} onChange={e => updateSubState('branding', 'secondary_color', e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Accent Color</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="color" className="form-input" style={{ width: '60px', padding: '4px' }} value={settings.branding.tertiary_color} onChange={e => updateSubState('branding', 'tertiary_color', e.target.value)} />
                          <input type="text" className="form-input" style={{ flex: 1 }} value={settings.branding.tertiary_color} onChange={e => updateSubState('branding', 'tertiary_color', e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dark Mode Background</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="color" className="form-input" style={{ width: '60px', padding: '4px' }} value={settings.branding.dark_mode_bg} onChange={e => updateSubState('branding', 'dark_mode_bg', e.target.value)} />
                          <input type="text" className="form-input" style={{ flex: 1 }} value={settings.branding.dark_mode_bg} onChange={e => updateSubState('branding', 'dark_mode_bg', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>✍️ Typography</h4>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Body Font</label>
                        <select className="form-input" value={settings.branding.brand_font} onChange={e => updateSubState('branding', 'brand_font', e.target.value)}>
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Ubuntu">Ubuntu</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Heading Font</label>
                        <select className="form-input" value={settings.branding.heading_font} onChange={e => updateSubState('branding', 'heading_font', e.target.value)}>
                          <option value="Poppins">Poppins</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Playfair">Playfair Display</option>
                          <option value="Raleway">Raleway</option>
                          <option value="Quicksand">Quicksand</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Links Section */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🔗 Important Links</h4>
                    <div className="form-group">
                      <label className="form-label">Support URL</label>
                      <input className="form-input" type="url" value={settings.branding.support_url} onChange={e => updateSubState('branding', 'support_url', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Terms of Service URL</label>
                      <input className="form-input" type="url" value={settings.branding.terms_url} onChange={e => updateSubState('branding', 'terms_url', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Privacy Policy URL</label>
                      <input className="form-input" type="url" value={settings.branding.privacy_url} onChange={e => updateSubState('branding', 'privacy_url', e.target.value)} />
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>📄 Footer Text</h4>
                    <div className="form-group">
                      <label className="form-label">Copyright Text</label>
                      <textarea className="form-textarea" rows={3} value={settings.branding.footer_text} onChange={e => updateSubState('branding', 'footer_text', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'banking' && (
                <div className="grid gap-6">
                  {/* Header with Add Button */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-1">🏦 Bank Accounts</h3>
                      <p className="text-secondary text-sm">Configure bank accounts for payments and invoices</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={addBank}>
                      + Add Bank Account
                    </button>
                  </div>

                  {/* Bank Accounts List */}
                  {settings.banking.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-elevated)', border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</div>
                      <h4 className="font-bold mb-2">No Bank Accounts Configured</h4>
                      <p className="text-secondary mb-4">Add your first bank account to enable payment processing and invoicing.</p>
                      <button type="button" className="btn btn-primary" onClick={addBank}>
                        Add Your First Bank Account
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {settings.banking.map((bank: any, idx: number) => (
                        <div key={idx} style={{
                          padding: '24px',
                          background: 'var(--bg-main)',
                          border: bank.is_primary ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)',
                          position: 'relative'
                        }}>
                          {/* Account Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div style={{
                                width: '40px',
                                height: '40px',
                                background: bank.is_primary ? 'var(--primary)' : 'var(--bg-hover)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px'
                              }}>
                                🏦
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">
                                  {bank.bank_name || `Account #${idx + 1}`}
                                  {bank.is_primary && <span style={{ marginLeft: '8px', fontSize: '12px', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>PRIMARY</span>}
                                </h4>
                                <p className="text-secondary text-sm">
                                  {bank.account_type === 'business' ? 'Business Account' : 'Personal Account'} • {bank.currency} • {bank.country}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className={`btn btn-sm ${bank.is_primary ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => updateBank(idx, 'is_primary', !bank.is_primary)}
                                title={bank.is_primary ? 'Remove as primary account' : 'Set as primary account'}
                              >
                                {bank.is_primary ? '⭐ Primary' : '☆ Set Primary'}
                              </button>
                              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeBank(idx)}>
                                🗑️ Remove
                              </button>
                            </div>
                          </div>

                          {/* Account Status */}
                          <div className="flex items-center gap-4 mb-6">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={bank.is_active}
                                onChange={e => updateBank(idx, 'is_active', e.target.checked)}
                              />
                              <span className="text-sm">Active Account</span>
                            </label>
                            <div className="text-xs text-secondary">
                              Status: {bank.is_active ? '✅ Active' : '⏸️ Inactive'}
                            </div>
                          </div>

                          {/* Basic Account Information */}
                          <div className="grid gap-4 mb-6">
                            <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Basic Information</h5>
                            <div className="grid-2">
                              <div className="form-group">
                                <label className="form-label">Bank Name *</label>
                                <input
                                  className="form-input"
                                  placeholder="e.g., First National Bank"
                                  value={bank.bank_name}
                                  onChange={e => updateBank(idx, 'bank_name', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Account Holder Name *</label>
                                <input
                                  className="form-input"
                                  placeholder="e.g., IPT One Telecoms (Pty) Ltd"
                                  value={bank.account_name}
                                  onChange={e => updateBank(idx, 'account_name', e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid-3">
                              <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <select
                                  className="form-input"
                                  value={bank.account_type}
                                  onChange={e => updateBank(idx, 'account_type', e.target.value)}
                                >
                                  <option value="business">Business Account</option>
                                  <option value="personal">Personal Account</option>
                                  <option value="checking">Checking Account</option>
                                  <option value="savings">Savings Account</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label className="form-label">Currency</label>
                                <select
                                  className="form-input"
                                  value={bank.currency}
                                  onChange={e => updateBank(idx, 'currency', e.target.value)}
                                >
                                  <option value="ZAR">South African Rand (ZAR)</option>
                                  <option value="USD">US Dollar (USD)</option>
                                  <option value="EUR">Euro (EUR)</option>
                                  <option value="GBP">British Pound (GBP)</option>
                                  <option value="NAD">Namibian Dollar (NAD)</option>
                                  <option value="BWP">Botswana Pula (BWP)</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label className="form-label">Country</label>
                                <select
                                  className="form-input"
                                  value={bank.country}
                                  onChange={e => updateBank(idx, 'country', e.target.value)}
                                >
                                  <option value="South Africa">South Africa</option>
                                  <option value="Namibia">Namibia</option>
                                  <option value="Botswana">Botswana</option>
                                  <option value="Zimbabwe">Zimbabwe</option>
                                  <option value="Mozambique">Mozambique</option>
                                  <option value="United States">United States</option>
                                  <option value="United Kingdom">United Kingdom</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Account Numbers */}
                          <div className="grid gap-4 mb-6">
                            <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Account Numbers</h5>
                            <div className="grid-2">
                              <div className="form-group">
                                <label className="form-label">Account Number *</label>
                                <input
                                  className="form-input"
                                  placeholder="e.g., 1234567890"
                                  value={bank.account_number}
                                  onChange={e => updateBank(idx, 'account_number', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Branch Code</label>
                                <input
                                  className="form-input"
                                  placeholder="e.g., 250655"
                                  value={bank.branch_code}
                                  onChange={e => updateBank(idx, 'branch_code', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* International Banking */}
                          <div className="grid gap-4 mb-6">
                            <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">International Banking (Optional)</h5>
                            <div className="grid-2">
                              <div className="form-group">
                                <label className="form-label">SWIFT/BIC Code</label>
                                <input
                                  className="form-input"
                                  placeholder="e.g., FIRNZAJJ"
                                  value={bank.swift_code}
                                  onChange={e => updateBank(idx, 'swift_code', e.target.value)}
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">IBAN</label>
                                <input
                                  className="form-input"
                                  placeholder="e.g., ZA12345678901234567890"
                                  value={bank.iban}
                                  onChange={e => updateBank(idx, 'iban', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Routing Number (US Only)</label>
                              <input
                                className="form-input"
                                placeholder="e.g., 123456789"
                                value={bank.routing_number}
                                onChange={e => updateBank(idx, 'routing_number', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Additional Notes */}
                          <div className="grid gap-4">
                            <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Additional Information</h5>
                            <div className="form-group">
                              <label className="form-label">Notes</label>
                              <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Any additional notes about this account..."
                                value={bank.notes}
                                onChange={e => updateBank(idx, 'notes', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary Footer */}
                  {settings.banking.length > 0 && (
                    <div style={{ padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{settings.banking.length} Bank Account{settings.banking.length !== 1 ? 's' : ''} Configured</span>
                          <span className="text-secondary text-sm ml-2">
                            ({settings.banking.filter((b: any) => b.is_active).length} active, {settings.banking.filter((b: any) => b.is_primary).length} primary)
                          </span>
                        </div>
                        <button type="button" className="btn btn-secondary" onClick={addBank}>
                          + Add Another Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'smtp' && (
                <div className="grid gap-6">
                  {/* Connection Settings */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🔌 Connection Settings</h4>
                    <div className="form-group">
                      <label className="form-label">SMTP Host</label>
                      <input className="form-input" placeholder="e.g., smtp.gmail.com" value={settings.smtp.host} onChange={e => updateSubState('smtp', 'host', e.target.value)} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Port</label>
                        <input type="number" className="form-input" value={settings.smtp.port} onChange={e => updateSubState('smtp', 'port', parseInt(e.target.value))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Encryption</label>
                        <select className="form-input" value={settings.smtp.encryption} onChange={e => updateSubState('smtp', 'encryption', e.target.value)}>
                          <option value="TLS">TLS (587)</option>
                          <option value="SSL">SSL (465)</option>
                          <option value="None">None (25)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🔐 Authentication</h4>
                    <div className="form-group">
                      <label className="form-label">Username / Email</label>
                      <input className="form-input" placeholder="Your SMTP username" value={settings.smtp.username} onChange={e => updateSubState('smtp', 'username', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-input" placeholder="Your SMTP password" value={settings.smtp.password} onChange={e => updateSubState('smtp', 'password', e.target.value)} />
                    </div>
                  </div>

                  {/* Email Headers */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>✉️ Email Headers</h4>
                    <div className="form-group">
                      <label className="form-label">From Email</label>
                      <input type="email" className="form-input" value={settings.smtp.from_email} onChange={e => updateSubState('smtp', 'from_email', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">From Name</label>
                      <input className="form-input" value={settings.smtp.from_name} onChange={e => updateSubState('smtp', 'from_name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reply-To Email</label>
                      <input type="email" className="form-input" value={settings.smtp.reply_to} onChange={e => updateSubState('smtp', 'reply_to', e.target.value)} />
                    </div>
                  </div>

                  {/* Alert Recipients */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🔔 Alert Recipients</h4>
                    <p className="text-secondary text-sm mb-3">Emails to receive system notifications and alerts</p>
                    <div className="flex flex-col gap-2">
                      {settings.smtp.recipients?.map((r: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input className="form-input" type="email" value={r} onChange={e => updateRecipient(idx, e.target.value)} />
                          <button type="button" className="btn btn-icon btn-danger" onClick={() => removeRecipient(idx)}>🗑️</button>
                        </div>
                      ))}
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addRecipient}>+ Add Email</button>
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleTestSMTP}
                      disabled={saving}
                      style={{ padding: '12px 24px', fontSize: '15px', width: '100%' }}
                    >
                      🧪 Test SMTP Connection
                    </button>
                    {testResult && (
                      <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', background: testResult.success ? '#d1fae5' : '#fee2e2', border: `1px solid ${testResult.success ? '#6ee7b7' : '#fca5a5'}`, color: testResult.success ? '#065f46' : '#991b1b' }}>
                        {testResult.success ? '✅' : '❌'} {testResult.message || testResult.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="grid gap-6">
                  {/* Template Tabs Navigation */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                    {[
                      { id: 'approval', label: '✅ Approval' },
                      { id: 'rejection', label: '❌ Rejection' },
                      { id: 'new_order', label: '📦 New Order' },
                      { id: 'suspension', label: '⛔ Suspension' },
                      { id: 'upgrade_downgrade', label: '⬆️ Plan Change' },
                      { id: 'payment_received', label: '💰 Payment' },
                      { id: 'support_response', label: '💬 Support' },
                      { id: 'password_reset', label: '🔑 Password Reset' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTemplateTab(tab.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeTemplateTab === tab.id ? 'var(--primary)' : 'var(--bg-hover)',
                          color: activeTemplateTab === tab.id ? 'white' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: activeTemplateTab === tab.id ? '600' : '400',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Template Editor */}
                  <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                    {/* Main Editor */}
                    <div>
                      <div style={{ padding: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                        <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>
                          {activeTemplateTab === 'approval' && '✅ Application Approval Email'}
                          {activeTemplateTab === 'rejection' && '❌ Application Rejection Email'}
                          {activeTemplateTab === 'new_order' && '📦 New Order Confirmation Email'}
                          {activeTemplateTab === 'suspension' && '⛔ Account Suspension Email'}
                          {activeTemplateTab === 'upgrade_downgrade' && '⬆️ Plan Change Email'}
                          {activeTemplateTab === 'payment_received' && '💰 Payment Received Email'}
                          {activeTemplateTab === 'support_response' && '💬 Support Response Email'}
                          {activeTemplateTab === 'password_reset' && '🔑 Password Reset Email'}
                        </h4>

                        <div className="form-group">
                          <label className="form-label">Email Subject</label>
                          <input
                            className="form-input"
                            value={settings.templates[activeTemplateTab as keyof typeof settings.templates]?.subject || ''}
                            onChange={e => updateSubState('templates', activeTemplateTab, { ...settings.templates[activeTemplateTab as keyof typeof settings.templates], subject: e.target.value })}
                            placeholder="Enter email subject line"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email Body</label>
                          <textarea
                            className="form-textarea"
                            rows={12}
                            value={settings.templates[activeTemplateTab as keyof typeof settings.templates]?.body || ''}
                            onChange={e => updateSubState('templates', activeTemplateTab, { ...settings.templates[activeTemplateTab as keyof typeof settings.templates], body: e.target.value })}
                            placeholder="Enter email body. Use {{tag}} for variables."
                            style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
                          />
                        </div>

                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                          ℹ️ Use the insert tags guide on the right to see available variables for this template.
                        </p>
                      </div>
                    </div>

                    {/* Insert Tags Reference */}
                    <div>
                      <div style={{ padding: '16px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '20px' }}>
                        <h5 className="font-bold mb-3" style={{ fontSize: '14px' }}>📋 Available Tags</h5>

                        {/* Universal Tags */}
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Universal Tags</p>
                          <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{user_name}}'}</code> - Customer name</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{company_name}}'}</code> - Company/business</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{email}}'}</code> - Email address</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{account_number}}'}</code> - Account ID</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{date}}'}</code> - Current date</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{support_email}}'}</code> - Support email</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{support_phone}}'}</code> - Support phone</div>
                            <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{support_url}}'}</code> - Support portal URL</div>
                          </div>
                        </div>

                        {/* Template-Specific Tags */}
                        {activeTemplateTab === 'approval' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{account_number}}'}</code> - New account #</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'rejection' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{rejection_reason}}'}</code> - Why rejected</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'new_order' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{order_number}}'}</code> - Order reference</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{order_total}}'}</code> - Order amount</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{order_items}}'}</code> - Items list</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'suspension' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{suspension_date}}'}</code> - Suspension date</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{suspension_reason}}'}</code> - Reason</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'upgrade_downgrade' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{plan_name}}'}</code> - New plan name</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{renewal_date}}'}</code> - Renewal date</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'payment_received' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{payment_amount}}'}</code> - Amount received</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{payment_date}}'}</code> - Payment date</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{invoice_number}}'}</code> - Invoice #</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'support_response' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{ticket_number}}'}</code> - Ticket reference</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{resolution}}'}</code> - Resolution info</div>
                            </div>
                          </div>
                        )}

                        {activeTemplateTab === 'password_reset' && (
                          <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Template Tags</p>
                            <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{reset_link}}'}</code> - Reset URL</div>
                              <div><code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '3px' }}>{'{{expiry_time}}'}</code> - Expiry time</div>
                            </div>
                          </div>
                        )}

                        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            💡 Tip: Use line breaks (Enter) to format your email. Tags are replaced when the email is sent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="grid gap-6">
                  {/* Header with Summary */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-1">💳 Payment Processors</h3>
                      <p className="text-secondary text-sm">Configure payment gateways and processing options</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {Object.values(settings.payments).filter((p: any) => p.enabled).length} Active Processor{Object.values(settings.payments).filter((p: any) => p.enabled).length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-secondary text-xs">Payment gateways configured</div>
                    </div>
                  </div>

                  {/* Global Payment Settings */}
                  <div style={{ padding: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🌐 Global Payment Settings</h4>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Primary Currency</label>
                        <select
                          className="form-input"
                          value={settings.payments.currency || 'ZAR'}
                          onChange={e => updateSubState('payments', 'currency', e.target.value)}
                        >
                          <option value="ZAR">South African Rand (ZAR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                          <option value="NAD">Namibian Dollar (NAD)</option>
                          <option value="BWP">Botswana Pula (BWP)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Environment</label>
                        <select
                          className="form-input"
                          value={settings.payments.environment || 'production'}
                          onChange={e => updateSubState('payments', 'environment', e.target.value)}
                        >
                          <option value="sandbox">🧪 Sandbox (Testing)</option>
                          <option value="production">🚀 Production (Live)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Processing Fee Model</label>
                        <select
                          className="form-input"
                          value={settings.payments.fee_model || 'merchant'}
                          onChange={e => updateSubState('payments', 'fee_model', e.target.value)}
                        >
                          <option value="merchant">Merchant Bears Fees</option>
                          <option value="customer">Customer Bears Fees</option>
                          <option value="split">Split Fees</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2 mt-4">
                      <div className="form-group">
                        <label className="form-label">Minimum Payment Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          placeholder="10.00"
                          value={settings.payments.min_amount || ''}
                          onChange={e => updateSubState('payments', 'min_amount', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Maximum Payment Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          placeholder="10000.00"
                          value={settings.payments.max_amount || ''}
                          onChange={e => updateSubState('payments', 'max_amount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PayFast Configuration */}
                  <div style={{
                    padding: '24px',
                    background: 'var(--bg-main)',
                    border: settings.payments.payfast.enabled ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative'
                  }}>
                    {/* Status Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: settings.payments.payfast.enabled ? 'var(--success)' : 'var(--error)',
                      border: '2px solid white'
                    }}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: '#1a4db3',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: 'white'
                        }}>
                          🏦
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">PayFast</h4>
                          <p className="text-secondary text-sm">South African payment gateway</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${settings.payments.payfast.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {settings.payments.payfast.enabled ? '✅ Active' : '⏸️ Inactive'}
                            </span>
                            {settings.payments.payfast.sandbox && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                🧪 Sandbox
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.payments.payfast.enabled}
                          onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, enabled: e.target.checked })}
                        />
                        <span className="text-sm font-medium">Enable</span>
                      </label>
                    </div>

                    {settings.payments.payfast.enabled && (
                      <>
                        {/* Basic Configuration */}
                        <div className="grid gap-4 mb-6">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Basic Configuration</h5>
                          <div className="grid-2">
                            <div className="form-group">
                              <label className="form-label">Merchant ID *</label>
                              <input
                                className="form-input"
                                placeholder="10000123"
                                value={settings.payments.payfast.merchant_id}
                                onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, merchant_id: e.target.value })}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Merchant Key *</label>
                              <input
                                type="password"
                                className="form-input"
                                placeholder="abcdefghijklmnopqrstuvwyz"
                                value={settings.payments.payfast.merchant_key}
                                onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, merchant_key: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Passphrase</label>
                            <input
                              type="password"
                              className="form-input"
                              placeholder="Optional security passphrase"
                              value={settings.payments.payfast.passphrase}
                              onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, passphrase: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Environment Settings */}
                        <div className="grid gap-4 mb-6">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Environment</h5>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.payments.payfast.sandbox}
                                onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, sandbox: e.target.checked })}
                              />
                              <span className="text-sm">Sandbox Mode (Testing)</span>
                            </label>
                          </div>
                        </div>

                        {/* Webhook Configuration */}
                        <div className="grid gap-4">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Webhooks & Notifications</h5>
                          <div className="form-group">
                            <label className="form-label">Return URL</label>
                            <input
                              className="form-input"
                              placeholder="https://yourdomain.com/payment/success"
                              value={settings.payments.payfast.return_url || ''}
                              onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, return_url: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Cancel URL</label>
                            <input
                              className="form-input"
                              placeholder="https://yourdomain.com/payment/cancel"
                              value={settings.payments.payfast.cancel_url || ''}
                              onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, cancel_url: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Notify URL (Webhook)</label>
                            <input
                              className="form-input"
                              placeholder="https://yourdomain.com/api/webhooks/payfast"
                              value={settings.payments.payfast.notify_url || ''}
                              onChange={e => updateSubState('payments', 'payfast', { ...settings.payments.payfast, notify_url: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Pay@ Configuration */}
                  <div style={{
                    padding: '24px',
                    background: 'var(--bg-main)',
                    border: settings.payments.payat.enabled ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative'
                  }}>
                    {/* Status Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: settings.payments.payat.enabled ? 'var(--success)' : 'var(--error)',
                      border: '2px solid white'
                    }}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: '#ff6b35',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: 'white'
                        }}>
                          💰
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">Pay@</h4>
                          <p className="text-secondary text-sm">Instant EFT payments</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${settings.payments.payat.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {settings.payments.payat.enabled ? '✅ Active' : '⏸️ Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.payments.payat.enabled}
                          onChange={e => updateSubState('payments', 'payat', { ...settings.payments.payat, enabled: e.target.checked })}
                        />
                        <span className="text-sm font-medium">Enable</span>
                      </label>
                    </div>

                    {settings.payments.payat.enabled && (
                      <>
                        {/* API Configuration */}
                        <div className="grid gap-4 mb-6">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">API Configuration</h5>
                          <div className="form-group">
                            <label className="form-label">API Key *</label>
                            <input
                              type="password"
                              className="form-input"
                              placeholder="Your Pay@ API key"
                              value={settings.payments.payat.api_key}
                              onChange={e => updateSubState('payments', 'payat', { ...settings.payments.payat, api_key: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Merchant ID</label>
                            <input
                              className="form-input"
                              placeholder="Optional merchant identifier"
                              value={settings.payments.payat.merchant_id || ''}
                              onChange={e => updateSubState('payments', 'payat', { ...settings.payments.payat, merchant_id: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Webhook Configuration */}
                        <div className="grid gap-4">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Webhooks</h5>
                          <div className="form-group">
                            <label className="form-label">Webhook URL</label>
                            <input
                              className="form-input"
                              placeholder="https://yourdomain.com/api/webhooks/payat"
                              value={settings.payments.payat.webhook_url || ''}
                              onChange={e => updateSubState('payments', 'payat', { ...settings.payments.payat, webhook_url: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Yoco Configuration */}
                  <div style={{
                    padding: '24px',
                    background: 'var(--bg-main)',
                    border: settings.payments.yoco.enabled ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative'
                  }}>
                    {/* Status Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: settings.payments.yoco.enabled ? 'var(--success)' : 'var(--error)',
                      border: '2px solid white'
                    }}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: '#00d4aa',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: 'white'
                        }}>
                          💳
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">Yoco</h4>
                          <p className="text-secondary text-sm">Card payments & POS solutions</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${settings.payments.yoco.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {settings.payments.yoco.enabled ? '✅ Active' : '⏸️ Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.payments.yoco.enabled}
                          onChange={e => updateSubState('payments', 'yoco', { ...settings.payments.yoco, enabled: e.target.checked })}
                        />
                        <span className="text-sm font-medium">Enable</span>
                      </label>
                    </div>

                    {settings.payments.yoco.enabled && (
                      <>
                        {/* API Keys */}
                        <div className="grid gap-4 mb-6">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">API Keys</h5>
                          <div className="grid-2">
                            <div className="form-group">
                              <label className="form-label">Secret Key *</label>
                              <input
                                type="password"
                                className="form-input"
                                placeholder="sk_live_..."
                                value={settings.payments.yoco.secret_key}
                                onChange={e => updateSubState('payments', 'yoco', { ...settings.payments.yoco, secret_key: e.target.value })}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Public Key *</label>
                              <input
                                className="form-input"
                                placeholder="pk_live_..."
                                value={settings.payments.yoco.public_key}
                                onChange={e => updateSubState('payments', 'yoco', { ...settings.payments.yoco, public_key: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Webhook Configuration */}
                        <div className="grid gap-4">
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide">Webhooks</h5>
                          <div className="form-group">
                            <label className="form-label">Webhook URL</label>
                            <input
                              className="form-input"
                              placeholder="https://yourdomain.com/api/webhooks/yoco"
                              value={settings.payments.yoco.webhook_url || ''}
                              onChange={e => updateSubState('payments', 'yoco', { ...settings.payments.yoco, webhook_url: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Webhook Secret</label>
                            <input
                              type="password"
                              className="form-input"
                              placeholder="Optional webhook verification secret"
                              value={settings.payments.yoco.webhook_secret || ''}
                              onChange={e => updateSubState('payments', 'yoco', { ...settings.payments.yoco, webhook_secret: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Add New Processor Placeholder */}
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>➕</div>
                    <h4 className="font-bold mb-2">Add Payment Processor</h4>
                    <p className="text-secondary mb-4">Support for Stripe, PayPal, and other gateways coming soon</p>
                    <button type="button" className="btn btn-secondary" disabled>
                      Coming Soon
                    </button>
                  </div>

                  {/* Payment Testing Section */}
                  <div style={{ padding: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="font-bold mb-4" style={{ fontSize: '16px' }}>🧪 Payment Testing</h4>
                    <p className="text-secondary text-sm mb-4">Test your payment processor configurations</p>
                    <div className="grid-3 gap-4">
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={!settings.payments.payfast.enabled}
                        style={{ opacity: settings.payments.payfast.enabled ? 1 : 0.5 }}
                      >
                        Test PayFast
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={!settings.payments.payat.enabled}
                        style={{ opacity: settings.payments.payat.enabled ? 1 : 0.5 }}
                      >
                        Test Pay@
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={!settings.payments.yoco.enabled}
                        style={{ opacity: settings.payments.yoco.enabled ? 1 : 0.5 }}
                      >
                        Test Yoco
                      </button>
                    </div>
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
