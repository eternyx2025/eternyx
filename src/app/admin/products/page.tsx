'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Product, DEFAULT_CATEGORIES } from '@/lib/types';
import Image from 'next/image';
import { compressImage } from '@/lib/compressImage';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(180);
  const [formComparePrice, setFormComparePrice] = useState<number | ''>('');
  const [formCategory, setFormCategory] = useState('MENS');
  const [formGender, setFormGender] = useState('UNISEX');
  const [formNoteProfile, setFormNoteProfile] = useState('');
  const [formVolume, setFormVolume] = useState('100 ml');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAdditionalImages, setFormAdditionalImages] = useState<string[]>([]);
  const [formBadge, setFormBadge] = useState('');
  const [formVisible, setFormVisible] = useState(true);
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formIsNewLaunch, setFormIsNewLaunch] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formIsGifting, setFormIsGifting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    const updatedItems = items.map((item, index) => ({ ...item, position: index }));
    setProducts(updatedItems);

    // Persist to server
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: updatedItems.map(item => ({ id: item.id, position: item.position }))
        })
      });
    } catch (error) {
      console.error('Failed to reorder', error);
      // Revert on fail
      fetchProducts();
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      setProducts(products.map(p => p.id === id ? { ...p, visible: !currentStatus } : p));
      await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !currentStatus })
      });
    } catch (error) {
      console.error('Failed to toggle visibility');
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete');
    }
  };

  const openDrawer = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormDescription(product.description || '');
      setFormPrice(product.price);
      setFormComparePrice(product.compare_at_price ?? '');
      setFormCategory((product.category || 'MENS').toUpperCase().trim());
      setFormGender(product.gender || 'UNISEX');
      setFormNoteProfile(product.note_profile || '');
      setFormVolume(product.volume || '100 ml');
      setFormImageUrl(product.image_url || '');
      setFormAdditionalImages(product.additional_images || []);
      setFormBadge(product.badge || '');
      setFormVisible(product.visible);
      setFormIsBestseller(Boolean(product.is_bestseller));
      setFormIsNewLaunch(Boolean(product.is_new_launch));
      setFormIsTrending(Boolean(product.is_trending));
      setFormIsGifting(Boolean(product.is_gifting));
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormDescription('');
      setFormPrice(180);
      setFormComparePrice('');
      setFormCategory(categories[0] || 'MENS');
      setFormGender('UNISEX');
      setFormNoteProfile('');
      setFormVolume('100 ml');
      setFormImageUrl('');
      setFormAdditionalImages([]);
      setFormBadge('');
      setFormVisible(true);
      setFormIsBestseller(false);
      setFormIsNewLaunch(false);
      setFormIsTrending(false);
      setFormIsGifting(false);
    }
    setIsDrawerOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    const inputElement = e.target;

    setUploading(true);
    try {
      const file = await compressImage(rawFile);
      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'image/jpeg',
          'x-filename': file.name,
        },
        body: file,
      });

      if (res.ok) {
        const data = await res.json();
        setFormImageUrl(data.url);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Upload error.');
    } finally {
      if (inputElement) inputElement.value = '';
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const inputElement = e.target;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        const file = await compressImage(rawFile);
        const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'image/jpeg',
            'x-filename': file.name,
          },
          body: file,
        });
        if (res.ok) {
          const data = await res.json();
          setFormAdditionalImages(prev => [...prev, data.url]);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Upload error.');
    } finally {
      if (inputElement) inputElement.value = '';
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formImageUrl) {
      alert('Please fill in Name, Price, and Image.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      compare_at_price: formComparePrice !== '' ? Number(formComparePrice) : null,
      category: formCategory,
      gender: formGender,
      note_profile: formNoteProfile.trim() || null,
      volume: formVolume,
      image_url: formImageUrl,
      additional_images: formAdditionalImages,
      badge: formBadge.trim() || null,
      visible: formVisible,
      is_bestseller: formIsBestseller,
      is_new_launch: formIsNewLaunch,
      is_trending: formIsTrending,
      is_gifting: formIsGifting,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsDrawerOpen(false);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <button onClick={() => openDrawer(null)} className="admin-btn-primary">
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="th col-drag"></div>
          <div className="th col-image">Image</div>
          <div className="th col-name">Name</div>
          <div className="th col-price">Price</div>
          <div className="th col-badge">Badge</div>
          <div className="th col-status">Status</div>
          <div className="th col-actions">Actions</div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="table-body">
                {products.length === 0 && (
                  <div className="empty-state">No products found. Add your first product.</div>
                )}
                {products.map((product, index) => (
                  <Draggable key={product.id} draggableId={product.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`table-row ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div className="td col-drag" {...provided.dragHandleProps}>
                          <span className="drag-handle">⋮⋮</span>
                        </div>
                        <div className="td col-image">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="row-img" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="row-img-placeholder"></div>
                          )}
                        </div>
                        <div className="td col-name">
                          <strong>{product.name}</strong>
                          <span className="subtext">{product.category}</span>
                        </div>
                        <div className="td col-price">₹{product.price}</div>
                        <div className="td col-badge">
                          {product.badge ? (
                            <span className="badge-tag">{product.badge}</span>
                          ) : (
                            <span className="subtext">—</span>
                          )}
                        </div>
                        <div className="td col-status">
                          <button 
                             className={`toggle-btn ${product.visible ? 'on' : 'off'}`}
                             onClick={() => toggleVisibility(product.id, product.visible)}
                          >
                            {product.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                        <div className="td col-actions">
                          <button onClick={() => openDrawer(product)} className="action-link edit">Edit</button>
                          <button onClick={() => deleteProduct(product.id)} className="action-link delete">Delete</button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Sliding Form Drawer */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className={`drawer-content ${isDrawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
          <div className="drawer-header">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="drawer-form">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)} 
                placeholder="Product Name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value)} 
                  required
                >
                  {formCategory && !categories.includes(formCategory) && (
                    <option value={formCategory} style={{ background: '#0d0d0d', color: '#fff' }}>
                      {formCategory}
                    </option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat} value={cat} style={{ background: '#0d0d0d', color: '#fff' }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Volume</label>
                <input 
                  type="text" 
                  value={formVolume} 
                  onChange={(e) => setFormVolume(e.target.value)} 
                  placeholder="e.g. 100 ml"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  value={formPrice} 
                  onChange={(e) => setFormPrice(Number(e.target.value))} 
                  placeholder="599"
                  required
                />
              </div>

              <div className="form-group">
                <label>Compare at Price / MRP (₹)</label>
                <input 
                  type="number" 
                  value={formComparePrice} 
                  onChange={(e) => setFormComparePrice(e.target.value ? Number(e.target.value) : '')} 
                  placeholder="e.g. 1699 (for strikethrough discount)"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender Tag</label>
                <select 
                  value={formGender} 
                  onChange={(e) => setFormGender(e.target.value)}
                >
                  <option value="UNISEX" style={{ background: '#0d0d0d', color: '#fff' }}>UNISEX</option>
                  <option value="HIM" style={{ background: '#0d0d0d', color: '#fff' }}>HIM / MEN</option>
                  <option value="HER" style={{ background: '#0d0d0d', color: '#fff' }}>HER / WOMEN</option>
                </select>
              </div>

              <div className="form-group">
                <label>Note Profile</label>
                <input 
                  type="text" 
                  value={formNoteProfile} 
                  onChange={(e) => setFormNoteProfile(e.target.value)} 
                  placeholder="e.g. Gourmand, Vanilla, Floral"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Campaign Badge (Optional)</label>
              <input 
                type="text" 
                value={formBadge} 
                onChange={(e) => setFormBadge(e.target.value)} 
                placeholder="e.g. NEW LAUNCH, TRENDING, CUSTOMISABLE"
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '14px 0' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}>
                <input 
                  type="checkbox" 
                  checked={formIsBestseller} 
                  onChange={(e) => setFormIsBestseller(e.target.checked)} 
                />
                Best Seller
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}>
                <input 
                  type="checkbox" 
                  checked={formIsNewLaunch} 
                  onChange={(e) => setFormIsNewLaunch(e.target.checked)} 
                />
                New Launch
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}>
                <input 
                  type="checkbox" 
                  checked={formIsTrending} 
                  onChange={(e) => setFormIsTrending(e.target.checked)} 
                />
                Trending / Season Favorite
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}>
                <input 
                  type="checkbox" 
                  checked={formIsGifting} 
                  onChange={(e) => setFormIsGifting(e.target.checked)} 
                />
                Gifting Edit Set
              </label>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                placeholder="Fragrance description..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <div className="image-upload-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  id="product-image-upload" 
                  style={{ display: 'none' }}
                />
                <label htmlFor="product-image-upload" className="upload-box">
                  {uploading ? (
                    <span className="spinner">Uploading...</span>
                  ) : formImageUrl ? (
                    <img src={formImageUrl} alt="Preview" className="upload-preview" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="upload-placeholder">Click to upload image</span>
                  )}
                </label>
                {formImageUrl && (
                  <p className="image-url-text">URL: {formImageUrl}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Images</label>
              <div className="additional-images-list">
                {formAdditionalImages.map((url, idx) => (
                  <div key={idx} className="additional-image-item">
                    <img src={url} alt={`Additional ${idx + 1}`} className="additional-preview-thumb" referrerPolicy="no-referrer" />
                    <button 
                      type="button" 
                      onClick={() => setFormAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                      className="delete-img-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleAdditionalImageUpload}
                  id="additional-images-upload" 
                  style={{ display: 'none' }}
                />
                <label htmlFor="additional-images-upload" className="additional-upload-box">
                  + Add Images
                </label>
              </div>
            </div>

            <div className="form-group toggle-group">
              <label>Visible on Website</label>
              <button 
                type="button"
                className={`toggle-btn ${formVisible ? 'on' : 'off'}`}
                onClick={() => setFormVisible(!formVisible)}
              >
                {formVisible ? 'Yes' : 'No'}
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={uploading || submitting}>
              {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .admin-loading {
          padding: 40px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--font-sans);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .admin-btn-primary {
          background: #d4af37;
          color: #000;
          padding: 10px 20px;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        
        .admin-btn-primary:hover {
          opacity: 0.9;
        }

        .table-container {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .table-header {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }

        .table-row {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          background: #111;
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: #151515;
        }

        .table-row.dragging {
          background: #1a1a1a;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .th, .td {
          display: flex;
          align-items: center;
        }

        .col-drag { width: 40px; flex-shrink: 0; }
        .col-image { width: 80px; flex-shrink: 0; }
        .col-name { flex: 1; min-width: 200px; flex-direction: column; align-items: flex-start; justify-content: center; }
        .col-price { width: 100px; flex-shrink: 0; font-family: var(--font-serif); }
        .col-badge { width: 150px; flex-shrink: 0; }
        .col-status { width: 120px; flex-shrink: 0; }
        .col-actions { width: 120px; flex-shrink: 0; gap: 12px; justify-content: flex-end; }

        .drag-handle {
          color: rgba(255, 255, 255, 0.2);
          cursor: grab;
          font-size: 1.2rem;
          letter-spacing: -2px;
        }
        
        .drag-handle:active {
          cursor: grabbing;
        }

        .row-img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 4px;
          background: #000;
        }

        .row-img-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          background: #222;
        }

        .col-name strong {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          font-weight: 300;
          color: #fff;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }

        .subtext {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .badge-tag {
          font-size: 0.65rem;
          padding: 4px 8px;
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 2px;
          letter-spacing: 0.1em;
        }

        .toggle-btn {
          background: none;
          border: 1px solid;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn.on {
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.1);
        }

        .toggle-btn.off {
          color: rgba(255, 255, 255, 0.4);
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .action-link {
          background: none;
          border: none;
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .action-link.edit {
          color: #d4af37;
        }

        .action-link.edit:hover {
          color: #fff;
        }

        .action-link.delete {
          color: rgba(239, 68, 68, 0.7);
        }

        .action-link.delete:hover {
          color: #ef4444;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        /* Drawer Styles */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .drawer-content {
          position: fixed;
          top: 0;
          right: -480px;
          width: 100%;
          max-width: 480px;
          height: 100vh;
          max-height: 100vh;
          background: #0d0d0d;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          padding: 30px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .drawer-content::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .drawer-content::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }
        .drawer-content::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.6);
        }

        .drawer-content.open {
          right: 0;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .drawer-header h2 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: #fff;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.05em;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: color 0.2s;
          padding: 5px;
        }

        .close-btn:hover {
          color: #fff;
        }

        .drawer-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 40px;
          flex-shrink: 0;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          padding: 10px 14px;
          color: #fff;
          font-size: 0.9rem;
          font-family: var(--font-sans);
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #d4af37;
          background: rgba(255, 255, 255, 0.04);
        }

        .image-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upload-box {
          height: 120px;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .upload-box:hover {
          border-color: #d4af37;
        }

        .upload-placeholder {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.3);
        }

        .upload-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-url-text {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.3);
          word-break: break-all;
          margin: 0;
        }

        .toggle-group {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .additional-images-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 4px;
        }

        .additional-image-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #000;
        }

        .additional-preview-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .delete-img-btn {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          color: #ef4444;
          border: none;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0;
          cursor: pointer;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .additional-image-item:hover .delete-img-btn {
          opacity: 1;
        }

        .additional-upload-box {
          width: 80px;
          height: 80px;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: border-color 0.2s;
          background: rgba(255, 255, 255, 0.01);
        }

        .additional-upload-box:hover {
          border-color: #d4af37;
          color: #fff;
        }

        .submit-btn {
          margin-top: 15px;
          background: #d4af37;
          color: #000;
          border: none;
          padding: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
