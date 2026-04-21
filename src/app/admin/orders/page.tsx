'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          viewOrder(orderId);
        }
      }
    } catch (err) {}
  };

  const viewOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      setSelectedOrder(data);
      setIsModalOpen(true);
    } catch (err) {}
  };

  const formatZAR = (val: any) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(parseFloat(val));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Order Management</h2>
        <p className="text-muted">Process and track all reseller orders through the lifecycle.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Reseller</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="font-mono" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{order.order_number}</td>
                  <td>
                    <div className="flex flex-col">
                      <span>{order.reseller_name}</span>
                      <span className="text-xs text-muted">{order.reseller_company}</span>
                    </div>
                  </td>
                  <td>{formatZAR(order.total_amount)}</td>
                  <td>
                    <span className={`badge order-status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-xs">{new Date(order.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => viewOrder(order.id)}>Manage</button>
                  </td>
                </tr>
              ))}
              {!orders.length && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px' }} className="text-muted">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Order Details: {selectedOrder.order.order_number}</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2 mb-6">
                <div>
                  <h4 className="text-xs uppercase text-muted mb-2">Reseller Information</h4>
                  <p style={{ fontWeight: '700' }}>{selectedOrder.order.reseller_name}</p>
                  <p className="text-sm">{selectedOrder.order.reseller_company}</p>
                  <p className="text-sm text-secondary">{selectedOrder.order.reseller_email}</p>
                  <p className="text-sm text-secondary">{selectedOrder.order.reseller_phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 className="text-xs uppercase text-muted mb-2">Status Management</h4>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`badge order-status-${selectedOrder.order.status}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                      {selectedOrder.order.status}
                    </span>
                    <select
                      className="form-select"
                      style={{ width: '200px' }}
                      value={selectedOrder.order.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirm Order</option>
                      <option value="processing">Start Processing</option>
                      <option value="provisioning">Provisioning / Shipping</option>
                      <option value="completed">Complete Order</option>
                      <option value="cancelled">Cancel Order</option>
                      <option value="on_hold">Put on Hold</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="table">
                  <thead style={{ background: 'var(--bg-elevated)' }}>
                    <tr>
                      <th style={{ paddingLeft: '20px' }}>Item</th>
                      <th>Catalog</th>
                      <th>Quantity</th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item: any) => (
                      <tr key={item.id}>
                        <td style={{ paddingLeft: '20px' }}>
                          <div className="flex flex-col">
                            <span style={{ fontWeight: '600' }}>{item.product_name}</span>
                            <span className="text-xs text-muted">SKU: {item.product_sku}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: `${item.catalog_color}20`, color: item.catalog_color }}>
                            {item.catalog_name}
                          </span>
                        </td>
                        <td>{item.quantity}</td>
                        <td style={{ textAlign: 'right', paddingRight: '20px', fontWeight: '700' }}>{formatZAR(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', padding: '16px' }}>Subtotal</td>
                      <td style={{ textAlign: 'right', padding: '16px 20px' }}>{formatZAR(selectedOrder.order.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', padding: '0 16px 16px' }}>VAT (15%)</td>
                      <td style={{ textAlign: 'right', padding: '0 20px 16px' }}>{formatZAR(selectedOrder.order.tax_amount)}</td>
                    </tr>
                    <tr style={{ background: 'var(--bg-elevated)' }}>
                      <td colSpan={3} style={{ textAlign: 'right', padding: '16px', fontWeight: '800', color: 'var(--brand-secondary)' }}>Grand Total</td>
                      <td style={{ textAlign: 'right', padding: '16px 20px', fontWeight: '800', color: 'var(--brand-secondary)', fontSize: '18px' }}>
                        {formatZAR(selectedOrder.order.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedOrder.order.notes && (
                <div className="mt-4 p-4 bg-elevated rounded">
                  <h4 className="text-xs uppercase text-muted mb-1">Reseller Notes:</h4>
                  <p className="text-sm">{selectedOrder.order.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>Print Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
