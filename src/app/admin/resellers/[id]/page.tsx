'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ResellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reseller, setReseller] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states for Customer Service / Credentials
  const [activeCustomer, setActiveCustomer] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchResellerData();
    }
  }, [params.id]);

  async function fetchResellerData() {
    setLoading(true);
    try {
      const [resRes, custRes] = await Promise.all([
        fetch(`/api/users/${params.id}`),
        fetch(`/api/admin/reseller-customers?reseller_id=${params.id}`)
      ]);
      const resData = await resRes.json();
      const custData = await custRes.json();
      setReseller(resData.user);
      setCustomers(custData.customers || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomerServices(customerId: string) {
    const res = await fetch(`/api/admin/customer-services?customer_id=${customerId}`);
    const data = await res.json();
    setServices(data.services || []);
  }

  const handleViewCustomer = (customer: any) => {
    setActiveCustomer(customer);
    fetchCustomerServices(customer.id);
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/customer-services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: editingService.credentials })
      });
      if (res.ok) {
        setEditingService(null);
        fetchCustomerServices(activeCustomer.id);
      }
    } catch {}
  };

  if (loading) return <div className="loading-spinner">Loading Representative Data...</div>;
  if (!reseller) return <div className="p-8">Partner profile not found.</div>;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div>
          <button className="btn btn-sm btn-secondary mb-4" onClick={() => router.back()}>← Back to Fleet Management</button>
          <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>{reseller.company_name}</h2>
          <div className="flex gap-4 mt-2">
            <span className="badge badge-primary font-mono">A/C: {reseller.account_number}</span>
            <span className={`badge ${reseller.is_active ? 'badge-success' : 'badge-danger'}`}>
              {reseller.is_active ? 'OPERATIONAL' : 'DEACTIVATED'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="btn btn-secondary">Download Statement</button>
           <button className="btn btn-primary">Edit Credentials</button>
        </div>
      </div>

      <div className="grid-2">
        {/* RESELLER PROFILE CARD */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Corporate Intelligence Profile</h3></div>
          <div className="space-y-6">
            <div className="grid-2 gap-y-6">
              <div><label className="text-xs uppercase text-muted font-bold">Contact Person</label><div className="font-bold">{reseller.name}</div></div>
              <div><label className="text-xs uppercase text-muted font-bold">Corporate Email</label><div className="font-mono">{reseller.email}</div></div>
              <div><label className="text-xs uppercase text-muted font-bold">Mobile Number</label><div>{reseller.mobile_number || 'N/A'}</div></div>
              <div><label className="text-xs uppercase text-muted font-bold">WhatsApp Identity</label><div>{reseller.whatsapp_number || 'N/A'}</div></div>
              <div><label className="text-xs uppercase text-muted font-bold">Landline Phone</label><div>{reseller.phone || 'N/A'}</div></div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
              <label className="text-xs uppercase text-muted font-bold block mb-2">Registered Address</label>
              <div className="text-sm leading-relaxed">
                {reseller.street_address ? (
                  <>
                    {reseller.street_address}<br/>
                    {reseller.suburb}, {reseller.city}<br/>
                    {reseller.province}, {reseller.postal_code}
                  </>
                ) : reseller.address || 'Address not indexed.'}
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS BRIEF */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Fleet Statistics</h3></div>
          <div className="grid-2 gap-4">
             <div style={{ padding: '24px', background: 'var(--info-bg)', borderRadius: '16px', textAlign: 'center' }}>
               <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--brand-secondary)' }}>{customers.length}</div>
               <div className="text-xs uppercase font-bold text-muted">Active Customers</div>
             </div>
             <div style={{ padding: '24px', background: 'var(--success-bg)', borderRadius: '16px', textAlign: 'center' }}>
               <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--success)' }}>R 0.00</div>
               <div className="text-xs uppercase font-bold text-muted">Gross Revenue</div>
             </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER LIST */}
      <div className="card">
        <div className="card-header">
           <h3 className="card-title">Managed End-User Portfolio</h3>
           <span className="text-xs text-muted font-bold uppercase">{customers.length} Accounts Indexed</span>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>End-User Account</th>
                <th>Contact Channels</th>
                <th>A/C Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id}>
                  <td><span className="font-bold">{c.name}</span></td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-xs">{c.email}</span>
                      <span className="text-xs text-muted">{c.phone}</span>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs">{c.account_number}</span></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleViewCustomer(c)}>Manage Services</button>
                  </td>
                </tr>
              ))}
              {!customers.length && <tr><td colSpan={4} className="text-center p-12 text-muted">No associated end-user accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER SERVICE MODAL */}
      {activeCustomer && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{activeCustomer.name}</h3>
                <p className="text-xs text-muted uppercase font-bold">Service Provisioning Manager</p>
              </div>
              <button className="btn btn-icon" onClick={() => setActiveCustomer(null)}>×</button>
            </div>
            <div className="modal-body space-y-6">
               <div className="grid-3 gap-4">
                  <div className="p-4 bg-elevated rounded">
                    <label className="text-xs uppercase text-muted font-bold">Total Services</label>
                    <div className="text-xl font-bold">{services.length}</div>
                  </div>
                  <div className="p-4 bg-elevated rounded">
                    <label className="text-xs uppercase text-muted font-bold">Status</label>
                    <div className="text-success font-bold">Healthy</div>
                  </div>
               </div>

               <div className="card">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Deployed Service</th>
                        <th>Credentials</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s: any) => (
                        <tr key={s.id}>
                          <td><span className="font-bold">{s.service_name}</span></td>
                          <td>
                            <div className="p-2 bg-base rounded font-mono text-xs overflow-hidden" style={{ maxWidth: '200px' }}>
                              {s.credentials || 'No Data'}
                            </div>
                          </td>
                          <td><span className="badge badge-success">ACTIVE</span></td>
                          <td>
                            <button className="btn btn-sm btn-primary" onClick={() => setEditingService(s)}>Edit Security</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CREDENTIALS MODAL */}
      {editingService && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header"><h3>Security Override: {editingService.service_name}</h3></div>
            <form onSubmit={handleUpdateCredentials}>
               <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Access Credentials / Technical Details</label>
                    <textarea className="form-textarea font-mono" rows={8} value={editingService.credentials || ''} onChange={e => setEditingService({...editingService, credentials: e.target.value})} />
                  </div>
               </div>
               <div className="modal-footer">
                 <button type="button" className="btn btn-secondary" onClick={() => setEditingService(null)}>Cancel</button>
                 <button type="submit" className="btn btn-primary">Synchronize Credentials</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
