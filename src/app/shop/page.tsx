'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import ProductModal, { Product } from '@/components/ProductModal';
import { useCart } from '@/context/CartContext';
import { useSearchParams, useRouter } from 'next/navigation';

import { DEFAULT_CATEGORIES } from '@/lib/types';

function formatImageUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com/thumbnail?id=')) {
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
    }
  }
  return url;
}

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', ...DEFAULT_CATEGORIES]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        let mappedProducts: Product[] = [];
        if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
          const data = await prodRes.value.json();
          if (Array.isArray(data)) {
            mappedProducts = data.map((p: any) => ({
              name: p.name,
              category: p.category,
              price: typeof p.price === 'number' ? `₹${p.price}` : p.price,
              image: p.image_url || '',
              badge: p.badge || null,
              additional_images: p.additional_images || [],
            }));
            setProducts(mappedProducts);
          }
        }

        let loadedCats: string[] = [];
        if (catRes.status === 'fulfilled' && catRes.value.ok) {
          const catData = await catRes.value.json();
          if (Array.isArray(catData) && catData.length > 0) {
            loadedCats = catData;
          }
        }
        if (loadedCats.length === 0) {
          loadedCats = [...DEFAULT_CATEGORIES];
        }

        const prodCats = Array.from(new Set(mappedProducts.map((p) => p.category).filter(Boolean)));
        const mergedCats = Array.from(new Set([...loadedCats, ...prodCats]));
        setCategories(['All', ...mergedCats]);
      } catch (err) {
        console.error('Failed to fetch shop data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    // Category match (case-insensitive)
    const categoryMatch = selectedCategory === 'All' || 
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    
    // Search query match (case-insensitive on name and category)
    const searchMatch = !query || 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());
      
    return categoryMatch && searchMatch;
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, '100 ml', 1, { x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <main className="shop-container">
        {/* Luxury Hero Header */}
        <section className="shop-header">
          <p className="shop-eyebrow">The Collection</p>
          <h1 className="shop-title">Silence is Luxury</h1>
          {query ? (
            <p className="shop-subtitle">
              Showing results for &ldquo;<span style={{ color: '#d4af37', fontWeight: 500 }}>{query}</span>&rdquo;
              <button 
                onClick={() => router.push('/shop')}
                className="clear-search-btn"
              >
                Clear Search
              </button>
            </p>
          ) : (
            <p className="shop-subtitle">
              An curated archive of our complex, enduring olfactory statements.
            </p>
          )}
        </section>

        {/* Category Navigation */}
        <section className="shop-filters-section">
          <div className="shop-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory.toLowerCase() === category.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="shop-grid-section">
          {loading ? (
            <div className="shop-skeleton-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-image" />
                  <div className="skeleton-info">
                    <div className="skeleton-text skeleton-category" />
                    <div className="skeleton-text skeleton-name" />
                    <div className="skeleton-text skeleton-price" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No creations found matching your request.</p>
            </div>
          ) : (
            <div className="shop-grid">
              {filteredProducts.map((product, index) => (
                <div
                  className="product-card"
                  key={index}
                  onClick={() => setSelectedProduct(product)}
                  style={{ flex: 'unset' }}
                >
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="product-card-img">
                    {product.image ? (
                      <Image
                        src={formatImageUrl(product.image)}
                        alt={product.name}
                        width={400}
                        height={460}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="product-card-placeholder">
                        <span className="placeholder-brand">ETERNYX</span>
                        <span className="placeholder-name">{product.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="product-card-info">
                    <p className="product-card-category">{product.category}</p>
                    <h3 className="product-card-name">{product.name}</h3>
                    
                    {/* Savings with Coupon */}
                    <p className="product-savings">(Saving ₹650.00 with NEW50)</p>
                    
                    {/* Price Row: Final Price with Coupon + Cut Original Price */}
                    <div className="product-price-row">
                      <span className="product-final-price">₹649</span>
                      <span className="product-cut-price">{product.price.startsWith('₹') ? product.price : `₹${product.price}`}</span>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="product-rating-pill">
                      <span className="rating-star">★</span>
                      <span>4.8</span>
                    </div>

                    {/* Single Full-Width Action Button */}
                    <div className="product-card-actions">
                      <button
                        className="btn-add-cart full-width"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      <style jsx>{`
        .shop-container {
          min-height: 100vh;
          background-color: #0a0a0a;
          padding: 140px 50px 80px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .shop-header {
          text-align: center;
          margin-bottom: 60px;
          max-width: 600px;
        }

        .shop-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #d4af37;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .shop-title {
          font-family: var(--font-serif);
          font-size: 2.75rem;
          color: #ffffff;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        .shop-subtitle {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          font-weight: 300;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: #ffffff;
          text-decoration: underline;
          margin-left: 12px;
          cursor: pointer;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0.7;
          transition: opacity 0.2s ease, color 0.2s ease;
          font-family: var(--font-sans);
        }

        .clear-search-btn:hover {
          opacity: 1;
          color: #d4af37;
        }

        .shop-filters-section {
          width: 100%;
          max-width: 1200px;
          margin-bottom: 50px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 20px;
        }

        .shop-filters {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .filter-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          padding: 8px 0;
          position: relative;
          transition: color 0.3s ease;
        }

        .filter-btn:hover, .filter-btn.active {
          color: #ffffff;
        }

        .filter-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #d4af37;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .filter-btn.active::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .shop-grid-section {
          width: 100%;
          max-width: 1200px;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 40px;
        }

        .no-products {
          text-align: center;
          padding: 100px 0;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--font-serif);
          font-style: italic;
        }

        .shop-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 40px;
        }

        .skeleton-card {
          background: #0c0c0c;
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          overflow: hidden;
          height: 480px;
          display: flex;
          flex-direction: column;
        }

        .skeleton-image {
          width: 100%;
          height: 280px;
          background: linear-gradient(90deg, #111 25%, #181818 50%, #111 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .skeleton-text {
          background: linear-gradient(90deg, #111 25%, #181818 50%, #111 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 2px;
        }

        .skeleton-category {
          height: 10px;
          width: 40%;
        }

        .skeleton-name {
          height: 18px;
          width: 70%;
        }

        .skeleton-price {
          height: 14px;
          width: 30%;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .shop-container {
            padding: 100px 24px 60px 24px;
          }
          .shop-title {
            font-size: 2rem;
          }
          .shop-filters {
            gap: 15px;
          }
          .shop-grid, .shop-skeleton-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <main className="shop-container">
        <section className="shop-header">
          <p className="shop-eyebrow">The Collection</p>
          <h1 className="shop-title">Silence is Luxury</h1>
          <p className="shop-subtitle">
            An curated archive of our complex, enduring olfactory statements.
          </p>
        </section>
        <section className="shop-grid-section">
          <div className="shop-skeleton-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-info">
                  <div className="skeleton-text skeleton-category" />
                  <div className="skeleton-text skeleton-name" />
                  <div className="skeleton-text skeleton-price" />
                </div>
              </div>
            ))}
          </div>
        </section>
        <style jsx>{`
          .shop-container {
            min-height: 100vh;
            background-color: #0a0a0a;
            padding: 140px 50px 80px 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .shop-header {
            text-align: center;
            margin-bottom: 60px;
            max-width: 600px;
          }
          .shop-eyebrow {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: #d4af37;
            margin-bottom: 12px;
            font-weight: 500;
          }
          .shop-title {
            font-family: var(--font-serif);
            font-size: 2.75rem;
            color: #ffffff;
            font-weight: 300;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
          }
          .shop-subtitle {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.5);
            line-height: 1.6;
            font-weight: 300;
          }
          .shop-grid-section {
            width: 100%;
            max-width: 1200px;
          }
          .shop-skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 40px;
          }
          .skeleton-card {
            background: #0c0c0c;
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            overflow: hidden;
            height: 480px;
            display: flex;
            flex-direction: column;
          }
          .skeleton-image {
            width: 100%;
            height: 280px;
            background: linear-gradient(90deg, #111 25%, #181818 50%, #111 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-info {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            flex: 1;
          }
          .skeleton-text {
            background: linear-gradient(90deg, #111 25%, #181818 50%, #111 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 2px;
          }
          .skeleton-category {
            height: 10px;
            width: 40%;
          }
          .skeleton-name {
            height: 18px;
            width: 70%;
          }
          .skeleton-price {
            height: 14px;
            width: 30%;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </main>
    }>
      <ShopContent />
    </Suspense>
  );
}
