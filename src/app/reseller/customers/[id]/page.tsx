'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';

export default function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingService, setAddingService] = useState(false);
  const [products, setProducts] = useState([]);
  
  // New service form
  const [newService, setNewService] = useState({
    product_id: '',
    service_name: '',
    credentials: { username: '', password: '', extra: '' }
  });

  useEffect(() => {
    fetchDetail();
    fetchProducts();
  }, [id]);

  async function fetchDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reseller/customers/${id}`);
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    const res = await fetch('/api/products?is_active=true');
    const d = await res.json();
    setProducts(d.products || []);
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/reseller/customers/${id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        setAddingService(false);
        fetchDetail();
      }
    } catch {}
  };

  if (loading) return <div className="p-20 text-center"><span className="spinner"></span></div>;
  if (!data?.customer) return <div className="p-20 text-center">Customer not found.</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Link href="/reseller/customers" className="text-brand text-xs mb-2 block">← Back to Customers</Link>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{data.customer.name}</h2>
          <p className="text-muted">Account Ref: {data.customer.account_number}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddingService(true)}>+ Add Service</button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card" style={{ padding: '20px' }}>
             <h4 className="font-bold mb-4">Contact Details</h4>
             <div className="space-y-3 text-sm">
                <div><label className="text-muted block text-[10px] font-bold uppercase">Email</label><span>{data.customer.email || 'N/A'}</span></div>
                <div><label className="text-muted block text-[10px] font-bold uppercase">Phone</label><span>{data.customer.phone || 'N/A'}</span></div>
                <div><label className="text-muted block text-[10px] font-bold uppercase">Address</label><span>{data.customer.address || 'N/A'}</span></div>
             </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Active Services & Credentials</h3>
          
          <div className="grid gap-4">
            {data.services?.map((s: any) => (
              <div key={s.id} className="card" style={{ padding: '20px', borderLeft: '4px solid var(--brand-primary)' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{s.service_name}</h4>
                    <span className="text-xs text-muted">Linked to: {s.product_name}</span>
                  </div>
                  <span className="badge badge-success">{s.status}</span>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4 p-4 bg-elevated rounded-lg border border-subtle">
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase block">Access Username</label>
                    <code className="text-brand font-bold">{s.credentials?.username || '---'}</code>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase block">Access Password</label>
                    <code>{s.credentials?.password || '---'}</code>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase block">Extra Details</label>
                    <span className="text-xs">{s.credentials?.extra || 'None'}</span>
                  </div>
                </div>
              </div>
            ))}
            {!data.services?.length && (
              <div className="p-20 border-2 border-dashed border-subtle rounded-xl text-center text-muted">
                 No active services found for this customer.
              </div>
            )}
          </div>
        </div>
      </div>

      {addingService && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Link New Service</h3>
              <button className="btn btn-icon" onClick={() => setAddingService(false)}>×</button>
            </div>
            <form onSubmit={handleAddService}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Base Product (from Catalog)</label>
                  <select 
                    className="form-select" 
                    required 
                    value={newService.product_id}
                    onChange={e => {
                      const p = products.find((x: any) => x.id === e.target.value) as any;
                      setNewService({...newService, product_id: e.target.value, service_name: p?.name || ''})
                    }}
                  >
                    <option value="">Select a product...</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Friendly Service Name (e.g. Home Fiber)</label>
                  <input className="form-input" required value={newService.service_name} onChange={e => setNewService({...newService, service_name: e.target.value})} />
                </div>
                <div className="pt-4 border-t border-subtle">
                   <h5 className="text-xs font-bold mb-3 uppercase text-muted">Access Credentials</h5>
                   <div className="grid-2">
                     <div className="form-group">
                       <label className="form-label">PPPoE / Login Username</label>
                       <input className="form-input" value={newService.credentials.username} onChange={e => setNewService({...newService, credentials: {...newService.credentials, username: e.target.value}})} />
                     </div>
                     <div className="form-group">
                       <label className="form-label">Password</label>
                       <input className="form-input" value={newService.credentials.password} onChange={e => setNewService({...newService, credentials: {...newService.credentials, password: e.target.value}})} />
                     </div>
                   </div>
                   <div className="form-group mt-3">
                     <label className="form-label">Special Notes / Credentials</label>
                     <input className="form-input" placeholder="Static IP, VLAN ID, etc." value={newService.credentials.extra} onChange={e => setNewService({...newService, credentials: {...newService.credentials, extra: e.target.value}})} />
                   </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAddingService(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Link Service to Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
