'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Rich Text Editor Component
function RichTextEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const handleCommand = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); };
  return (
    <div className="rich-editor-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-main)' }}>
      <div className="rich-editor-toolbar" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', background: 'var(--bg-elevated)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => handleCommand('bold')} className="btn-rich" title="Bold"><b>B</b></button>
        <button type="button" onClick={() => handleCommand('italic')} className="btn-rich" title="Italic"><i>I</i></button>
        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }}></div>
        <button type="button" onClick={() => handleCommand('insertUnorderedList')} className="btn-rich" title="Bullet List">• List</button>
        <button type="button" onClick={() => handleCommand('insertOrderedList')} className="btn-rich" title="Numbered List">1. List</button>
        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }}></div>
        <button type="button" onClick={() => handleCommand('formatBlock', 'h3')} className="btn-rich" title="Heading">H3</button>
      </div>
      <div contentEditable onInput={(e: any) => onChange(e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: value }} style={{ minHeight: '200px', padding: '16px', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }} />
      <style dangerouslySetInnerHTML={{__html: `.btn-rich { min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer; color: var(--text-secondary); font-size: 13px; font-weight: 500; transition: all 0.2s; } .btn-rich:hover { color: var(--primary); background: var(--bg-hover); border-color: var(--primary); }`}} />
    </div>
  );
}

export default function AdminProducts() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState('');

  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    if (editingProduct?.catalog_id) {
       fetchCategories(editingProduct.catalog_id);
    }
  }, [editingProduct?.catalog_id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/catalogs?type=hardware'),
        fetch('/api/products?catalog_type=hardware')
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
      price: 0, cost_price: 0, reseller_price: 0, unit: 'each', 
      stock_quantity: 0, is_active: true, images: [], requires_dialing_code: false
    });
    setParentCategoryId('');
    setIsModalOpen(true);
  };

  const handleEdit = (prod: any) => {
    // Determine parent category
    const currentCat = categories.find((c: any) => c.id === prod.category_id);
    if (currentCat && currentCat.parent_id) {
       setParentCategoryId(currentCat.parent_id);
    } else if (prod.category_id) {
       setParentCategoryId(prod.category_id);
    } else {
       setParentCategoryId('');
    }

    setEditingProduct({ ...prod, images: Array.isArray(prod.images) ? prod.images : [] });
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
      fetchData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...(editingProduct.images || [])];
      newImages[index] = reader.result as string;
      setEditingProduct({ ...editingProduct, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="p-8">Synchronizing Hardware Suite...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Hardware Inventory Management</h2>
          <p className="text-muted text-sm">Centralized control for physical equipment and endpoints.</p>
        </div>
        <button className="btn btn-primary lg" onClick={handleAdd}><span>+</span> Register New Hardware</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Hardware Item</th>
                <th>Classification</th>
                <th>Purchasing (R)</th>
                <th>Wholesale (R)</th>
                <th>Retail (R)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                       <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.images?.[0] ? <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                       </div>
                       <div className="flex flex-col">
                        <span className="font-bold">{p.name}</span>
                        <span className="text-xs text-muted font-mono">{p.sku || 'NO-SKU'}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge" style={{ backgroundColor: `${p.catalog_color}20`, color: p.catalog_color }}>{p.catalog_name}</span></td>
                  <td><span className="text-muted font-mono">R {p.cost_price || 0}</span></td>
                  <td className="font-bold text-brand">R {p.reseller_price || 0}</td>
                  <td className="font-bold">R {p.price || 0}</td>
                  <td><span className={`badge badge-${p.is_active ? 'success' : 'danger'}`}>{p.is_active ? 'ENABLED' : 'DISABLED'}</span></td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingProduct && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '1100px' }}>
            <div className="modal-header">
              <h3>{editingProduct.id ? 'Modify' : 'Initialize'} Hardware Resource</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '28px', alignItems: 'start' }} >
                    {/* MAIN FORM SECTION */}
                    <div className="space-y-6">
                       {/* GENERAL INFO */}
                       <div>
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide mb-4">📋 Basic Information</h5>
                          <div className="grid-2 gap-4">
                             <div className="form-group"><label className="form-label">Item Name *</label><input className="form-input" required value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
                             <div className="form-group"><label className="form-label">SKU / Stock ID</label><input className="form-input font-mono" value={editingProduct.sku || ''} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} /></div>
                          </div>
                       </div>

                       {/* CATALOG & CATEGORIES */}
                       <div>
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide mb-4">🏷️ Classification</h5>
                          <div className="grid-3 gap-4">
                             <div className="form-group">
                               <label className="form-label">Hardware Catalog *</label>
                               <select className="form-input" required value={editingProduct.catalog_id || ''} onChange={e => setEditingProduct({...editingProduct, catalog_id: e.target.value, category_id: ''})}>
                                 <option value="">Select Type</option>
                                 {catalogs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                             </div>
                             <div className="form-group">
                               <label className="form-label">Primary Category</label>
                               <select className="form-input" value={parentCategoryId || ''} onChange={e => { setParentCategoryId(e.target.value); setEditingProduct({...editingProduct, category_id: e.target.value}); }}>
                                 <option value="">Uncategorized</option>
                                 {categories.filter((c: any) => !c.parent_id).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                             </div>
                             <div className="form-group">
                               <label className="form-label">Sub-Category</label>
                               <select className="form-input" disabled={!parentCategoryId} value={(editingProduct.category_id !== parentCategoryId ? editingProduct.category_id : '') || ''} onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value || parentCategoryId})}>
                                 <option value="">None</option>
                                 {categories.filter((c: any) => c.parent_id === parentCategoryId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                             </div>
                          </div>
                       </div>

                       {/* PRICING MATRIX */}
                       <div>
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide mb-4">💰 Pricing</h5>
                          <div className="grid_3 gap-4" style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                             <div className="form-group">
                                <label className="form-label text-xs uppercase">Cost Price (R)</label>
                                <input className="form-input font-mono" type="number" step="0.01" value={editingProduct.cost_price ?? 0} onChange={e => setEditingProduct({...editingProduct, cost_price: parseFloat(e.target.value) || 0})} />
                             </div>
                             <div className="form-group">
                                <label className="form-label text-xs uppercase" style={{ color: 'var(--brand-primary)' }}>Reseller Price (R) *</label>
                                <input className="form-input font-bold" type="number" step="0.01" value={editingProduct.reseller_price ?? 0} onChange={e => setEditingProduct({...editingProduct, reseller_price: parseFloat(e.target.value) || 0})} required />
                             </div>
                             <div className="form-group">
                                <label className="form-label text-xs uppercase" style={{ color: 'var(--primary)' }}>Retail Price (R) *</label>
                                <input className="form-input font-bold" type="number" step="0.01" value={editingProduct.price ?? 0} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} required />
                             </div>
                          </div>
                       </div>

                       {/* DESCRIPTION */}
                       <div>
                          <h5 className="font-semibold text-sm text-secondary uppercase tracking-wide mb-4">📝 Specifications</h5>
                          <RichTextEditor value={editingProduct.description || ''} onChange={val => setEditingProduct({...editingProduct, description: val})} />
                       </div>
                    </div>

                    {/* MEDIA SIDEBAR */}
                    <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', height: 'fit-content', position: 'sticky', top: '20px' }}>
                       <h5 className="text-xs uppercase font-bold text-secondary mb-3">📸 Photos (Max 3)</h5>
                       <div className="space-y-2">
                          {[0, 1, 2].map(idx => (
                            <div key={idx} style={{ 
                              height: '100px', 
                              background: 'var(--bg-main)', 
                              borderRadius: '8px', 
                              border: '2px dashed var(--border-subtle)', 
                              overflow: 'hidden', 
                              position: 'relative', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}>
                               {editingProduct.images?.[idx] ? (
                                 <>
                                   <img src={editingProduct.images[idx]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   <button 
                                     type="button" 
                                     onClick={() => { 
                                       const next = [...editingProduct.images]; 
                                       next.splice(idx, 1); 
                                       setEditingProduct({...editingProduct, images: next}); 
                                     }} 
                                     style={{ 
                                       position: 'absolute', 
                                       top: '2px', 
                                       right: '2px', 
                                       background: 'rgba(0,0,0,0.6)', 
                                       color: 'white', 
                                       border: 'none', 
                                       borderRadius: '50%', 
                                       width: '24px', 
                                       height: '24px',
                                       cursor: 'pointer',
                                       fontSize: '14px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       padding: '0',
                                       lineHeight: '1'
                                     }}
                                   >×</button>
                                 </>
                               ) : (
                                 <label style={{ cursor: 'pointer', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                                    <span style={{ fontSize: '24px', opacity: 0.4, lineHeight: '1' }}>📷</span>
                                    <div style={{ fontSize: '10px', marginTop: '2px', color: 'var(--text-secondary)', opacity: 0.5 }}>Click to upload</div>
                                    <input type="file" hidden accept="image/*" onChange={e => handleImageUpload(e, idx)} />
                                 </label>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary lg" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary lg px-12">Commit Hardware Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
