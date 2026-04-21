'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResellersPage() {
  const [activeTab, setActiveTab] = useState<'operational' | 'applications'>('operational');
  const [resellers, setResellers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  // Application Review
  const [reviewApp, setReviewApp] = useState<any>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Governance Modals
  const [suspensionUser, setSuspensionUser] = useState<any>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [deactivateUser, setDeactivateUser] = useState<any>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  useEffect(() => {
    if (activeTab === 'operational') {
      fetchResellers();
    } else {
      fetchApplications();
    }
  }, [activeTab, search, statusFilter]);

  async function fetchResellers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('role', 'reseller');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setResellers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch('/api/applications/admin');
      const data = await res.json();
      setApplications(data.applications || []);
    } finally {
      setLoading(false);
    }
  }

  const handleApplicationAction = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/applications/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, message: adminMessage })
      });
      if (res.ok) {
        setReviewApp(null);
        setAdminMessage('');
        fetchApplications();
        if (status === 'approved') fetchResellers();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReseller({
      name: '', email: '', password: '', role: 'reseller',
      company_name: '', phone: '', address: '', is_active: true,
      mobile_number: '', whatsapp_number: '', street_address: '',
      suburb: '', city: '', province: '', postal_code: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingReseller({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingReseller.id ? 'PUT' : 'POST';
    const url = editingReseller.id ? `/api/users/${editingReseller.id}` : '/api/users';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReseller),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchResellers();
      }
    } catch {}
  };

  const handleToggleSuspension = async () => {
    if (!suspensionUser) return;
    try {
      const currentlySuspended = suspensionUser.is_suspended;
      await fetch(`/api/users/${suspensionUser.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_suspended: !currentlySuspended, suspension_reason: !currentlySuspended ? suspensionReason : null })
      });
      setSuspensionUser(null);
      fetchResellers();
    } catch {}
  };

  const handleToggleDeactivation = async () => {
    if (!deactivateUser) return;
    try {
      const currentlyActive = deactivateUser.is_active;
      await fetch(`/api/users/${deactivateUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...deactivateUser, 
          is_active: !currentlyActive, 
          deactivation_reason: !currentlyActive ? deactivationReason : null 
        })
      });
      setDeactivateUser(null);
      setDeactivationReason('');
      fetchResellers();
    } catch {}
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Reseller Partner Management</h2>
          <p className="text-muted">Lifecycle management and governance for wholesale accounts.</p>
        </div>
        <div className="flex gap-2">
           <button className={`btn ${activeTab === 'operational' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('operational')}>Operational Partners</button>
           <button className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('applications')}>
             Application Queue {applications.length > 0 && <span className="badge badge-danger ml-2">{applications.length}</span>}
           </button>
        </div>
      </div>

      {activeTab === 'operational' ? (
        <>
          <div className="card mb-6" style={{ padding: '16px' }}>
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-4 items-center flex-1">
                <div style={{ flex: 1, position: 'relative' }}>
                   <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                   <input type="text" className="form-input" style={{ paddingLeft: '36px' }} placeholder="Filter by Partner, Email or A/C..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ width: '220px' }}>
                  <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Status: All Accounts</option>
                    <option value="active">Operational Only</option>
                    <option value="inactive">Deactivated Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleAdd}><span>+</span> Direct Provisioning</button>
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Partner Intelligence</th>
                    <th>Governance Status</th>
                    <th>Administration</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="text-center p-10"><div className="spinner"></div></td></tr>
                  ) : resellers.length === 0 ? (
                    <tr><td colSpan={3} className="text-center p-10">No operational partners found.</td></tr>
                  ) : resellers.map((r: any) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold">{r.company_name}</span>
                          <span className="text-xs text-brand font-mono">{r.account_number}</span>
                          <span className="text-xs text-muted">{r.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                           {r.is_active ? <span className="badge badge-success">ACTIVE</span> : <span className="badge badge-danger">DEACTIVATED</span>}
                           {r.is_suspended && <span className="badge badge-warning">SUSPENDED</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-primary" onClick={() => router.push(`/admin/resellers/${r.id}`)}>Intelligence</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(r)}>Edit</button>
                          <button className={`btn btn-sm ${r.is_suspended ? 'btn-success' : 'btn-danger'}`} onClick={() => { setSuspensionUser(r); setSuspensionReason(r.suspension_reason || ''); }}>
                            {r.is_suspended ? 'Lift' : 'Suspend'}
                          </button>
                          <button className={`btn btn-sm ${r.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => { setDeactivateUser(r); setDeactivationReason(r.deactivation_reason || ''); }}>
                            {r.is_active ? 'Block' : 'Restore'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
           <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant Details</th>
                    <th>Current Status</th>
                    <th>Submitted</th>
                    <th>Governance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center p-10"><div className="spinner"></div></td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-10">No pending applications at this time.</td></tr>
                  ) : applications.map((app: any) => (
                    <tr key={app.id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold">{app.company_name}</span>
                          <span className="text-xs text-muted">{app.name} ({app.email})</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          app.application_status === 'pending' ? 'badge-warning' :
                          app.application_status === 'review' ? 'badge-info' : 'badge-danger'
                        }`}>{app.application_status.toUpperCase()}</span>
                      </td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => setReviewApp(app)}>Review Application</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* APPLICATION REVIEW MODAL */}
      {reviewApp && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Partnership Application: {reviewApp.company_name}</h3>
              <button className="btn btn-icon" onClick={() => setReviewApp(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2 gap-8 mb-6">
                 <div>
                   <h4 className="text-xs font-bold uppercase text-muted mb-2">Corporate Profile</h4>
                   <div className="space-y-1">
                     <p><strong>Company:</strong> {reviewApp.company_name}</p>
                     <p><strong>Contact:</strong> {reviewApp.name}</p>
                     <p><strong>Email:</strong> {reviewApp.email}</p>
                     <p><strong>Phone:</strong> {reviewApp.phone}</p>
                   </div>
                 </div>
                 <div>
                   <h4 className="text-xs font-bold uppercase text-muted mb-2">Application Meta</h4>
                   <div className="space-y-1">
                     <p><strong>Status:</strong> <span className="badge badge-warning">{reviewApp.application_status}</span></p>
                     <p><strong>Applied:</strong> {new Date(reviewApp.created_at).toLocaleString()}</p>
                   </div>
                 </div>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Administrator Feedback / Internal Notes</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="Enter message for applicant or internal notes..." 
                  value={adminMessage} 
                  onChange={e => setAdminMessage(e.target.value)} 
                />
              </div>
            </div>
            <div className="modal-footer flex justify-between">
              <div className="flex gap-2">
                <button className="btn btn-danger" disabled={actionLoading} onClick={() => handleApplicationAction(reviewApp.id, 'rejected')}>Reject Application</button>
                <button className="btn btn-secondary" disabled={actionLoading} onClick={() => handleApplicationAction(reviewApp.id, 'review')}>Request More Info</button>
              </div>
              <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleApplicationAction(reviewApp.id, 'approved')}>
                {actionLoading ? 'Provisioning...' : 'Approve & Activate Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPENSION MODAL */}
      {suspensionUser && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3>{suspensionUser.is_suspended ? 'Lift Suspension' : 'Account Suspension'}</h3></div>
            <div className="modal-body">
              {!suspensionUser.is_suspended && (
                <div className="form-group"><label className="form-label font-bold">Suspension Justification</label><textarea className="form-input" rows={3} value={suspensionReason} onChange={e => setSuspensionReason(e.target.value)} required /></div>
              )}
            </div>
            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={() => setSuspensionUser(null)}>Cancel</button>
               <button className={`btn ${suspensionUser.is_suspended ? 'btn-success' : 'btn-danger'}`} onClick={handleToggleSuspension}>Apply Governance</button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATION MODAL */}
      {deactivateUser && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3>{deactivateUser.is_active ? 'Critical: Deactivate' : 'Account Restoration'}</h3></div>
            <div className="modal-body space-y-4">
              {deactivateUser.is_active ? (
                <>
                  <div className="form-group">
                    <label className="form-label font-bold">Rescission Rationale *</label>
                    <textarea className="form-input" rows={3} value={deactivationReason} onChange={e => setDeactivationReason(e.target.value)} required placeholder="Reason for deactivating access..." />
                  </div>
                  <div className="alert alert-error text-xs">This will immediately block all portal access for {deactivateUser.company_name}.</div>
                </>
              ) : (
                <p>Verify restoration of login credentials for this partner?</p>
              )}
            </div>
            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={() => setDeactivateUser(null)}>Cancel</button>
               <button className={`btn ${deactivateUser.is_active ? 'btn-danger' : 'btn-success'}`} onClick={handleToggleDeactivation}>Commit Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isModalOpen && editingReseller && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header"><h3>Partner Corporate Data</h3><button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body grid-2 gap-x-8 gap-y-4">
                 <div className="form-group"><label className="form-label font-bold">Company Name</label><input className="form-input" value={editingReseller.company_name || ''} onChange={e => setEditingReseller({...editingReseller, company_name: e.target.value})} required /></div>
                 <div className="form-group"><label className="form-label font-bold">Primary Email</label><input className="form-input" type="email" value={editingReseller.email || ''} onChange={e => setEditingReseller({...editingReseller, email: e.target.value})} required /></div>
                 <div className="form-group"><label className="form-label font-bold">Contact Person</label><input className="form-input" value={editingReseller.name || ''} onChange={e => setEditingReseller({...editingReseller, name: e.target.value})} required /></div>
                 <div className="form-group"><label className="form-label font-bold">Password {!editingReseller.id ? '(Required)' : '(Leave blank to keep)'}</label><input className="form-input" type="password" value={editingReseller.password || ''} onChange={e => setEditingReseller({...editingReseller, password: e.target.value})} required={!editingReseller.id} /></div>
                 
                 <div className="form-group"><label className="form-label font-bold">Mobile Number</label><input className="form-input" value={editingReseller.mobile_number || ''} onChange={e => setEditingReseller({...editingReseller, mobile_number: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label font-bold">WhatsApp Number</label><input className="form-input" value={editingReseller.whatsapp_number || ''} onChange={e => setEditingReseller({...editingReseller, whatsapp_number: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label font-bold">Office Landline</label><input className="form-input" value={editingReseller.phone || ''} onChange={e => setEditingReseller({...editingReseller, phone: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label font-bold">Street Address</label><input className="form-input" value={editingReseller.street_address || ''} onChange={e => setEditingReseller({...editingReseller, street_address: e.target.value})} /></div>
                 
                 <div className="form-group"><label className="form-label font-bold">Suburb</label><input className="form-input" value={editingReseller.suburb || ''} onChange={e => setEditingReseller({...editingReseller, suburb: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label font-bold">City/Town</label><input className="form-input" value={editingReseller.city || ''} onChange={e => setEditingReseller({...editingReseller, city: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label font-bold">Province</label><input className="form-input" value={editingReseller.province || ''} onChange={e => setEditingReseller({...editingReseller, province: e.target.value})} /></div>
                 <div className="form-group"><label className="form-label font-bold">Postal Code</label><input className="form-input" value={editingReseller.postal_code || ''} onChange={e => setEditingReseller({...editingReseller, postal_code: e.target.value})} /></div>
              </div>
              <div className="modal-footer"><button type="submit" className="btn btn-primary w-full">Synchronize Partner Metadata</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
