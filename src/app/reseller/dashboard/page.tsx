'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResellerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, notifRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/notifications?active=true')
        ]);
        const statsData = await statsRes.json();
        const notifData = await notifRes.json();
        setStats(statsData);
        
        const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
        const filtered = (notifData.notifications || []).filter((n: any) => !dismissed.includes(n.id));
        setNotifications(filtered);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const dismissNotification = (id: string) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissed));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  const formatZAR = (val: any) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(parseFloat(val || 0));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Reseller Dashboard</h2>
            <p className="text-muted">Overview of your account and ordering activity.</p>
          </div>
          {stats?.account_number && (
            <div style={{ 
              background: 'var(--brand-gradient)', 
              padding: '6px 16px', 
              borderRadius: '20px', 
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>Account ID</span>
              <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>{stats.account_number}</span>
            </div>
          )}
        </div>
        <Link href="/reseller/shop" className={`btn ${stats?.is_suspended ? 'btn-secondary' : 'btn-primary'}`} style={{ opacity: stats?.is_suspended ? 0.6 : 1 }}>
          {stats?.is_suspended ? 'Shop Access Restricted' : 'Purchase Products & Services'}
        </Link>
      </div>

      {/* CRITICAL SUSPENSION ALERT */}
      {stats?.is_suspended && (
        <div style={{ 
          padding: '24px', 
          borderRadius: 'var(--radius-lg)', 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
          border: '1px solid var(--danger)',
          marginBottom: '24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '40px' }}>🔐</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>
              Account Services Suspended
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.6' }}>
              Your account has been restricted by administration. New order placement is currently blocked.
            </p>
            <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
               <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reason for Suspension:</span>
               <div style={{ fontSize: '14px', marginTop: '4px' }}>{stats.suspension_reason || 'Administrative Review in progress.'}</div>
            </div>
          </div>
          <Link href="/reseller/support" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>Contact Support</Link>
        </div>
      )}

      {notifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {notifications.map((n: any) => (
            <div key={n.id} style={{ 
              padding: '16px 20px', borderRadius: 'var(--radius-md)', 
              background: n.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : n.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 163, 255, 0.1)',
              border: `1px solid ${n.type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : n.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 163, 255, 0.2)'}`,
              borderLeft: `4px solid ${n.type === 'danger' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#00a3ff'}`,
              display: 'flex', gap: '16px', alignItems: 'flex-start'
            }}>
              <div style={{ fontSize: '20px' }}>{n.type === 'danger' ? '🚨' : n.type === 'warning' ? '⚠️' : '📢'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{n.title}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{n.message}</div>
              </div>
              <button onClick={() => dismissNotification(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.5 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--brand-gradient)', color: 'white' }}>💼</div>
          <div className="stat-card-value font-mono">{formatZAR(stats.total_spent)}</div>
          <div className="stat-card-label">Total Expenditure</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>📦</div>
          <div className="stat-card-value">{stats.total_orders}</div>
          <div className="stat-card-label">Orders Placed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🛒</div>
          <div className="stat-card-value">{stats.cart_items}</div>
          <div className="stat-card-label">Items in Cart</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Orders</h3>
          <Link href="/reseller/orders" className="btn btn-sm btn-secondary">View History</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders?.map((order: any) => (
                <tr key={order.id}>
                  <td className="font-mono">{order.order_number}</td>
                  <td><span className={`badge order-status-${order.status}`}>{order.status}</span></td>
                  <td>{formatZAR(order.total_amount)}</td>
                  <td className="text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
