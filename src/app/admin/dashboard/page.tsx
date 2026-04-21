'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg"></div>
        <p>Loading Dashboard Stats...</p>
      </div>
    );
  }

  const formatZAR = (val: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(val);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Dashboard</h2>
          <p className="text-muted">Welcome back to the IPT One Telecoms management portal.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="btn btn-secondary">
            <span>+</span> Add Product
          </Link>
          <Link href="/admin/catalogs/new" className="btn btn-primary">
            <span>+</span> Create Catalog
          </Link>
        </div>
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--brand-gradient)', color: 'white' }}>💰</div>
          <div className="stat-card-value">{formatZAR(parseFloat(stats.total_revenue))}</div>
          <div className="stat-card-label">Total Revenue</div>
          <div className="stat-card-change positive">
            <span>↑</span> 12.5% vs last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>🛒</div>
          <div className="stat-card-value">{stats.total_orders}</div>
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-change positive">
            <span>↑</span> {stats.pending_orders} Pending
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>👥</div>
          <div className="stat-card-value">{stats.total_resellers}</div>
          <div className="stat-card-label">Active Resellers</div>
          <div className="stat-card-change">
            All registered partners
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>📦</div>
          <div className="stat-card-value">{stats.total_products}</div>
          <div className="stat-card-label">Managed Products</div>
          <div className="stat-card-change">
            Across {stats.total_catalogs} Catalogs
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <Link href="/admin/orders" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Reseller</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders?.map((order: any) => (
                  <tr key={order.id}>
                    <td className="font-mono">{order.order_number}</td>
                    <td>
                      <div className="flex flex-col">
                        <span>{order.reseller_name}</span>
                        <span className="text-xs text-muted">{order.reseller_company}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge order-status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatZAR(parseFloat(order.total_amount))}</td>
                    <td className="text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats.recent_orders?.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }} className="text-muted">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Catalog Distribution</h3>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p className="text-muted">Order status distribution:</p>
              <div className="flex flex-col gap-2 mt-4" style={{ textAlign: 'left' }}>
                {stats.orders_by_status?.map((item: any) => (
                  <div key={item.status} className="flex justify-between items-center bg-overlay p-2 rounded">
                    <span className="text-sm capitalize">{item.status}</span>
                    <span className={`badge order-status-${item.status}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
