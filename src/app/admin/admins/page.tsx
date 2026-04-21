'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      // Fetch both admins and super_admins. We fetch all users and filter locally for simplicity,
      // or fetch them via two requests if API doesn't support multiple roles.
      const res = await fetch('/api/users');
      const data = await res.json();
      const adminUsers = (data.users || []).filter((u: any) => u.role === 'admin' || u.role === 'super_admin');
      setAdmins(adminUsers);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingAdmin({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      company_name: 'IPT One Telecoms',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    // When editing, do not set the password by default to avoid overwriting unless provided
    setEditingAdmin({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingAdmin.id ? 'PUT' : 'POST';
    const url = editingAdmin.id ? `/api/users/${editingAdmin.id}` : '/api/users';

    // If editing and password is empty, remove it from payload
    const payload = { ...editingAdmin };
    if (editingAdmin.id && !payload.password) {
      delete payload.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchAdmins();
      } else {
        alert(data.error || 'Failed to save admin account');
      }
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string, role: string) => {
    if (role === 'super_admin') {
      alert('Super Admins cannot be deleted from the interface.');
      return;
    }
    if (!confirm('Are you sure you want to deactivate this admin?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdmins();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Administrative Users</h2>
          <p className="text-muted">Manage internal system administrators for IPT One Telecoms.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}><span>+</span> Add Admin</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name / Email</th>
                <th>Role</th>
                <th>Role Context</th>
                <th>Status</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: any) => (
                <tr key={admin.id}>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{admin.name}</span>
                      <span className="text-xs text-muted">{admin.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${admin.role === 'super_admin' ? 'badge-primary' : 'badge-info'}`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm">{admin.company_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${admin.is_active ? 'success' : 'danger'}`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-xs">{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(admin)}>Edit</button>
                      {admin.role !== 'super_admin' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(admin.id, admin.role)}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!admins.length && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px' }} className="text-muted">No administrative users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingAdmin && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingAdmin.id ? 'Edit' : 'Add'} Admin Account</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={editingAdmin.name} onChange={e => setEditingAdmin({...editingAdmin, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" className="form-input" required value={editingAdmin.email} onChange={e => setEditingAdmin({...editingAdmin, email: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password {editingAdmin.id && <span className="text-xs font-normal text-muted">(Leave blank to keep unchanged)</span>}</label>
                  <input type="password" minLength={6} className="form-input" required={!editingAdmin.id} value={editingAdmin.password} onChange={e => setEditingAdmin({...editingAdmin, password: e.target.value})} placeholder={editingAdmin.id ? '**********' : 'Enter a strong password'} />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Access Level</label>
                    <select className="form-select" value={editingAdmin.role} onChange={e => setEditingAdmin({...editingAdmin, role: e.target.value})}>
                      <option value="admin">Admin (Standard)</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                    <label className="form-label mb-0" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={editingAdmin.is_active} onChange={e => setEditingAdmin({...editingAdmin, is_active: e.target.checked})} />
                      Account is Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
