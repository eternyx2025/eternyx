'use client';

import { useState } from 'react';
import FraganoteProductCard from './FraganoteProductCard';

interface GiftingEditProps {
  products?: any[];
  title?: string;
  onQuickView?: (product: any) => void;
}

export default function GiftingEditSection({
  products = [],
  title = 'THE GIFTING EDIT',
  onQuickView,
}: GiftingEditProps) {
  const [activeTab, setActiveTab] = useState<'GIFT BOX' | 'COMBOS' | 'BUNDLE' | 'DISCOVERY'>('GIFT BOX');

  const giftingProducts = products.filter((p) => {
    const isGift = p.is_gifting || p.category?.toUpperCase().includes('GIFT') || p.name?.toUpperCase().includes('GIFT') || p.name?.toUpperCase().includes('SET');
    const cat = (p.gifting_category || p.category || '').toUpperCase();

    if (activeTab === 'GIFT BOX') {
      return isGift && (cat.includes('BOX') || cat.includes('GIFT') || !p.gifting_category);
    }
    if (activeTab === 'COMBOS') {
      return isGift && (cat.includes('COMBO') || cat.includes('PAIR'));
    }
    if (activeTab === 'BUNDLE') {
      return isGift && (cat.includes('BUNDLE') || cat.includes('PACK'));
    }
    if (activeTab === 'DISCOVERY') {
      return isGift && (cat.includes('DISCOVERY') || cat.includes('SAMPLE'));
    }
    return isGift;
  });

  const displayProducts = giftingProducts.length >= 2 ? giftingProducts : products.slice(0, 4);

  return (
    <section className="fraganote-gifting-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        {/* Gifting Tabs */}
        <div className="gifting-tabs">
          <button
            type="button"
            className={`gifting-tab ${activeTab === 'GIFT BOX' ? 'active' : ''}`}
            onClick={() => setActiveTab('GIFT BOX')}
          >
            GIFT BOX
          </button>
          <button
            type="button"
            className={`gifting-tab ${activeTab === 'COMBOS' ? 'active' : ''}`}
            onClick={() => setActiveTab('COMBOS')}
          >
            COMBOS
          </button>
          <button
            type="button"
            className={`gifting-tab ${activeTab === 'BUNDLE' ? 'active' : ''}`}
            onClick={() => setActiveTab('BUNDLE')}
          >
            BUILD YOUR BUNDLE
          </button>
          <button
            type="button"
            className={`gifting-tab ${activeTab === 'DISCOVERY' ? 'active' : ''}`}
            onClick={() => setActiveTab('DISCOVERY')}
          >
            DISCOVERY SETS
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {displayProducts.slice(0, 4).map((product) => (
            <div key={product.id} className="grid-item">
              <FraganoteProductCard product={product} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .fraganote-gifting-section {
          background: #FAF6F4;
          padding: 60px 0;
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
        @media (max-width: 768px) {
          .section-title {
            font-size: 1.4rem;
          }
        }
        .gifting-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .gifting-tab {
          background: #FFFFFF;
          color: #1A1617;
          border: 1px solid #E2D3CD;
          border-radius: 9999px;
          padding: 8px 22px;
          font-family: var(--font-sans, system-ui);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gifting-tab:hover {
          border-color: #D99458;
          color: #D99458;
        }
        .gifting-tab.active {
          background: #1A1617;
          color: #FAF6F4;
          border-color: #1A1617;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
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
        }
      `}</style>
    </section>
  );
}

