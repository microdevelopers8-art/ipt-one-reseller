'use client';

import { useEffect, useState } from 'react';

interface Catalog {
  id: string;
  name: string;
  slug: string;
  color: string;
  type: string;
  icon: string;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  catalog_id: string;
  slug: string;
  product_count: number;
  description?: string;
  sort_order: number;
}

export default function CategoryManager() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [expandedCatalogs, setExpandedCatalogs] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [catRes, ctgRes] = await Promise.all([
        fetch('/api/catalogs'),
        fetch('/api/categories')
      ]);
      const catData = await catRes.json();
      const ctgData = await ctgRes.json();
      
      setCatalogs((catData.catalogs || []).sort((a: any, b: any) => a.sort_order - b.sort_order));
      setCategories((ctgData.categories || []).sort((a: any, b: any) => a.sort_order - b.sort_order));
      
      if (catData.catalogs?.length > 0 && expandedCatalogs.length === 0) {
        setExpandedCatalogs([catData.catalogs[0].id]);
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleCatalog = (id: string) => {
    if (expandedCatalogs.includes(id)) {
      setExpandedCatalogs(expandedCatalogs.filter(x => x !== id));
    } else {
      setExpandedCatalogs([...expandedCatalogs, id]);
    }
  };

  const toggleNode = (e: any, id: string) => {
    e.stopPropagation();
    if (expandedNodes.includes(id)) {
      setExpandedNodes(expandedNodes.filter(x => x !== id));
    } else {
      setExpandedNodes([...expandedNodes, id]);
    }
  };

  const handleAddNewUnder = (e: any, catalogId: string, parentId: string | null) => {
    if (e) e.stopPropagation();
    setActiveCategory(null);
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      parent_id: parentId,
      catalog_id: catalogId,
    });
    if (parentId && !expandedNodes.includes(parentId)) {
      setExpandedNodes([...expandedNodes, parentId]);
    }
  };

  const handleSelectToEdit = (e: any, cat: Category) => {
    e.stopPropagation();
    setActiveCategory(cat);
    setEditingCategory(cat);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const method = editingCategory.id ? 'PUT' : 'POST';
    const url = editingCategory.id ? `/api/categories/${editingCategory.id}` : '/api/categories';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (error) {}
  };

  const handleReorder = async (type: 'catalog' | 'category', items: any[]) => {
    try {
      await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, items: items.map((i, idx) => ({ id: i.id, sort_order: idx })) }),
      });
      loadAllData();
    } catch (err) {}
  };

  // Reorder Logic for categories
  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDropCategory = async (targetId: string, catalogId: string, parentId: string | null) => {
    if (!draggingId || draggingId === targetId) return;

    const dragItem = categories.find(c => c.id === draggingId);
    if (!dragItem || dragItem.catalog_id !== catalogId || dragItem.parent_id !== parentId) return;

    const sameLevel = categories.filter(c => c.catalog_id === catalogId && c.parent_id === parentId);
    const draggedIdx = sameLevel.findIndex(i => i.id === draggingId);
    const targetIdx = sameLevel.findIndex(i => i.id === targetId);

    const newItems = [...sameLevel];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    setDraggingId(null);
    handleReorder('category', newItems);
  };

  const onDropCatalog = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;

    const draggedIdx = catalogs.findIndex(i => i.id === draggingId);
    const targetIdx = catalogs.findIndex(i => i.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newItems = [...catalogs];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    setDraggingId(null);
    handleReorder('catalog', newItems);
  };

  const renderTree = (catalogId: string, parentId: string | null = null, level = 0) => {
    const nodes = categories.filter(c => c.catalog_id === catalogId && c.parent_id === parentId);
    if (!nodes.length) return null;

    return (
      <ul style={{ listStyle: 'none', paddingLeft: level === 0 ? '0px' : '16px', margin: 0 }}>
        {nodes.map(node => {
          const hasChildren = categories.some(c => c.parent_id === node.id);
          const isExpanded = expandedNodes.includes(node.id);
          const isActive = (activeCategory?.id === node.id);

          return (
            <li 
              key={node.id} 
              style={{ marginTop: '2px', cursor: 'grab' }}
              draggable
              onDragStart={() => onDragStart(node.id)}
              onDragOver={onDragOver}
              onDrop={() => onDropCategory(node.id, catalogId, parentId)}
            >
              <div 
                onClick={(e) => handleSelectToEdit(e, node)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--bg-active)' : draggingId === node.id ? 'rgba(0,0,0,0.1)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? 'var(--brand-primary)' : 'transparent'}`,
                  transition: 'background 0.1s',
                  opacity: draggingId === node.id ? 0.4 : 1
                }}
                className="hover-bg-elevated"
              >
                <div style={{ width: '16px', display: 'flex', justifyContent: 'center', cursor: 'pointer', opacity: hasChildren ? 0.7 : 0 }}
                  onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleNode(e, node.id); }}
                >
                  {isExpanded ? '▼' : '▶'}
                </div>
                <span style={{ fontSize: '13px', marginLeft: '6px', fontWeight: isActive ? 600 : 400, flex: 1, color: isActive ? 'var(--brand-primary)' : 'inherit' }}>
                  {node.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {node.product_count > 0 && <span style={{ fontSize: '10px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', opacity: 0.8 }}>{node.product_count}</span>}
                  <button onClick={(e) => handleAddNewUnder(e, catalogId, node.id)} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: 'var(--text-muted)' }} className="hover-text-primary">+</button>
                </div>
              </div>
              {isExpanded && renderTree(catalogId, node.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div className="flex justify-between items-center mb-6" style={{ flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Category & Taxonomy Manager</h2>
          <p className="text-muted">Rearrange hierarchies by dragging items within their respective folders.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        
        <div style={{ 
          width: '360px', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Catalog Hierarchies
            </h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {catalogs.map(catalog => {
              const isCatExpanded = expandedCatalogs.includes(catalog.id);
              return (
                <div 
                  key={catalog.id} 
                  style={{ marginBottom: '12px', cursor: 'grab' }}
                  draggable
                  onDragStart={() => onDragStart(catalog.id)}
                  onDragOver={onDragOver}
                  onDrop={() => onDropCatalog(catalog.id)}
                >
                  <div 
                    onClick={() => toggleCatalog(catalog.id)}
                    style={{
                      padding: '10px 12px',
                      background: isCatExpanded ? `${catalog.color}15` : 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: `1px solid ${isCatExpanded ? catalog.color : 'var(--border-subtle)'}`,
                      opacity: draggingId === catalog.id ? 0.4 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: catalog.color }}></div>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: isCatExpanded ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{catalog.name}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button className="btn btn-sm btn-primary" style={{ padding: '2px 8px', fontSize: '12px', height: '24px' }} onClick={(e) => handleAddNewUnder(e, catalog.id, null)}>+ Add</button>
                      <span style={{ fontSize: '10px', opacity: 0.5 }}>{isCatExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  
                  {isCatExpanded && (
                    <div style={{ padding: '8px 4px' }}>
                      {renderTree(catalog.id)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
               {activeCategory ? '✏️ Edit Selected Taxonomy' : 'Action Pane'}
            </h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            {!editingCategory ? (
              <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.7 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                <h3>Organize with Drag & Drop</h3>
                <p className="text-secondary text-sm">You can now drag any catalog or sub-category to rearrange its display order.<br/>Changes are saved automatically.</p>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>{editingCategory.id ? `Update: ${editingCategory.name}` : 'Create Category Node'}</h2>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="form-group">
                    <label className="form-label font-bold">Node Name *</label>
                    <input className="form-input" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\W+/g, '-') })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold">URL Path Identifier (Slug) *</label>
                    <input className="form-input" value={editingCategory.slug} onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold">Features & Description</label>
                    <textarea className="form-textarea" rows={5} value={editingCategory.description || ''} onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })} />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn btn-primary btn-lg px-12">Save Node</button>
                    <button type="button" className="btn btn-secondary btn-lg" onClick={() => { setEditingCategory(null); setActiveCategory(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg-elevated:hover { background: var(--bg-elevated) !important; }
        .hover-text-primary:hover { color: var(--brand-primary) !important; }
      `}} />
    </div>
  );
}
