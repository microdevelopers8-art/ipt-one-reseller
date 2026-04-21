'use client';

import { useEffect, useState } from 'react';

export default function ResellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  const formatZAR = (val: any) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(parseFloat(val));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>My Orders</h2>
        <p className="text-muted">Track your hardware purchases and service subscriptions.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placement Date</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="font-mono" style={{ fontWeight: '700' }}>{order.order_number}</td>
                  <td>{formatZAR(order.total_amount)}</td>
                  <td>
                    <span className={`badge order-status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                    <span className="text-xs text-muted ml-2">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary">View Details</button>
                  </td>
                </tr>
              ))}
              {!orders.length && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '64px' }} className="text-muted">
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                    <p>You haven't placed any orders yet.</p>
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
