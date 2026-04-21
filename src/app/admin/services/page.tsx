'use client';

import { useEffect, useState } from 'react';

// Rich Text Editor Component
function RichTextEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const handleCommand = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); };
  return (
    <div className="rich-editor-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-main)' }}>
      <div className="rich-editor-toolbar" style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '4px', background: 'var(--bg-elevated)' }}>
        <button type="button" onClick={() => handleCommand('bold')} className="btn-rich"><b>B</b></button>
        <button type="button" onClick={() => handleCommand('italic')} className="btn-rich"><i>I</i></button>
        <button type="button" onClick={() => handleCommand('insertUnorderedList')} className="btn-rich">• List</button>
        <button type="button" onClick={() => handleCommand('insertOrderedList')} className="btn-rich">1. List</button>
        <button type="button" onClick={() => handleCommand('formatBlock', 'h3')} className="btn-rich">H</button>
      </div>
      <div contentEditable onInput={(e: any) => onChange(e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: value }} style={{ minHeight: '180px', padding: '16px', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }} />
      <style dangerouslySetInnerHTML={{__html: `.btn-rich { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: 4px; cursor: pointer; color: var(--text-secondary); font-size: 13px; } .btn-rich:hover { color: var(--brand-primary); }`}} />
    </div>
  );
}

export default function AdminServices() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState('');

  useEffect(() => { fetchServiceData(); }, []);
  
  useEffect(() => {
    if (editingProduct?.catalog_id) {
       fetchCategories(editingProduct.catalog_id);
    }
  }, [editingProduct?.catalog_id]);

  async function fetchServiceData() {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/catalogs?type=service'),
        fetch('/api/products?catalog_type=service')
      ]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      setCatalogs(catData.catalogs || []);
      setProducts(prodData.products || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories(catalogId: string) {
    const res = await fetch(`/api/categories?catalog_id=${catalogId}`);
    const data = await res.json();
    setCategories(data.categories || []);
  }

  const handleAdd = () => {
    setEditingProduct({
      name: '', sku: '', catalog_id: '', category_id: '', description: '', 
      price: 0, cost_price: 0, reseller_price: 0, is_recurring: true, 
      billing_cycle: 'monthly', is_active: true, requires_dialing_code: false, images: []
    });
    setParentCategoryId('');
    setIsModalOpen(true);
  };

  const handleEdit = (prod: any) => {
    // If the product has a category, try to find its parent
    const currentCat = categories.find((c: any) => c.id === prod.category_id);
    if (currentCat && currentCat.parent_id) {
       setParentCategoryId(currentCat.parent_id);
    } else if (prod.category_id) {
       setParentCategoryId(prod.category_id);
    } else {
       setParentCategoryId('');
    }

    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct.id ? 'PUT' : 'POST';
    const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchServiceData();
    }
  };

  if (loading) return <div className="p-8">Syncing Service Protocols...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Services & Subscription Plans</h2>
          <p className="text-muted text-sm">Lifecycle management for ISP offerings and voice bundles.</p>
        </div>
        <button className="btn btn-primary lg" onClick={handleAdd}><span>+</span> Define Service Protocol</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Service Plan</th>
                <th>Classification</th>
                <th>Wholesale (R)</th>
                <th>Retail (R)</th>
                <th>Billing Cycle</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id}>
                  <td><span className="font-bold">{p.name}</span></td>
                  <td>
                    <div className="flex flex-col gap-1 items-start">
                      <span className="badge" style={{ backgroundColor: `${p.catalog_color}20`, color: p.catalog_color }}>{p.catalog_name}</span>
                      <span className="text-xs text-muted">{p.category_name}</span>
                    </div>
                  </td>
                  <td className="font-bold text-brand">R {p.reseller_price}</td>
                  <td className="font-bold">R {p.price}</td>
                  <td><span className="text-xs uppercase font-bold text-muted">{p.billing_cycle || 'N/A'}</span></td>
                  <td><span className={`badge badge-${p.is_active ? 'success' : 'danger'}`}>{p.is_active ? 'ACTIVE' : 'DISABLED'}</span></td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)}>Modify Logic</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingProduct && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h3>{editingProduct.id ? 'Modify' : 'Initialize'} Network Service</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body space-y-8">
                 {/* NAMES & IDENTIFIERS */}
                 <div className="grid-2 gap-4">
                    <div className="form-group"><label className="form-label font-bold">Service Title *</label><input className="form-input" required value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label font-bold">Internal Reference ID (SKU)</label><input className="form-input font-mono" value={editingProduct.sku || ''} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} /></div>
                 </div>

                 {/* HIERARCHY */}
                 <div className="grid-3 gap-4">
                    <div className="form-group">
                      <label className="form-label font-bold">Service Catalog *</label>
                      <select className="form-select" required value={editingProduct.catalog_id || ''} onChange={e => setEditingProduct({...editingProduct, catalog_id: e.target.value, category_id: ''})}>
                        <option value="">Select Service Catalog</option>
                        {catalogs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label font-bold">Group Category</label>
                      <select className="form-select" value={parentCategoryId || ''} onChange={e => { setParentCategoryId(e.target.value); setEditingProduct({...editingProduct, category_id: e.target.value}); }}>
                        <option value="">UNCATEGORIZED</option>
                        {categories.filter((c: any) => !c.parent_id).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label font-bold">Sub-Classification</label>
                      <select className="form-select" disabled={!parentCategoryId} value={(editingProduct.category_id !== parentCategoryId ? editingProduct.category_id : '') || ''} onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value || parentCategoryId})}>
                        <option value="">NONE</option>
                        {categories.filter((c: any) => c.parent_id === parentCategoryId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                 </div>

                 {/* RECURRING PRICING ENGINE */}
                 <div className="p-6 bg-elevated rounded-xl border border-subtle">
                    <h4 className="text-xs uppercase font-bold text-muted mb-4">Recurring Pricing Matrix (Per Billing Cycle)</h4>
                    <div className="grid-4 gap-4">
                       <div className="form-group"><label className="form-label text-xs">Cost (R)</label><input className="form-input font-mono" type="number" step="0.01" value={editingProduct.cost_price ?? 0} onChange={e => setEditingProduct({...editingProduct, cost_price: e.target.value})} /></div>
                       <div className="form-group"><label className="form-label text-xs text-brand font-bold">Reseller (R) *</label><input className="form-input font-bold" type="number" step="0.01" value={editingProduct.reseller_price ?? 0} onChange={e => setEditingProduct({...editingProduct, reseller_price: e.target.value})} required /></div>
                       <div className="form-group"><label className="form-label text-xs font-bold">Retail (R) *</label><input className="form-input font-bold" type="number" step="0.01" value={editingProduct.price ?? 0} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required /></div>
                       <div className="form-group">
                          <label className="form-label text-xs">Interval</label>
                          <select className="form-select" value={editingProduct.billing_cycle || 'monthly'} onChange={e => setEditingProduct({...editingProduct, billing_cycle: e.target.value})}>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 {/* LOGICAL FLAGS */}
                 <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: '800' }}>
                       <input type="checkbox" checked={!!editingProduct.requires_dialing_code} onChange={e => setEditingProduct({...editingProduct, requires_dialing_code: e.target.checked})} />
                       VOIP ADD-ON (Requires Dialing Code)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                       <input type="checkbox" checked={!!editingProduct.is_active} onChange={e => setEditingProduct({...editingProduct, is_active: e.target.checked})} />
                       Operational Status (Active)
                    </label>
                 </div>

                 {/* CONTENT */}
                 <div className="form-group">
                    <label className="form-label font-bold">Service Inclusions & SLA Details</label>
                    <RichTextEditor value={editingProduct.description || ''} onChange={val => setEditingProduct({...editingProduct, description: val})} />
                 </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary lg" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary lg px-12">Synchronize Service Protocol</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
