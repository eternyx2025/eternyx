'use client';

import { useState, useEffect, Suspense } from 'react';
import ProductModal, { Product as ModalProduct } from '@/components/ProductModal';
import FraganoteProductCard from '@/components/fraganote/FraganoteProductCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEFAULT_CATEGORIES } from '@/lib/types';

interface ShopProduct {
  id: string;
  name: string;
  category: string;
  price: number | string;
  compare_at_price?: number;
  description?: string;
  volume?: string;
  image_url: string;
  additional_images?: string[];
  badge?: string | null;
  gender?: string;
  note_profile?: string;
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  rating?: number;
  review_count?: number;
  sizes?: { size: string; stock: number }[];
  is_trending?: boolean;
  is_new_launch?: boolean;
  is_bestseller?: boolean;
}

function ShopContent() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', ...DEFAULT_CATEGORIES]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

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

        let mappedProducts: ShopProduct[] = [];
        if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
          const data = await prodRes.value.json();
          if (Array.isArray(data)) {
            mappedProducts = data.map((p: any) => ({
              id: String(p.id || p.name),
              name: p.name,
              category: p.category || 'Eau de Parfum',
              price: typeof p.price === 'number' ? p.price : Number(String(p.price).replace(/[^0-9.]/g, '')) || 599,
              compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : Math.round((Number(p.price) || 599) * 1.5),
              description: p.description,
              volume: p.volume || '100ml',
              image_url: p.image_url || '',
              badge: p.badge || null,
              gender: p.gender || 'Unisex',
              note_profile: p.note_profile || (p.top_notes && p.top_notes[0]) || 'Luxury Blend',
              top_notes: p.top_notes || [],
              heart_notes: p.heart_notes || [],
              base_notes: p.base_notes || [],
              sizes: p.sizes || [{ size: '100ml', stock: 50 }],
              additional_images: p.additional_images || [],
              rating: p.rating || 4.8,
              review_count: p.review_count || 128,
              is_trending: Boolean(p.is_trending),
              is_new_launch: Boolean(p.is_new_launch),
              is_bestseller: Boolean(p.is_bestseller),
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
    const categoryMatch =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    const searchMatch =
      !query ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Convert selected ShopProduct into ModalProduct
  const modalProduct: ModalProduct | null = selectedProduct
    ? {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: typeof selectedProduct.price === 'number' ? `₹${selectedProduct.price}` : String(selectedProduct.price),
        image: selectedProduct.image_url,
        badge: selectedProduct.badge,
        description: selectedProduct.description,
        top_notes: selectedProduct.top_notes,
        heart_notes: selectedProduct.heart_notes,
        base_notes: selectedProduct.base_notes,
        sizes: selectedProduct.sizes,
        additional_images: selectedProduct.additional_images,
      }
    : null;

  return (
    <>
      <main className="shop-page-wrapper">
        <div className="shop-container">
          {/* Luxury Hero Header */}
          <section className="shop-header">
            <p className="shop-eyebrow">✦ THE OLFACTORY EDITIONS ✦</p>
            <h1 className="shop-title">Silence is Luxury</h1>
            {query ? (
              <p className="shop-subtitle">
                Showing results for &ldquo;
                <span style={{ color: '#D99458', fontWeight: 600 }}>{query}</span>
                &rdquo;
                <button onClick={() => router.push('/shop')} className="clear-search-btn">
                  Clear Search
                </button>
              </p>
            ) : (
              <p className="shop-subtitle">
                A curated archive of complex, enduring olfactory statements crafted with imported luxury oils.
              </p>
            )}
          </section>

          {/* Category Capsule Pills Navigation */}
          <section className="shop-filters-section">
            <div className="shop-filters">
              {categories.map((category) => {
                const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
                return (
                  <button
                    key={category}
                    className={`filter-capsule ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="shop-count-bar">
              <span>Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'fragrance' : 'fragrances'}</span>
            </div>
          </section>

          {/* Product Grid */}
          <section className="shop-grid-section">
            {loading ? (
              <div className="shop-skeleton-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
                <p className="no-products-text">No creations found matching your request.</p>
                <button
                  className="reset-filter-btn"
                  onClick={() => {
                    setSelectedCategory('All');
                    if (query) router.push('/shop');
                  }}
                >
                  View All Fragrances
                </button>
              </div>
            ) : (
              <div className="shop-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="shop-card-wrapper">
                    <FraganoteProductCard
                      product={product}
                      onQuickView={(p) => {
                        const target = products.find((item) => item.name === p.name || item.id === p.id);
                        if (target) setSelectedProduct(target);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Product Detail Quick View Modal */}
      <ProductModal product={modalProduct} onClose={() => setSelectedProduct(null)} />

      <style jsx>{`
        .shop-page-wrapper {
          min-height: 100vh;
          background-color: #FAF6F4;
          width: 100%;
        }

        .shop-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 130px 24px 90px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .shop-header {
          text-align: center;
          margin-bottom: 40px;
          max-width: 680px;
        }

        .shop-eyebrow {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #D99458;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .shop-title {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 4.5vw, 3.4rem);
          color: #1A1617;
          font-weight: 500;
          letter-spacing: -0.01em;
          margin-bottom: 14px;
          line-height: 1.15;
        }

        .shop-subtitle {
          font-size: 0.9rem;
          color: #7A6E6A;
          line-height: 1.6;
          font-weight: 400;
        }

        .clear-search-btn {
          background: #1A1617;
          border: none;
          color: #FAF6F4;
          margin-left: 12px;
          cursor: pointer;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .clear-search-btn:hover {
          background: #D99458;
          color: #1A1617;
        }

        .shop-filters-section {
          width: 100%;
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .shop-filters {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-capsule {
          background: #FFFFFF;
          border: 1.5px solid #EDE1DC;
          color: #1A1617;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 8px 18px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 4px rgba(26, 22, 23, 0.03);
          white-space: nowrap;
        }

        .filter-capsule:hover {
          border-color: #D99458;
          transform: translateY(-1px);
        }

        .filter-capsule.active {
          background: #1A1617;
          border-color: #1A1617;
          color: #FAF6F4;
          box-shadow: 0 4px 12px rgba(26, 22, 23, 0.15);
        }

        .shop-count-bar {
          font-size: 0.75rem;
          color: #7A6E6A;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .shop-grid-section {
          width: 100%;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .shop-card-wrapper {
          display: flex;
          flex-direction: column;
        }

        .no-products {
          text-align: center;
          padding: 80px 24px;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 16px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(26, 22, 23, 0.03);
        }

        .no-products-text {
          font-size: 1rem;
          color: #7A6E6A;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .reset-filter-btn {
          background: #1A1617;
          border: 1px solid #1A1617;
          color: #FAF6F4;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 12px 24px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .reset-filter-btn:hover {
          background: #D99458;
          border-color: #D99458;
          color: #1A1617;
        }

        .shop-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .skeleton-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          overflow: hidden;
          height: 480px;
          display: flex;
          flex-direction: column;
        }

        .skeleton-image {
          width: 100%;
          height: 280px;
          background: linear-gradient(90deg, #F5EDE9 25%, #FAF6F4 50%, #F5EDE9 75%);
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
          background: linear-gradient(90deg, #F5EDE9 25%, #FAF6F4 50%, #F5EDE9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
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
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 1100px) {
          .shop-grid,
          .shop-skeleton-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .shop-container {
            padding: 100px 16px 60px 16px;
          }
          .shop-grid,
          .shop-skeleton-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .shop-title {
            font-size: 2rem;
          }
          .shop-filters {
            gap: 8px;
          }
          .filter-capsule {
            padding: 7px 14px;
            font-size: 0.72rem;
          }
        }

        @media (max-width: 480px) {
          .shop-grid,
          .shop-skeleton-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="shop-page-wrapper">
          <div className="shop-container">
            <section className="shop-header">
              <p className="shop-eyebrow">✦ THE OLFACTORY EDITIONS ✦</p>
              <h1 className="shop-title">Silence is Luxury</h1>
              <p className="shop-subtitle">
                A curated archive of complex, enduring olfactory statements crafted with imported luxury oils.
              </p>
            </section>
            <section className="shop-grid-section">
              <div className="shop-skeleton-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
          </div>
          <style jsx>{`
            .shop-page-wrapper {
              min-height: 100vh;
              background-color: #FAF6F4;
              width: 100%;
            }
            .shop-container {
              max-width: 1240px;
              margin: 0 auto;
              padding: 130px 24px 90px 24px;
            }
            .shop-header {
              text-align: center;
              margin-bottom: 40px;
            }
            .shop-eyebrow {
              font-size: 0.68rem;
              text-transform: uppercase;
              letter-spacing: 0.25em;
              color: #D99458;
              font-weight: 700;
              margin-bottom: 12px;
            }
            .shop-title {
              font-family: var(--font-serif);
              font-size: 2.75rem;
              color: #1A1617;
              font-weight: 500;
              margin-bottom: 14px;
            }
            .shop-subtitle {
              font-size: 0.9rem;
              color: #7A6E6A;
            }
            .shop-skeleton-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 24px;
            }
            .skeleton-card {
              background: #FFFFFF;
              border: 1px solid #EDE1DC;
              border-radius: 12px;
              overflow: hidden;
              height: 480px;
            }
            .skeleton-image {
              width: 100%;
              height: 280px;
              background: #F5EDE9;
            }
            .skeleton-info {
              padding: 20px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .skeleton-text {
              background: #F5EDE9;
              border-radius: 4px;
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
          `}</style>
        </main>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
