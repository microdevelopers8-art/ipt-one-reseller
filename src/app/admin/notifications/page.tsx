'use client';

import { useEffect, useState } from 'react';

export default function NotificationsManager() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingNotification({
      title: '',
      message: '',
      type: 'info',
      expires_at: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (notif: any) => {
    // Format date for input
    const formattedDate = notif.expires_at ? new Date(notif.expires_at).toISOString().split('T')[0] : '';
    setEditingNotification({ ...notif, expires_at: formattedDate });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) fetchNotifications();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingNotification.id ? 'PUT' : 'POST';
    const url = editingNotification.id ? `/api/notifications/${editingNotification.id}` : '/api/notifications';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingNotification),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchNotifications();
      }
    } catch (err) {
      alert('Save failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Broadcasting & Notifications</h2>
          <p className="text-muted">Create announcements that appear on the Reseller dashboard.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>+ Create Notification</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n: any) => (
                <tr key={n.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{n.title}</div>
                    <div className="text-xs text-muted" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${n.type === 'info' ? 'primary' : n.type === 'warning' ? 'warning' : 'danger'}`}>
                      {n.type.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${n.is_active ? 'success' : 'muted'}`}>
                      {n.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {n.expires_at ? new Date(n.expires_at).toLocaleDateString() : <span className="text-muted">Never</span>}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(n)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!notifications.length && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px' }} className="text-muted">No notifications broadcasted.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingNotification.id ? 'Edit' : 'Create'} Notification</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={editingNotification.title} onChange={e => setEditingNotification({ ...editingNotification, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-textarea" required rows={4} value={editingNotification.message} onChange={e => setEditingNotification({ ...editingNotification, message: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={editingNotification.type} onChange={e => setEditingNotification({ ...editingNotification, type: e.target.value })}>
                      <option value="info">Information (Blue)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="danger">Urgent / Alert (Red)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-input" value={editingNotification.expires_at} onChange={e => setEditingNotification({ ...editingNotification, expires_at: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={editingNotification.is_active} onChange={e => setEditingNotification({ ...editingNotification, is_active: e.target.checked })} />
                    Broadcast is Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
