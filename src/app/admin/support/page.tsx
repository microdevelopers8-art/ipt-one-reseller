'use client';

import { useEffect, useState } from 'react';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status Filters
  const [statusFilter, setStatusFilter] = useState('open');

  // View/Manage Modal
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets'); // Admin sees all by default in API
      const data = await res.json();
      let list = data.tickets || [];
      if (statusFilter) list = list.filter((t: any) => t.status === statusFilter);
      setTickets(list);
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
        fetchTickets(); // Refresh status to 'in_progress'
      }
    } catch {}
  };

  const updateTicketStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/support/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    setActiveTicket(null);
    fetchTickets();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Support Helpdesk</h2>
          <p className="text-muted">Manage technical support cases and partner inquiries.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button className={`btn btn-sm ${statusFilter === 'open' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('open')}>Open Cases</button>
        <button className={`btn btn-sm ${statusFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('in_progress')}>In Progress</button>
        <button className={`btn btn-sm ${statusFilter === 'closed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('closed')}>Archived / Closed</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Reseller Partner</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t: any) => (
                <tr key={t.id}>
                  <td className="font-mono font-bold">{t.ticket_number}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold">{t.reseller_company}</span>
                      <span className="text-xs text-muted">{t.reseller_name}</span>
                    </div>
                  </td>
                  <td><span className="font-semibold">{t.subject}</span></td>
                  <td>
                    <span className={`badge ${t.priority === 'critical' ? 'badge-danger' : t.priority === 'high' ? 'badge-warning' : 'badge-info'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td><span className="text-xs font-bold uppercase">{t.category}</span></td>
                  <td className="text-xs">{new Date(t.updated_at).toLocaleString()}</td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => handleOpenTicket(t)}>Reply</button></td>
                </tr>
              ))}
              {!tickets.length && !loading && (
                <tr><td colSpan={7} className="text-center p-12 text-muted">No tickets found in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN CONVERSATION DRAWER */}
      {activeTicket && (
        <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '0' }}>
          <div className="modal animate-slide-in-right" style={{ width: '600px', height: '100%', borderRadius: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ background: 'var(--brand-primary)', color: 'white', borderRadius: 0 }}>
               <div className="flex flex-col">
                 <span className="text-xs uppercase opacity-80">{activeTicket.reseller_company} • {activeTicket.ticket_number}</span>
                 <h3 className="text-md font-bold">{activeTicket.subject}</h3>
               </div>
               <button className="btn btn-icon" style={{ color: 'white' }} onClick={() => setActiveTicket(null)}>×</button>
            </div>
            
            <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div className="flex gap-4">
                  <div className="text-xs"><span className="text-muted font-bold">Reseller Email:</span> {activeTicket.reseller_email}</div>
                  <div className="text-xs"><span className="text-muted font-bold">Case Priority:</span> <span style={{ color: 'var(--brand-primary)' }}>{activeTicket.priority}</span></div>
               </div>
               <div className="flex gap-2">
                 {activeTicket.status !== 'closed' && (
                   <button className="btn btn-sm btn-success" onClick={() => updateTicketStatus(activeTicket.id, 'closed')}>Resolve & Close</button>
                 )}
               </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-main)' }}>
               {messages.map((m: any) => (
                 <div key={m.id} style={{ alignSelf: m.is_admin ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                   <div style={{ fontSize: '10px', marginBottom: '6px', textAlign: m.is_admin ? 'right' : 'left', color: 'var(--text-muted)' }}>
                      <b>{m.is_admin ? 'YOU (Admin)' : m.sender_name}</b> • {new Date(m.created_at).toLocaleString()}
                   </div>
                   <div style={{ 
                     padding: '16px', borderRadius: '12px', 
                     background: m.is_admin ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                     color: m.is_admin ? 'white' : 'var(--text-primary)',
                     fontSize: '14px',
                     border: m.is_admin ? 'none' : '1px solid var(--border-subtle)',
                     whiteSpace: 'pre-wrap'
                   }}>
                     {m.message}
                   </div>
                 </div>
               ))}
            </div>

            {activeTicket.status !== 'closed' && (
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                <textarea 
                  className="form-input mb-4" 
                  rows={4} 
                  placeholder="Draft your response to the partner..." 
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                />
                <div className="flex justify-between">
                   <div className="flex gap-2">
                      <button className="btn btn-primary px-8" onClick={handleSendReply}>Send Official Response</button>
                   </div>
                   <button className="btn btn-secondary" onClick={() => setActiveTicket(null)}>Discard Draft</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
