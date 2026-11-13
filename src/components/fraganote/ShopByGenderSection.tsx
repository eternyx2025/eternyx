'use client';

import { useState } from 'react';
import FraganoteProductCard from './FraganoteProductCard';

interface ShopByGenderProps {
  products?: any[];
  title?: string;
  onQuickView?: (product: any) => void;
}

export default function ShopByGenderSection({
  products = [],
  title = 'SHOP BY GENDER',
  onQuickView,
}: ShopByGenderProps) {
  const [activeGender, setActiveGender] = useState<'HIM' | 'HER' | 'UNISEX'>('HIM');

  const filtered = products.filter((p) => {
    const g = (p.gender || '').toUpperCase();
    const c = (p.category || '').toUpperCase();
    if (activeGender === 'HIM') {
      return g.includes('HIM') || g.includes('MEN') || c.includes('MEN') || c.includes('HIM');
    }
    if (activeGender === 'HER') {
      return g.includes('HER') || g.includes('WOMEN') || c.includes('WOMEN') || c.includes('HER');
    }
    return g.includes('UNISEX') || c.includes('UNISEX') || (!g && !c.includes('MEN') && !c.includes('WOMEN'));
  });

  const displayProducts = filtered.length >= 2 ? filtered : products.slice(0, 4);

  return (
    <section className="fraganote-gender-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        {/* Gender Tabs */}
        <div className="gender-tabs">
          <button
            type="button"
            className={`gender-tab ${activeGender === 'HIM' ? 'active' : ''}`}
            onClick={() => setActiveGender('HIM')}
          >
            HIM
          </button>
          <button
            type="button"
            className={`gender-tab ${activeGender === 'HER' ? 'active' : ''}`}
            onClick={() => setActiveGender('HER')}
          >
            HER
          </button>
          <button
            type="button"
            className={`gender-tab ${activeGender === 'UNISEX' ? 'active' : ''}`}
            onClick={() => setActiveGender('UNISEX')}
          >
            UNISEX
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
        .fraganote-gender-section {
          background: #FAF6F4;
          padding: 50px 0;
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
        .gender-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 36px;
        }
        .gender-tab {
          background: #FFFFFF;
          color: #1A1617;
          border: 1px solid #E2D3CD;
          border-radius: 9999px;
          padding: 8px 26px;
          font-family: var(--font-sans, system-ui);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gender-tab:hover {
          border-color: #D99458;
          color: #D99458;
        }
        .gender-tab.active {
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
          .section-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </section>
  );
}

