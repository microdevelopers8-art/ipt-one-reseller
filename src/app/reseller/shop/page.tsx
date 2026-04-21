'use client';

import { useEffect, useState } from 'react';

interface Catalog {
  id: string;
  name: string;
  slug: string;
  color: string;
  catalog_type: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  catalog_id: string;
  slug: string;
  product_count: number;
}

export default function ResellerShop() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  // View Toggle
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Dialing Codes
  const [dialingCodes, setDialingCodes] = useState([]);
  const [showDialingModal, setShowDialingModal] = useState<any>(null);
  const [selectedCode, setSelectedCode] = useState('');

  // Selection state
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // UI Expand state
  const [expandedCatalogs, setExpandedCatalogs] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
    fetchDialingCodes();
  }, []);

  useEffect(() => {
    if (selectedCatalogId) {
      fetchProducts();
    }
  }, [selectedCatalogId, selectedCategoryId]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [catRes, ctgRes] = await Promise.all([
        fetch('/api/catalogs'),
        fetch('/api/categories')
      ]);
      const catData = await catRes.json();
      const ctgData = await ctgRes.json();
      
      const cats = catData.catalogs || [];
      setCatalogs(cats);
      setCategories(ctgData.categories || []);
      
      if (cats.length > 0) {
        setSelectedCatalogId(cats[0].id);
        setExpandedCatalogs([cats[0].id]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchDialingCodes() {
    const res = await fetch('/api/dialing-codes?active=true');
    const data = await res.json();
    setDialingCodes(data.codes || []);
  }

  async function fetchProducts() {
    setProductsLoading(true);
    try {
      let url = `/api/products?catalog_id=${selectedCatalogId}&is_active=true`;
      if (selectedCategoryId) url += `&category_id=${selectedCategoryId}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setProductsLoading(false);
    }
  }

  const handleAddToCartAttempt = (product: any) => {
    if (product.requires_dialing_code) {
      setShowDialingModal(product);
      setSelectedCode('');
    } else {
      addToCart(product.id);
    }
  };

  const addToCart = async (productId: string, options = {}) => {
    setAddingToCart(productId);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: productId, 
          quantity: 1,
          selected_options: options
        }),
      });
      if (res.ok) {
        setShowDialingModal(null);
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const toggleCatalog = (id: string) => {
    if (expandedCatalogs.includes(id)) {
      setExpandedCatalogs(expandedCatalogs.filter(x => x !== id));
    } else {
      setExpandedCatalogs([...expandedCatalogs, id]);
    }
    setSelectedCatalogId(id);
    setSelectedCategoryId(null);
  };

  const selectCategory = (catalogId: string, categoryId: string | null) => {
    setSelectedCatalogId(catalogId);
    setSelectedCategoryId(categoryId);
  };

  const renderCategoryTree = (catalogId: string, parentId: string | null = null, level = 0) => {
    const nodes = categories.filter(c => c.catalog_id === catalogId && c.parent_id === parentId);
    if (!nodes.length) return null;

    return (
      <ul style={{ listStyle: 'none', paddingLeft: level === 0 ? '0px' : '16px', margin: 0 }}>
        {nodes.map(node => {
          const isSelected = selectedCategoryId === node.id;
          return (
            <li key={node.id} style={{ marginTop: '2px' }}>
              <div 
                onClick={() => selectCategory(catalogId, node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-active)' : 'transparent',
                  transition: 'all 0.1s ease',
                  borderLeft: `2px solid ${isSelected ? 'var(--brand-primary)' : 'transparent'}`,
                }}
                className="category-nav-item"
              >
                <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 400, flex: 1, color: isSelected ? 'var(--brand-primary)' : 'inherit' }}>
                  {node.name}
                </span>
              </div>
              {renderCategoryTree(catalogId, node.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading) return <div className="p-12 text-center opacity-40">Loading Catalog...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 84px)' }}>
      <div className="flex justify-between items-center mb-6" style={{ flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Product & Service Catalog</h2>
          <p className="text-muted text-sm">Provision services and order hardware from the IPT One catalog.</p>
        </div>
        
        {/* VIEW TOGGLE */}
        <div className="flex bg-elevated border border-subtle p-1 rounded-xl shadow-inner">
           <button 
             onClick={() => setViewMode('card')}
             className={`p-2 px-3 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'card' ? 'bg-primary text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
           >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
             <span className="text-[11px] font-bold">Cards</span>
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`p-2 px-3 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
           >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
             <span className="text-[11px] font-bold">List</span>
           </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ width: '260px', display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
            <h3 className="text-xs font-bold text-muted uppercase">Categories</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {catalogs.map(catalog => {
              const isOpen = expandedCatalogs.includes(catalog.id);
              const isSelected = selectedCatalogId === catalog.id;
              
              return (
                <div key={catalog.id} style={{ marginBottom: '4px' }}>
                  <div 
                    onClick={() => toggleCatalog(catalog.id)}
                    style={{
                      padding: '12px',
                      background: isSelected ? `${catalog.color}15` : 'transparent',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      border: isSelected ? `1px solid ${catalog.color}30` : '1px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '4px', background: catalog.color }}></div>
                      <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '14px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {catalog.name}
                      </span>
                    </div>
                  </div>
                  
                  {isOpen && (
                    <div style={{ padding: '4px 0 8px 12px' }}>
                      <div 
                        onClick={() => selectCategory(catalog.id, null)}
                        style={{
                          fontSize: '12px', padding: '8px 12px', cursor: 'pointer', borderRadius: '8px',
                          background: (isSelected && !selectedCategoryId) ? 'var(--bg-active)' : 'transparent',
                          color: (isSelected && !selectedCategoryId) ? 'var(--brand-primary)' : 'inherit',
                          fontWeight: (isSelected && !selectedCategoryId) ? 700 : 400
                        }}
                      >
                        All {catalog.name}
                      </div>
                      {renderCategoryTree(catalog.id)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN PRODUCT VIEW */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}>
            <div className="flex items-center gap-2 text-xs font-bold">
               <span className="text-muted">Viewing:</span>
               <span>{catalogs.find(c => c.id === selectedCatalogId)?.name}</span>
               {selectedCategoryId && (
                 <>
                   <span className="opacity-20">/</span>
                   <span className="text-brand">{categories.find(c => c.id === selectedCategoryId)?.name}</span>
                 </>
               )}
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[11px] font-bold text-muted">{products.length} Items</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
             {productsLoading ? (
               <div className="flex items-center justify-center p-20 opacity-40">Loading products...</div>
             ) : (
               <>
                 {viewMode === 'card' ? (
                   <div className="grid-3">
                     {products.map((product: any) => (
                       <div key={product.id} className="product-card animate-slide-up group" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                          <div className="product-card-header">
                            <div className="flex justify-between items-start">
                              <h4 style={{ fontSize: '15px', fontWeight: '800' }}>{product.name}</h4>
                              <span className="text-[10px] opacity-40 font-mono">{product.sku}</span>
                            </div>
                          </div>
                          <div className="product-card-body" style={{ flex: 1 }}>
                            <p className="text-[12px] text-secondary line-clamp-3 leading-relaxed opacity-80">
                              {product.short_description || product.description?.replace(/<[^>]*>?/gm, '') || 'High-quality service component.'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                               {product.is_recurring && <span className="badge badge-info text-[9px] font-bold uppercase">{product.billing_cycle}</span>}
                               {product.requires_dialing_code && <span className="badge badge-warning text-[9px] font-bold uppercase">Voice</span>}
                            </div>
                          </div>
                          <div className="product-card-footer mt-4 pt-4 border-t border-subtle">
                            <div className="grid-2 gap-4 w-full mb-6">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-muted uppercase">Wholesale</span>
                                  <span className="text-md font-bold text-primary">R {parseFloat(product.reseller_price).toFixed(2)}</span>
                               </div>
                               <div className="flex flex-col border-l border-subtle pl-4">
                                  <span className="text-[10px] font-bold text-muted uppercase">Suggested Retail</span>
                                  <span className="text-md font-bold opacity-60">R {parseFloat(product.price).toFixed(2)}</span>
                               </div>
                            </div>
                            <button 
                              className="btn btn-primary w-full py-3 shadow-lg"
                              disabled={addingToCart === product.id}
                              style={{ fontWeight: 800, minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap' }}
                              onClick={() => handleAddToCartAttempt(product)}
                            >
                              {addingToCart === product.id ? '...' : '+ Add to Order'}
                            </button>
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   /* REIMAGINED LIST VIEW */
                   <div className="border border-subtle rounded-2xl overflow-hidden bg-elevated">
                      <div className="grid grid-cols-[1fr_120px_140px_140px_140px] gap-2 px-6 py-4 text-[11px] font-bold uppercase text-muted bg-main border-b border-subtle sticky top-0 z-10">
                         <div>Product / Service</div>
                         <div className="text-center">Category</div>
                         <div className="text-right">Wholesale</div>
                         <div className="text-right">Retail</div>
                         <div className="text-right">Action</div>
                      </div>
                      <div className="divide-y divide-subtle">
                        {products.map((product: any) => (
                          <div key={product.id} className="grid grid-cols-[1fr_120px_140px_140px_140px] gap-2 items-center px-6 py-4 hover:bg-main transition-colors group">
                             <div className="flex flex-col">
                                <h4 className="font-bold text-sm tracking-tight">{product.name}</h4>
                                <div className="flex items-center gap-3 mt-1 text-[10px] opacity-40">
                                   <span className="font-mono">{product.sku}</span>
                                   {product.requires_dialing_code && <span>Voice Prefix Required</span>}
                                </div>
                             </div>
                             <div className="text-center text-xs opacity-60">
                                {product.category_name || 'Fleet'}
                             </div>
                             <div className="text-right font-bold text-brand-primary">
                                R {parseFloat(product.reseller_price).toFixed(2)}
                             </div>
                             <div className="text-right font-bold opacity-50">
                                R {parseFloat(product.price).toFixed(2)}
                             </div>
                             <div className="text-right">
                                <button 
                                  className="btn btn-sm btn-primary px-4 font-bold"
                                  disabled={addingToCart === product.id}
                                  onClick={() => handleAddToCartAttempt(product)}
                                >
                                  {addingToCart === product.id ? '...' : '+ Add to Order'}
                                </button>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}

                 {products.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.2 }}>
                      <h3 className="font-bold uppercase text-sm">No products found in this category.</h3>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>

      </div>

      {/* Dialing Code Modal */}
      {showDialingModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title font-bold">Voice Add-on Required</h3>
              <button className="btn btn-icon" onClick={() => setShowDialingModal(null)}>×</button>
            </div>
            <div className="modal-body py-6">
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Service: <b>{showDialingModal.name}</b><br/>
                Please select a regional dialing prefix for this line.
              </p>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Select Dialing Prefix</label>
                <select 
                  className="form-select font-bold" 
                  value={selectedCode} 
                  onChange={e => setSelectedCode(e.target.value)}
                >
                  <option value="">-- Choose Prefix --</option>
                  {dialingCodes.map((c: any) => (
                    <option key={c.id} value={c.code}>{c.code} ({c.region || 'Standard'})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDialingModal(null)}>Cancel</button>
              <button 
                className="btn btn-primary btn-sm px-8 font-bold" 
                disabled={!selectedCode || addingToCart === showDialingModal.id}
                onClick={() => addToCart(showDialingModal.id, { dialing_code: selectedCode })}
              >
                {addingToCart === showDialingModal.id ? 'Adding...' : 'Confirm & Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .category-nav-item:hover { background: var(--bg-main) !important; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
    </div>
  );
}
