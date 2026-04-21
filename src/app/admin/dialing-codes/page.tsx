'use client';

import { useEffect, useState } from 'react';

export default function DialingCodeManager() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState({ code: '', region: '' });

  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    setLoading(true);
    try {
      const res = await fetch('/api/dialing-codes');
      const data = await res.json();
      setCodes(data.codes || []);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dialing-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode),
      });
      if (res.ok) {
        setNewCode({ code: '', region: '' });
        fetchCodes();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this dialing code?')) return;
    await fetch(`/api/dialing-codes?id=${id}`, { method: 'DELETE' });
    fetchCodes();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Dialing Code Manager</h2>
          <p className="text-muted">Configure available prefixes for voice & service allocations.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="font-bold mb-4">Add New Code</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Dialing Code (e.g. 010)</label>
                <input 
                  className="form-input" 
                  required 
                  value={newCode.code} 
                  onChange={e => setNewCode({ ...newCode, code: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Regional Description</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Johannesburg" 
                  value={newCode.region} 
                  onChange={e => setNewCode({ ...newCode, region: e.target.value })} 
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">Add Code to Registry</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Prefix</th>
                    <th>Region</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 800, fontSize: '16px' }} className="text-brand">{c.code}</td>
                      <td>{c.region || 'Standard Regional'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {loading && <tr><td colSpan={3} className="text-center p-4">Loading...</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
