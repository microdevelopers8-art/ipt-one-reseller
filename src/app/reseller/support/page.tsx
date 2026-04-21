'use client';

import { useEffect, useState } from 'react';

export default function ResellerSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: 'technical', priority: 'medium' });

  // View Modal (Conversation)
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(ticketId: string) {
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  const handleOpenTicket = (ticket: any) => {
    setActiveTicket(ticket);
    fetchMessages(ticket.id);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setIsNewModalOpen(false);
        setNewTicket({ subject: '', description: '', category: 'technical', priority: 'medium' });
        fetchTickets();
      }
    } catch {}
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      const res = await fetch(`/api/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage })
      });
      if (res.ok) {
        setReplyMessage('');
        fetchMessages(activeTicket.id);
      }
    } catch {}
  };

  const closeTicket = async (id: string) => {
    if (!confirm('Are you sure the issue is resolved and you want to close this ticket?')) return;
    await fetch(`/api/support/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' })
    });
    setActiveTicket(null);
    fetchTickets();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Support & Helpdesk</h2>
          <p className="text-muted">Communicate directly with our technical support team.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewModalOpen(true)}>
          + New Support Ticket
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t: any) => (
                <tr key={t.id}>
                  <td className="font-mono font-bold" style={{ color: 'var(--brand-primary)' }}>{t.ticket_number}</td>
                  <td><span className="font-semibold">{t.subject}</span></td>
                  <td><span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{t.category}</span></td>
                  <td>
                    <span className={`badge ${t.status === 'open' ? 'badge-info' : t.status === 'in_progress' ? 'badge-warning' : 'badge-success'}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: t.priority === 'critical' ? 'var(--danger)' : t.priority === 'high' ? 'var(--warning)' : 'inherit', fontWeight: 700 }}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="text-xs">{new Date(t.updated_at).toLocaleString()}</td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => handleOpenTicket(t)}>View Thread</button></td>
                </tr>
              ))}
              {!tickets.length && !loading && (
                <tr><td colSpan={7} className="text-center p-12 text-muted">No support tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW TICKET MODAL */}
      {isNewModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header"><h3>Open New Support Case</h3><button className="btn btn-icon" onClick={() => setIsNewModalOpen(false)}>×</button></div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body space-y-4">
                <div className="form-group"><label className="form-label font-bold">Subject *</label><input className="form-input" required value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} placeholder="Briefly describe the issue..." /></div>
                <div className="grid-2">
                   <div className="form-group">
                     <label className="form-label">Category</label>
                     <select className="form-select" value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Account</option>
                        <option value="sales">Sales / Orders</option>
                        <option value="general">General Inquiry</option>
                     </select>
                   </div>
                   <div className="form-group">
                     <label className="form-label">Priority</label>
                     <select className="form-select" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                     </select>
                   </div>
                </div>
                <div className="form-group"><label className="form-label font-bold">Detailed Description *</label><textarea className="form-textarea" rows={6} required value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} placeholder="Please provide all relevant details..." /></div>
              </div>
              <div className="modal-footer"><button type="submit" className="btn btn-primary w-full">Submit Support Request</button></div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERSATION MODAL (SIDE DRAWER STYLE) */}
      {activeTicket && (
        <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '0' }}>
          <div className="modal animate-slide-in-right" style={{ width: '450px', height: '100%', borderRadius: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ background: 'var(--brand-gradient)', color: 'white', borderRadius: 0 }}>
               <div className="flex flex-col">
                 <span className="text-xs uppercase opacity-80">Support Case {activeTicket.ticket_number}</span>
                 <h3 className="text-md font-bold">{activeTicket.subject}</h3>
               </div>
               <button className="btn btn-icon" style={{ color: 'white' }} onClick={() => setActiveTicket(null)}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-elevated)' }}>
               {messages.map((m: any) => (
                 <div key={m.id} style={{ alignSelf: m.is_admin ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                   <div style={{ fontSize: '10px', marginBottom: '4px', textAlign: m.is_admin ? 'left' : 'right', color: 'var(--text-muted)' }}>
                      <b>{m.is_admin ? 'IPT One Support' : 'You'}</b> • {new Date(m.created_at).toLocaleTimeString()}
                   </div>
                   <div style={{ 
                     padding: '12px 14px', 
                     borderRadius: '12px', 
                     background: m.is_admin ? 'var(--bg-main)' : 'var(--brand-primary)',
                     color: m.is_admin ? 'var(--text-primary)' : 'white',
                     fontSize: '13px',
                     boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                     border: m.is_admin ? '1px solid var(--border-subtle)' : 'none'
                   }}>
                     {m.message}
                   </div>
                 </div>
               ))}
            </div>
            {activeTicket.status !== 'closed' ? (
              <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
                <div className="flex gap-2">
                  <textarea className="form-input" rows={2} style={{ resize: 'none' }} placeholder="Type your reply..." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} />
                  <button className="btn btn-primary" style={{ padding: '0 16px' }} onClick={handleSendReply}>Send</button>
                </div>
                <div className="flex justify-between items-center mt-3">
                   <button className="btn btn-link text-xs" style={{ color: 'var(--danger)' }} onClick={() => closeTicket(activeTicket.id)}>Close Ticket</button>
                   <span className="text-xs text-muted italic">Our team usually replies within 2 hours.</span>
                </div>
              </div>
            ) : (
               <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(74, 222, 128, 0.1)', color: 'var(--success)', fontWeight: 700, fontSize: '13px' }}>
                 TICKET RESOLVED & CLOSED
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
