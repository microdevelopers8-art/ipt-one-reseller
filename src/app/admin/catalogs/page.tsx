'use client';

import { useEffect, useState } from 'react';

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  async function fetchCatalogs() {
    try {
      const res = await fetch('/api/catalogs');
      const data = await res.json();
      // Sort items by sort_order locally
      const sorted = (data.catalogs || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
      setCatalogs(sorted);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingCatalog({ name: '', slug: '', description: '', catalog_type: 'service', icon: 'box', color: '#3B82F6', sort_order: catalogs.length });
    setIsModalOpen(true);
  };

  const handleEdit = (cat: any) => {
    setEditingCatalog(cat);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCatalog.id ? 'PUT' : 'POST';
    const url = editingCatalog.id ? `/api/catalogs/${editingCatalog.id}` : '/api/catalogs';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCatalog),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCatalogs();
      }
    } catch (err) {
      alert('Save failed');
    }
  };

  // Drag and Drop Logic
  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const onDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;

    const items = [...catalogs];
    const draggedIdx = items.findIndex((i: any) => i.id === draggingId);
    const targetIdx = items.findIndex((i: any) => i.id === targetId);

    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);

    // Re-verify indices
    const updatedItems = items.map((item: any, idx) => ({ ...item, sort_order: idx }));
    setCatalogs(updatedItems);
    setDraggingId(null);

    // Save to server
    try {
      await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'catalog', items: updatedItems.map(i => ({ id: i.id, sort_order: i.sort_order })) }),
      });
    } catch (err) {
      console.error('Failed to save order');
      fetchCatalogs();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Manage Catalogs</h2>
          <p className="text-muted">Drag and drop items to redefine their display order in the portal.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button 
              style={{ background: viewMode === 'card' ? 'var(--bg-main)' : 'transparent', color: viewMode === 'card' ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: viewMode === 'card' ? 600 : 500, boxShadow: viewMode === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setViewMode('card')}
            >
              🔲 Cards
            </button>
            <button 
              style={{ background: viewMode === 'list' ? 'var(--bg-main)' : 'transparent', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: viewMode === 'list' ? 600 : 500, boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>+ New Catalog</button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {viewMode === 'card' ? (
          <div className="grid-3 animate-fade-in">
            {catalogs.map((cat: any) => (
              <div 
                key={cat.id} 
                className={`catalog-card ${draggingId === cat.id ? 'opacity-50' : ''}`}
                draggable
                onDragStart={() => onDragStart(cat.id)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(cat.id)}
                style={{ cursor: 'grab' }}
              >
                <div className="catalog-icon" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  {cat.icon === 'box' ? '📦' : 
                   cat.icon === 'wifi' ? '📶' : 
                   cat.icon === 'phone' ? '📞' : 
                   cat.icon === 'cloud' ? '☁️' : 
                   cat.icon === 'server' ? '🖥️' : 
                   cat.icon === 'security' ? '🔒' : 
                   cat.icon === 'mobile' ? '📱' : 
                   cat.icon === 'chart' ? '📊' : 
                   cat.icon === 'globe' ? '🌐' : 
                   '📁'}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{cat.name}</h3>
                <p className="text-sm text-secondary mb-4">{cat.description || 'No description provided.'}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className={`badge badge-${cat.catalog_type === 'hardware' ? 'info' : 'primary'}`}>
                    {cat.catalog_type}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-muted font-bold">Order: {cat.sort_order + 1}</span>
                    <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(cat)}>✏️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card animate-fade-in">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Catalog Name</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogs.map((cat: any) => (
                    <tr 
                      key={cat.id}
                      draggable
                      onDragStart={() => onDragStart(cat.id)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(cat.id)}
                      className={draggingId === cat.id ? 'opacity-30' : ''}
                      style={{ cursor: 'grab' }}
                    >
                      <td style={{ textAlign: 'center', opacity: 0.3 }}>⠿</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${cat.color}20`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                            {cat.icon === 'box' ? '📦' : cat.icon === 'wifi' ? '📶' : cat.icon === 'phone' ? '📞' : cat.icon === 'cloud' ? '☁️' : cat.icon === 'server' ? '🖥️' : cat.icon === 'security' ? '🔒' : cat.icon === 'mobile' ? '📱' : cat.icon === 'chart' ? '📊' : cat.icon === 'globe' ? '🌐' : '📁'}
                          </div>
                          <span style={{ fontWeight: '600' }}>{cat.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${cat.catalog_type === 'hardware' ? 'info' : 'primary'}`}>
                          {cat.catalog_type}
                        </span>
                      </td>
                      <td className="text-secondary">{cat.description || 'No description provided.'}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(cat)}>Edit Settings</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingCatalog.id ? 'Edit' : 'Add'} Catalog</h3>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={editingCatalog.name} onChange={e => setEditingCatalog({...editingCatalog, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={editingCatalog.catalog_type} onChange={e => setEditingCatalog({...editingCatalog, catalog_type: e.target.value})}>
                    <option value="service">Service</option>
                    <option value="hardware">Hardware</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <input type="color" className="form-input" style={{ height: '40px', padding: '2px' }} value={editingCatalog.color} onChange={e => setEditingCatalog({...editingCatalog, color: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <select className="form-select" value={editingCatalog.icon} onChange={e => setEditingCatalog({...editingCatalog, icon: e.target.value})}>
                    <option value="folder">📁 Folder (Default)</option>
                    <option value="box">📦 Box / Hardware</option>
                    <option value="wifi">📶 Wifi / Fibre</option>
                    <option value="phone">📞 Phone / VOIP</option>
                    <option value="cloud">☁️ Cloud Services</option>
                    <option value="server">🖥️ Server / Hosting</option>
                    <option value="security">🔒 Security / VPN</option>
                    <option value="mobile">📱 SIM / Mobile Data</option>
                    <option value="chart">📊 Analytics / Reporting</option>
                    <option value="globe">🌐 Web / Domains</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={editingCatalog.description} onChange={e => setEditingCatalog({...editingCatalog, description: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
