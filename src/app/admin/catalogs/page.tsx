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
                  {cat.icon === 'folder' ? '📁' :
                   cat.icon === 'box' ? '📦' :
                   cat.icon === 'package' ? '📦' :
                   cat.icon === 'wifi' ? '📶' :
                   cat.icon === 'antenna' ? '📡' :
                   cat.icon === 'satellite' ? '🛰️' :
                   cat.icon === 'router' ? '📡' :
                   cat.icon === 'network' ? '🌐' :
                   cat.icon === 'cable' ? '🔌' :
                   cat.icon === 'radio' ? '📻' :
                   cat.icon === 'phone' ? '📞' :
                   cat.icon === 'mobile' ? '📱' :
                   cat.icon === 'call' ? '📞' :
                   cat.icon === 'message' ? '💬' :
                   cat.icon === 'video' ? '📹' :
                   cat.icon === 'microphone' ? '🎤' :
                   cat.icon === 'server' ? '🖥️' :
                   cat.icon === 'computer' ? '💻' :
                   cat.icon === 'laptop' ? '💻' :
                   cat.icon === 'desktop' ? '🖥️' :
                   cat.icon === 'monitor' ? '🖥️' :
                   cat.icon === 'keyboard' ? '⌨️' :
                   cat.icon === 'mouse' ? '🖱️' :
                   cat.icon === 'printer' ? '🖨️' :
                   cat.icon === 'storage' ? '💾' :
                   cat.icon === 'memory' ? '🧠' :
                   cat.icon === 'cloud' ? '☁️' :
                   cat.icon === 'database' ? '🗄️' :
                   cat.icon === 'code' ? '💻' :
                   cat.icon === 'app' ? '📱' :
                   cat.icon === 'api' ? '🔗' :
                   cat.icon === 'automation' ? '🤖' :
                   cat.icon === 'security' ? '🔒' :
                   cat.icon === 'shield' ? '🛡️' :
                   cat.icon === 'lock' ? '🔐' :
                   cat.icon === 'key' ? '🔑' :
                   cat.icon === 'certificate' ? '📜' :
                   cat.icon === 'eye' ? '👁️' :
                   cat.icon === 'chart' ? '📊' :
                   cat.icon === 'graph' ? '📈' :
                   cat.icon === 'trending' ? '📈' :
                   cat.icon === 'money' ? '💰' :
                   cat.icon === 'invoice' ? '📄' :
                   cat.icon === 'calculator' ? '🧮' :
                   cat.icon === 'globe' ? '🌐' :
                   cat.icon === 'website' ? '🌐' :
                   cat.icon === 'browser' ? '🌐' :
                   cat.icon === 'email' ? '📧' :
                   cat.icon === 'mail' ? '✉️' :
                   cat.icon === 'tower' ? '🗼' :
                   cat.icon === 'signal' ? '📶' :
                   cat.icon === 'broadcast' ? '📢' :
                   cat.icon === 'telecom' ? '📡' :
                   cat.icon === 'voip' ? '📞' :
                   cat.icon === 'conference' ? '👥' :
                   cat.icon === 'support' ? '🆘' :
                   cat.icon === 'wrench' ? '🔧' :
                   cat.icon === 'settings' ? '⚙️' :
                   cat.icon === 'tools' ? '🛠️' :
                   cat.icon === 'checklist' ? '✅' :
                   cat.icon === 'calendar' ? '📅' :
                   cat.icon === 'battery' ? '🔋' :
                   cat.icon === 'plug' ? '🔌' :
                   cat.icon === 'lightning' ? '⚡' :
                   cat.icon === 'generator' ? '⚡' :
                   cat.icon === 'car' ? '🚗' :
                   cat.icon === 'truck' ? '🚚' :
                   cat.icon === 'plane' ? '✈️' :
                   cat.icon === 'ship' ? '🚢' :
                   cat.icon === 'tv' ? '📺' :
                   cat.icon === 'movie' ? '🎬' :
                   cat.icon === 'music' ? '🎵' :
                   cat.icon === 'camera' ? '📷' :
                   cat.icon === 'game' ? '🎮' :
                   cat.icon === 'leaf' ? '🍃' :
                   cat.icon === 'sun' ? '☀️' :
                   cat.icon === 'water' ? '💧' :
                   cat.icon === 'temperature' ? '🌡️' :
                   cat.icon === 'star' ? '⭐' :
                   cat.icon === 'diamond' ? '💎' :
                   cat.icon === 'crown' ? '👑' :
                   cat.icon === 'rocket' ? '🚀' :
                   cat.icon === 'light' ? '💡' :
                   cat.icon === 'target' ? '🎯' :
                   cat.icon === 'puzzle' ? '🧩' :
                   cat.icon === 'gear' ? '⚙️' :
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
                            {cat.icon === 'folder' ? '📁' :
                             cat.icon === 'box' ? '📦' :
                             cat.icon === 'package' ? '📦' :
                             cat.icon === 'wifi' ? '📶' :
                             cat.icon === 'antenna' ? '📡' :
                             cat.icon === 'satellite' ? '🛰️' :
                             cat.icon === 'router' ? '📡' :
                             cat.icon === 'network' ? '🌐' :
                             cat.icon === 'cable' ? '🔌' :
                             cat.icon === 'radio' ? '📻' :
                             cat.icon === 'phone' ? '📞' :
                             cat.icon === 'mobile' ? '📱' :
                             cat.icon === 'call' ? '📞' :
                             cat.icon === 'message' ? '💬' :
                             cat.icon === 'video' ? '📹' :
                             cat.icon === 'microphone' ? '🎤' :
                             cat.icon === 'server' ? '🖥️' :
                             cat.icon === 'computer' ? '💻' :
                             cat.icon === 'laptop' ? '💻' :
                             cat.icon === 'desktop' ? '🖥️' :
                             cat.icon === 'monitor' ? '🖥️' :
                             cat.icon === 'keyboard' ? '⌨️' :
                             cat.icon === 'mouse' ? '🖱️' :
                             cat.icon === 'printer' ? '🖨️' :
                             cat.icon === 'storage' ? '💾' :
                             cat.icon === 'memory' ? '🧠' :
                             cat.icon === 'cloud' ? '☁️' :
                             cat.icon === 'database' ? '🗄️' :
                             cat.icon === 'code' ? '💻' :
                             cat.icon === 'app' ? '📱' :
                             cat.icon === 'api' ? '🔗' :
                             cat.icon === 'automation' ? '🤖' :
                             cat.icon === 'security' ? '🔒' :
                             cat.icon === 'shield' ? '🛡️' :
                             cat.icon === 'lock' ? '🔐' :
                             cat.icon === 'key' ? '🔑' :
                             cat.icon === 'certificate' ? '📜' :
                             cat.icon === 'eye' ? '👁️' :
                             cat.icon === 'chart' ? '📊' :
                             cat.icon === 'graph' ? '📈' :
                             cat.icon === 'trending' ? '📈' :
                             cat.icon === 'money' ? '💰' :
                             cat.icon === 'invoice' ? '📄' :
                             cat.icon === 'calculator' ? '🧮' :
                             cat.icon === 'globe' ? '🌐' :
                             cat.icon === 'website' ? '🌐' :
                             cat.icon === 'browser' ? '🌐' :
                             cat.icon === 'email' ? '📧' :
                             cat.icon === 'mail' ? '✉️' :
                             cat.icon === 'tower' ? '🗼' :
                             cat.icon === 'signal' ? '📶' :
                             cat.icon === 'broadcast' ? '📢' :
                             cat.icon === 'telecom' ? '📡' :
                             cat.icon === 'voip' ? '📞' :
                             cat.icon === 'conference' ? '👥' :
                             cat.icon === 'support' ? '🆘' :
                             cat.icon === 'wrench' ? '🔧' :
                             cat.icon === 'settings' ? '⚙️' :
                             cat.icon === 'tools' ? '🛠️' :
                             cat.icon === 'checklist' ? '✅' :
                             cat.icon === 'calendar' ? '📅' :
                             cat.icon === 'battery' ? '🔋' :
                             cat.icon === 'plug' ? '🔌' :
                             cat.icon === 'lightning' ? '⚡' :
                             cat.icon === 'generator' ? '⚡' :
                             cat.icon === 'car' ? '🚗' :
                             cat.icon === 'truck' ? '🚚' :
                             cat.icon === 'plane' ? '✈️' :
                             cat.icon === 'ship' ? '🚢' :
                             cat.icon === 'tv' ? '📺' :
                             cat.icon === 'movie' ? '🎬' :
                             cat.icon === 'music' ? '🎵' :
                             cat.icon === 'camera' ? '📷' :
                             cat.icon === 'game' ? '🎮' :
                             cat.icon === 'leaf' ? '🍃' :
                             cat.icon === 'sun' ? '☀️' :
                             cat.icon === 'water' ? '💧' :
                             cat.icon === 'temperature' ? '🌡️' :
                             cat.icon === 'star' ? '⭐' :
                             cat.icon === 'diamond' ? '💎' :
                             cat.icon === 'crown' ? '👑' :
                             cat.icon === 'rocket' ? '🚀' :
                             cat.icon === 'light' ? '💡' :
                             cat.icon === 'target' ? '🎯' :
                             cat.icon === 'puzzle' ? '🧩' :
                             cat.icon === 'gear' ? '⚙️' :
                             '📁'}
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
                    {/* Default & General */}
                    <option value="folder">📁 Folder (Default)</option>
                    <option value="box">📦 Box / Hardware</option>
                    <option value="package">📦 Package / Bundle</option>

                    {/* Internet & Connectivity */}
                    <option value="wifi">📶 WiFi / Fibre</option>
                    <option value="antenna">📡 Antenna / Signal</option>
                    <option value="satellite">🛰️ Satellite</option>
                    <option value="router">📡 Router / Modem</option>
                    <option value="network">🌐 Network / LAN</option>
                    <option value="cable">🔌 Cable / Ethernet</option>
                    <option value="radio">📻 Radio / Wireless</option>

                    {/* Communication */}
                    <option value="phone">📞 Phone / VOIP</option>
                    <option value="mobile">📱 Mobile / SIM</option>
                    <option value="call">📞 Call Services</option>
                    <option value="message">💬 Messaging / SMS</option>
                    <option value="video">📹 Video Calling</option>
                    <option value="microphone">🎤 Audio / Voice</option>

                    {/* Computing & Hardware */}
                    <option value="server">🖥️ Server / Hosting</option>
                    <option value="computer">💻 Computer / PC</option>
                    <option value="laptop">💻 Laptop</option>
                    <option value="desktop">🖥️ Desktop</option>
                    <option value="monitor">🖥️ Monitor / Display</option>
                    <option value="keyboard">⌨️ Keyboard</option>
                    <option value="mouse">🖱️ Mouse</option>
                    <option value="printer">🖨️ Printer</option>
                    <option value="storage">💾 Storage / HDD</option>
                    <option value="memory">🧠 Memory / RAM</option>

                    {/* Cloud & Software */}
                    <option value="cloud">☁️ Cloud Services</option>
                    <option value="database">🗄️ Database</option>
                    <option value="code">💻 Software / Code</option>
                    <option value="app">📱 App / Application</option>
                    <option value="api">🔗 API / Integration</option>
                    <option value="automation">🤖 Automation</option>

                    {/* Security */}
                    <option value="security">🔒 Security / VPN</option>
                    <option value="shield">🛡️ Firewall / Protection</option>
                    <option value="lock">🔐 Encryption</option>
                    <option value="key">🔑 Access Control</option>
                    <option value="certificate">📜 SSL / Certificate</option>
                    <option value="eye">👁️ Monitoring</option>

                    {/* Business & Analytics */}
                    <option value="chart">📊 Analytics / Reporting</option>
                    <option value="graph">📈 Charts / Statistics</option>
                    <option value="trending">📈 Trending / Growth</option>
                    <option value="money">💰 Billing / Finance</option>
                    <option value="invoice">📄 Invoice / Receipt</option>
                    <option value="calculator">🧮 Calculator / Tools</option>

                    {/* Web & Domains */}
                    <option value="globe">🌐 Web / Domains</option>
                    <option value="website">🌐 Website / Hosting</option>
                    <option value="browser">🌐 Browser / Web</option>
                    <option value="email">📧 Email Services</option>
                    <option value="mail">✉️ Mail / Communication</option>

                    {/* Telecom Specific */}
                    <option value="tower">🗼 Cell Tower</option>
                    <option value="signal">📶 Signal Strength</option>
                    <option value="broadcast">📢 Broadcasting</option>
                    <option value="telecom">📡 Telecom Services</option>
                    <option value="voip">📞 VoIP / SIP</option>
                    <option value="conference">👥 Conference / Meeting</option>

                    {/* Support & Services */}
                    <option value="support">🆘 Support / Help</option>
                    <option value="wrench">🔧 Maintenance</option>
                    <option value="settings">⚙️ Configuration</option>
                    <option value="tools">🛠️ Tools / Utilities</option>
                    <option value="checklist">✅ Checklist / Tasks</option>
                    <option value="calendar">📅 Scheduling</option>

                    {/* Energy & Power */}
                    <option value="battery">🔋 Battery / Power</option>
                    <option value="plug">🔌 Power Supply</option>
                    <option value="lightning">⚡ Electrical</option>
                    <option value="generator">⚡ Generator / UPS</option>

                    {/* Transportation & Mobility */}
                    <option value="car">🚗 Vehicle / GPS</option>
                    <option value="truck">🚚 Logistics</option>
                    <option value="plane">✈️ Aviation</option>
                    <option value="ship">🚢 Maritime</option>

                    {/* Entertainment & Media */}
                    <option value="tv">📺 TV / Streaming</option>
                    <option value="movie">🎬 Media / Content</option>
                    <option value="music">🎵 Audio / Music</option>
                    <option value="camera">📷 Surveillance</option>
                    <option value="game">🎮 Gaming</option>

                    {/* Nature & Environment */}
                    <option value="leaf">🍃 Green / Eco</option>
                    <option value="sun">☀️ Solar / Renewable</option>
                    <option value="water">💧 Water / Utilities</option>
                    <option value="temperature">🌡️ Climate Control</option>

                    {/* Symbols & Abstract */}
                    <option value="star">⭐ Featured / Premium</option>
                    <option value="diamond">💎 Premium / Luxury</option>
                    <option value="crown">👑 Enterprise</option>
                    <option value="rocket">🚀 Fast / Performance</option>
                    <option value="light">💡 Innovation</option>
                    <option value="target">🎯 Goals / Objectives</option>
                    <option value="puzzle">🧩 Solutions</option>
                    <option value="gear">⚙️ Advanced</option>
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
