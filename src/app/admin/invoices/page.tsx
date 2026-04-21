'use client';

import { useEffect, useState } from 'react';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices(statusFilter);
  }, [statusFilter]);

  async function fetchInvoices(status = '') {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices${status ? `?status=${status}` : ''}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } finally {
      setLoading(false);
    }
  }

  const formatZAR = (val: any) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(parseFloat(val || 0));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Invoices & Billing</h2>
          <p className="text-muted">Manage system-generated billing documents and monitor payment statuses.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="form-select" 
            style={{ width: '200px' }} 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Invoices</option>
            <option value="unpaid">Awaiting Payment</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Reseller</th>
                <th>Ref Order</th>
                <th>Total (ZAR)</th>
                <th>Status</th>
                <th>Issuance / Due Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-mono" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{inv.invoice_number}</span>
                      {inv.is_recurring && <span className="text-xs text-muted badge-info" style={{ display: 'inline-block', width: 'fit-content' }}>Recurring Invoice</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: '600' }}>{inv.reseller_company}</span>
                      <span className="text-xs text-muted">{inv.reseller_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm text-secondary">{inv.order_number}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700' }}>{formatZAR(inv.total_amount)}</span>
                  </td>
                  <td>
                    <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'unpaid' ? 'badge-warning' : inv.status === 'overdue' ? 'badge-danger' : 'badge-muted'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm">Issued: {new Date(inv.issued_at).toLocaleDateString()}</span>
                      <span className={`text-xs ${inv.status === 'overdue' ? 'text-danger' : 'text-muted'}`}>
                        Due: {new Date(inv.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => window.print()}>
                      Print/PDF
                    </button>
                  </td>
                </tr>
              ))}
              {!invoices.length && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '64px' }} className="text-muted">
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div>
                    <p>No invoices found matching your conditions.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
