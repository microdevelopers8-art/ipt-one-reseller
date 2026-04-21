'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCart();
    fetchCustomers();
  }, []);

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    const res = await fetch('/api/reseller/customers');
    const data = await res.json();
    setCustomers(data.customers || []);
  }

  const updateQty = async (productId: string, newQty: number) => {
    if (newQty < 0) return;
    try {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: newQty }),
      });
      fetchCart();
    } catch (err) {}
  };

  const removeItem = async (productId: string) => {
    try {
      await fetch(`/api/cart?product_id=${productId}`, { method: 'DELETE' });
      fetchCart();
    } catch (err) {}
  };

  const placeOrder = async () => {
    if (!selectedCustomerId) {
       alert('Please select a customer to proceed with this order.');
       return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          items: items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity, notes: '', selected_options: i.selected_options })),
          notes: notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Order ${data.order_number} successfully provisioned!`);
        router.push('/reseller/orders');
      } else {
        alert(data.error || 'Failed to place order');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // FINANCES & PRORATA ENGINE
  const getProrataDetails = () => {
    const now = new Date();
    const day = now.getDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const remainingDays = daysInMonth - day + 1;
    const factor = remainingDays / daysInMonth;
    const after25th = day > 25;
    return { factor, after25th, day, daysInMonth, remainingDays };
  };

  const prorata = getProrataDetails();
  
  const onceOffTotal = items.filter((i: any) => !i.is_recurring).reduce((sum, i: any) => sum + (i.quantity * parseFloat(i.unit_price)), 0);
  const monthlyRecurringTotal = items.filter((i: any) => i.is_recurring).reduce((sum, i: any) => sum + (i.quantity * parseFloat(i.unit_price)), 0);
  
  const proratedRecurring = monthlyRecurringTotal * prorata.factor;
  
  // Total Due Now: (Once-off) + (Prorated Recurring) + (If after 25th: Next month recurring)
  const totalDueNow = onceOffTotal + proratedRecurring + (prorata.after25th ? monthlyRecurringTotal : 0);

  const formatZAR = (val: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(val);

  if (loading) return <div className="p-12 text-center opacity-50">Syncing secure cart...</div>;

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>Checkout Portfolio</h2>

      {!items.length ? (
        <div className="empty-state card py-20">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="font-bold">Portfolio is currently empty</h3>
          <p className="text-muted text-sm mb-6">Aggregate assets from the catalog to initialize an order.</p>
          <button className="btn btn-primary" onClick={() => router.push('/reseller/shop')}>Open Catalog</button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
          
          <div className="space-y-6">
            {/* Customer Attribution */}
            <div className="card" style={{ border: '2px solid' + (selectedCustomerId ? 'var(--border-subtle)' : 'var(--brand-primary)') }}>
               <h3 className="text-xs uppercase font-black text-muted mb-4 tracking-widest">1. Attribution & Entity</h3>
               <div className="form-group">
                 <label className="form-label font-bold">Select Portfolio Customer *</label>
                 <select 
                   className="form-select font-bold" 
                   required
                   value={selectedCustomerId} 
                   onChange={e => setSelectedCustomerId(e.target.value)}
                 >
                   <option value="">-- Choose Customer --</option>
                   {customers.map((c: any) => (
                     <option key={c.id} value={c.id}>{c.company_name || c.name} ({c.account_number})</option>
                   ))}
                 </select>
                 {!selectedCustomerId && <p className="text-[10px] text-brand mt-2 font-bold uppercase animate-pulse">Required to Place Order</p>}
               </div>
            </div>

            {/* Items List */}
            <div className="card p-0 overflow-hidden">
               <div className="px-6 py-4 bg-elevated border-b border-subtle">
                  <h3 className="text-xs uppercase font-black text-muted tracking-widest">2. Allocated Assets</h3>
               </div>
               <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '24px' }}>Asset / Service</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th style={{ paddingRight: '24px', textAlign: 'right' }}>Wholesale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.product_id}>
                        <td style={{ padding: '20px 24px' }}>
                          <div className="flex flex-col">
                            <span style={{ fontWeight: '800' }}>{item.product_name}</span>
                            <span className="text-[10px] font-mono opacity-50">SKU: {item.sku}</span>
                          </div>
                        </td>
                        <td>
                          {item.is_recurring ? (
                            <span className="badge badge-info text-[10px] uppercase font-black">Recurring</span>
                          ) : (
                            <span className="badge badge-muted text-[10px] uppercase font-black">Once-Off</span>
                          )}
                        </td>
                        <td>
                          <div className="quantity-control">
                            <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>-</button>
                            <input className="qty-input font-bold" value={item.quantity} readOnly />
                            <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                          </div>
                        </td>
                        <td style={{ paddingRight: '24px', textAlign: 'right', fontWeight: '800' }}>
                          {formatZAR(item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            </div>
          </div>

          {/* CHECKOUT FINANCE ENGINE */}
          <div className="flex flex-col gap-6 sticky top-4">
            <div className="card shadow-2xl" style={{ border: '1px solid var(--brand-primary)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs uppercase font-black text-brand tracking-widest">Financial Summary</h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-brand-primary/10 text-brand rounded">NO VAT</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-muted uppercase">
                  <span>Standard Assets</span>
                  <span className="text-primary">{formatZAR(onceOffTotal)}</span>
                </div>
                
                <div className="p-4 rounded-xl bg-elevated border border-subtle">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black uppercase">Recurring Portfolio</span>
                      <span className="font-bold">{formatZAR(monthlyRecurringTotal)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] text-muted font-bold">
                      <span>Prorata Factor ({prorata.remainingDays} days)</span>
                      <span>× {(prorata.factor * 100).toFixed(1)}%</span>
                   </div>
                   <div className="flex justify-between items-center mt-2 text-xs font-bold text-brand">
                      <span>Prorated Amount</span>
                      <span>{formatZAR(proratedRecurring)}</span>
                   </div>
                </div>

                {prorata.after25th && (
                  <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 animate-slide-up">
                     <div className="flex justify-between items-center text-xs font-bold text-warning uppercase">
                        <span>Advance Billing (Next Month)</span>
                        <span>{formatZAR(monthlyRecurringTotal)}</span>
                     </div>
                     <p className="text-[10px] mt-2 opacity-70">
                       Orders placed after the 25th include the first full month advance as per company policy.
                     </p>
                  </div>
                )}

                <div className="pt-4 border-t border-subtle">
                   <div className="flex justify-between items-center text-muted text-xs uppercase font-black mb-1">
                      <span>Monthly Total</span>
                      <span>{formatZAR(monthlyRecurringTotal)}</span>
                   </div>
                   <div className="flex justify-between items-center" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--brand-secondary)' }}>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-brand font-black uppercase tracking-tighter">Total Due Now</span>
                      </div>
                      <span>{formatZAR(totalDueNow)}</span>
                   </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="form-label text-xs uppercase font-black">Provisioning Notes</label>
                <textarea
                  className="form-textarea text-sm"
                  placeholder="Installation details or technical requirements..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ minHeight: '80px' }}
                ></textarea>
              </div>

              <button
                className="btn btn-primary btn-lg w-full mt-6 py-4 shadow-xl active:scale-95 transition-all"
                onClick={placeOrder}
                disabled={submitting || !selectedCustomerId}
                style={{ fontSize: '16px', fontWeight: 900 }}
              >
                {submitting ? 'COMMITTING...' : 'COMMIT ORDER'}
              </button>
              
              <p className="text-[10px] text-muted mt-4 text-center font-bold">
                PRORATED BILLING BASED ON {prorata.daysInMonth} DAY PROTOCOL
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
