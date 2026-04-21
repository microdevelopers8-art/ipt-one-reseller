'use client';

import { useEffect, useState } from 'react';

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch('/api/applications/admin');
      const data = await res.json();
      setApps(data.applications || []);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (id: string, status: string, message: string = '') => {
    try {
      const res = await fetch('/api/applications/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, message }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setReplyText('');
        fetchApplications();
      } else {
        alert('Failed to update application');
      }
    } catch (err) {
      alert('Error updating application');
    }
  };

  const viewApp = (app: any) => {
    setSelectedApp(app);
    setReplyText('');
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Reseller Applications</h2>
        <p className="text-muted">Review, request information, and approve new reseller accounts.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Applicant / Company</th>
                <th>Contact Email</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app: any) => (
                <tr key={app.id}>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{app.company_name}</span>
                      <span className="text-xs text-muted">{app.name}</span>
                    </div>
                  </td>
                  <td>{app.email}</td>
                  <td>
                    <span className={`badge ${app.application_status === 'pending' ? 'badge-warning' : app.application_status === 'info_requested' ? 'badge-info' : 'badge-danger'}`}>
                      {app.application_status === 'info_requested' ? 'Pending Reply' : app.application_status}
                    </span>
                  </td>
                  <td className="text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => viewApp(app)}>Review</button>
                  </td>
                </tr>
              ))}
              {!apps.length && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px' }} className="text-muted">
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎉</div>
                    <p>No pending applications to review.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedApp && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Application Review: {selectedApp.company_name}</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="grid-2 bg-overlay p-4 rounded mb-6">
                <div>
                  <p className="text-xs text-muted uppercase mb-1">Applicant Name</p>
                  <p style={{ fontWeight: '600' }}>{selectedApp.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase mb-1">Email</p>
                  <p style={{ fontWeight: '600' }}>{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase mb-1">Company Reg</p>
                  <p className="font-mono">{selectedApp.application_details?.company_registration || 'Not Provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase mb-1">VAT Number</p>
                  <p className="font-mono">{selectedApp.application_details?.vat_number || 'Not Provided'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="text-xs text-muted uppercase mb-1 mt-2">Address</p>
                  <p>{selectedApp.application_details?.address || 'Not Provided'}</p>
                </div>
              </div>

              <h4 style={{ fontWeight: '700', marginBottom: '16px' }}>Communication Log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {!selectedApp.application_messages || selectedApp.application_messages.length === 0 ? (
                  <p className="text-muted text-sm">No messages yet.</p>
                ) : (
                  selectedApp.application_messages.map((msg: any, i: number) => (
                    <div key={i} style={{ 
                      background: msg.sender !== 'admin' ? 'var(--bg-elevated)' : 'var(--brand-secondary)', 
                      color: msg.sender !== 'admin' ? 'var(--text-primary)' : '#fff',
                      padding: '12px', borderRadius: '8px', fontSize: '14px' 
                    }}>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>
                        {msg.sender === 'admin' ? 'You' : 'Applicant'} • {new Date(msg.timestamp).toLocaleString()}
                      </div>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="divider mb-6"></div>
              
              <div className="form-group">
                <label className="form-label">Send Message / Request Docs</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  placeholder="Type any questions or required documents here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <p className="text-xs text-muted mt-2">If you approve or reject, this message will be attached as final notes.</p>
              </div>

            </div>
            
            <div className="modal-footer flexjustify-between">
              <div>
                <button className="btn btn-secondary mr-2" onClick={() => handleUpdate(selectedApp.id, 'info_requested', replyText)}>
                  Ask for Info
                </button>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-danger" onClick={() => handleUpdate(selectedApp.id, 'rejected', replyText)}>
                  Reject
                </button>
                <button className="btn btn-success" onClick={() => handleUpdate(selectedApp.id, 'approved', replyText)}>
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
