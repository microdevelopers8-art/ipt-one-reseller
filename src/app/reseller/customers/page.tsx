'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerManager() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers(q = '') {
    setLoading(true);
    try {
      const res = await fetch(`/api/reseller/customers?search=${q}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCustomer.id ? 'PUT' : 'POST';
    const url = editingCustomer.id ? `/api/reseller/customers/${editingCustomer.id}` : '/api/reseller/customers';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCustomer),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch {}
  };

  const openAdd = () => {
    setEditingCustomer({ 
      name: '', email: '', phone: '', company_name: '',
      mobile_number: '', whatsapp_number: '', 
      street_address: '', suburb: '', city: '', province: '', postal_code: '' 
    });
    setIsModalOpen(true);
  };

  const openEdit = (cust: any) => {
    setEditingCustomer(cust);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? All services for this customer will be unlinked.')) return;
    await fetch(`/api/reseller/customers/${id}`, { method: 'DELETE' });
    fetchCustomers();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Customer Lifecycle Manager</h2>
          <p className="text-muted text-sm">Orchestrate your client base and provisioned network assets.</p>
        </div>
        <button className="btn btn-primary lg" onClick={openAdd}><span>+</span> Register New Client</button>
      </div>

      <div className="card mb-6" style={{ padding: '16px' }}>
         <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              className="form-input" 
              style={{ paddingLeft: '36px' }}
              placeholder="Search by Company, Identity, or A/C Reference..." 
              value={search}
              onChange={e => { setSearch(e.target.value); fetchCustomers(e.target.value); }}
            />
         </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Intelligence</th>
                <th>Communication Channels</th>
                <th>Identity</th>
                <th>Joined</th>
                <th>Governance</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex flex-col">
                       <span className="font-bold">{c.company_name || 'Individual'}</span>
                       <span className="text-xs text-muted">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col text-xs gap-1">
                       <span className="font-bold">{c.email}</span>
                       <div className="flex gap-2">
                          <span className="text-muted">📞 {c.phone || c.mobile_number || 'N/A'}</span>
                          {c.whatsapp_number && <span className="text-success">💬 WhatsApp</span>}
                       </div>
                    </div>
                  </td>
                  <td><span className="badge badge-secondary font-mono">{c.account_number}</span></td>
                  <td className="text-xs text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                       <Link href={`/reseller/customers/${c.id}`} className="btn btn-sm btn-primary">Assets</Link>
                       <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)}>Profile</button>
                       <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!customers.length && !loading && (
                <tr><td colSpan={5} className="text-center p-12 text-muted italic">No clients indexed in your portfolio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingCustomer && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3>{editingCustomer.id ? 'Modify' : 'Initialize'} Client Identity</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body space-y-6">
                
                {/* PRIMARY IDENTITY */}
                <div className="grid-2 gap-x-8 gap-y-4">
                  <div className="form-group">
                    <label className="form-label font-bold text-xs uppercase text-muted">Registered Company Name</label>
                    <input className="form-input" placeholder="Legal Entity Name" value={editingCustomer.company_name || ''} onChange={e => setEditingCustomer({...editingCustomer, company_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold text-xs uppercase text-muted">Primary Contact Person *</label>
                    <input className="form-input" required placeholder="Full Name" value={editingCustomer.name || ''} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} />
                  </div>
                </div>

                {/* COMMUNICATION MATRIX */}
                <div className="p-4 rounded-xl border border-subtle bg-elevated grid-3 gap-6">
                   <div className="form-group">
                     <label className="form-label font-bold text-xs">Email Address</label>
                     <input type="email" className="form-input" placeholder="client@example.com" value={editingCustomer.email || ''} onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label font-bold text-xs">Mobile Number</label>
                     <input className="form-input" placeholder="+27..." value={editingCustomer.mobile_number || ''} onChange={e => setEditingCustomer({...editingCustomer, mobile_number: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label font-bold text-xs">WhatsApp Identity</label>
                     <input className="form-input" placeholder="+27..." value={editingCustomer.whatsapp_number || ''} onChange={e => setEditingCustomer({...editingCustomer, whatsapp_number: e.target.value})} />
                   </div>
                </div>

                {/* STANDARDIZED LOGISTICS ADDRESS */}
                <div className="space-y-4">
                   <h4 className="text-xs uppercase font-bold text-muted border-b border-subtle pb-2">Logistics & Service Address</h4>
                   <div className="form-group">
                     <label className="form-label text-xs">Street Address</label>
                     <input className="form-input" placeholder="House/Bldg No, Street Name" value={editingCustomer.street_address || ''} onChange={e => setEditingCustomer({...editingCustomer, street_address: e.target.value})} />
                   </div>
                   <div className="grid-2 gap-4">
                      <div className="form-group">
                        <label className="form-label text-xs">Suburb</label>
                        <input className="form-input" value={editingCustomer.suburb || ''} onChange={e => setEditingCustomer({...editingCustomer, suburb: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">City/Town</label>
                        <input className="form-input" value={editingCustomer.city || ''} onChange={e => setEditingCustomer({...editingCustomer, city: e.target.value})} />
                      </div>
                   </div>
                   <div className="grid-2 gap-4">
                      <div className="form-group">
                        <label className="form-label text-xs">Province</label>
                        <select className="form-select" value={editingCustomer.province || ''} onChange={e => setEditingCustomer({...editingCustomer, province: e.target.value})}>
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
                      <div className="form-group">
                        <label className="form-label text-xs">Postal Code</label>
                        <input className="form-input" value={editingCustomer.postal_code || ''} onChange={e => setEditingCustomer({...editingCustomer, postal_code: e.target.value})} />
                      </div>
                   </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary lg" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary lg px-12">{editingCustomer.id ? 'Commit Updates' : 'Register Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
