'use client';

import { useState } from 'react';
import Link from 'next/link';
import FraganoteProductCard from './FraganoteProductCard';

interface ShopTheMomentProps {
  products?: any[];
  title?: string;
  onQuickView?: (product: any) => void;
}

export default function ShopTheMomentSection({
  products = [],
  title = 'SHOP THE MOMENT',
  onQuickView,
}: ShopTheMomentProps) {
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'new' | 'favorites'>('bestsellers');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'bestsellers') {
      return (
        p.is_bestseller ||
        p.badge?.toUpperCase().includes('BEST') ||
        p.category?.toUpperCase().includes('BEST')
      );
    }
    if (activeTab === 'new') {
      return (
        p.is_new_launch ||
        p.badge?.toUpperCase().includes('NEW') ||
        p.category?.toUpperCase().includes('NEW')
      );
    }
    if (activeTab === 'favorites') {
      return (
        p.is_trending ||
        p.badge?.toUpperCase().includes('TREND') ||
        p.badge?.toUpperCase().includes('FAV')
      );
    }
    return true;
  });

  // Fallback to all products if specific tab has fewer than 2 items
  const displayProducts = filteredProducts.length >= 2 ? filteredProducts : products.slice(0, 8);

  return (
    <section className="fraganote-shop-moment">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        {/* Tab Filters */}
        <div className="moment-tabs">
          <button
            type="button"
            className={`moment-tab ${activeTab === 'bestsellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('bestsellers')}
          >
            BEST SELLERS
          </button>
          <button
            type="button"
            className={`moment-tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            NEW LAUNCHES
          </button>
          <button
            type="button"
            className={`moment-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            SEASON'S FAVORITES
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="products-grid">
          {displayProducts.slice(0, 8).map((product) => (
            <div key={product.id} className="grid-item">
              <FraganoteProductCard product={product} onQuickView={onQuickView} />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="view-all-container">
          <Link href="/shop" className="view-all-link">
            View All
          </Link>
        </div>
      </div>

      <style jsx>{`
        .fraganote-shop-moment {
          background: #FAF6F4;
          padding: 60px 0 40px 0;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .section-title {
          font-family: var(--font-sans, system-ui);
          font-size: 1.85rem;
          font-weight: 900;
          color: #1A1617;
          text-align: center;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          margin: 0 0 24px 0;
        }
        .moment-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .moment-tab {
          background: #FFFFFF;
          color: #1A1617;
          border: 1px solid #E2D3CD;
          border-radius: 9999px;
          padding: 9px 22px;
          font-family: var(--font-sans, system-ui);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .moment-tab:hover {
          border-color: #D99458;
          color: #D99458;
        }
        .moment-tab.active {
          background: #1A1617;
          color: #FAF6F4;
          border-color: #1A1617;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 36px;
        }
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .section-title {
            font-size: 1.4rem;
          }
        }
        .view-all-container {
          text-align: center;
        }
        .view-all-link {
          font-family: var(--font-sans, system-ui);
          font-size: 0.9rem;
          font-weight: 700;
          color: #7A6E6A;
          text-decoration: underline;
          text-underline-offset: 4px;
          letter-spacing: 0.02em;
          transition: color 0.2s ease;
        }
        .view-all-link:hover {
          color: #D99458;
        }
      `}</style>
    </section>
  );
}

