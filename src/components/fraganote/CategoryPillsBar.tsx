'use client';

import { useRef } from 'react';
import { HomepageCategoryPill } from '@/lib/types';

interface CategoryPillsBarProps {
  pills?: HomepageCategoryPill[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function CategoryPillsBar({
  pills = [],
  selectedCategory = 'all',
  onSelectCategory,
}: CategoryPillsBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const activePills = pills.filter((p) => p.active !== false);
  if (activePills.length === 0) return null;

  const handleSelect = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
  };

  return (
    <div className="fraganote-category-bar">
      <div className="container">
        <div className="category-scroll-container" ref={containerRef}>
          {activePills.map((pill) => {
            const isSelected = selectedCategory.toLowerCase() === pill.slug.toLowerCase();
            return (
              <button
                key={pill.id}
                type="button"
                className={`category-pill ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelect(pill.slug)}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .fraganote-category-bar {
          background: #FAF6F4;
          padding: 8px 0 10px 0;
          border-bottom: 1px solid #EDE1DC;
          position: relative;
          width: 100%;
          margin: 0;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .category-scroll-container {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 2px 0;
        }
        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          background: #FFFFFF;
          color: #1A1617;
          border: 1px solid #E2D3CD;
          border-radius: 9999px;
          padding: 6px 18px;
          font-family: var(--font-sans, system-ui);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        .category-pill:hover {
          border-color: #D99458;
          color: #D99458;
        }
        .category-pill.active {
          background: #1A1617;
          color: #FAF6F4;
          border-color: #1A1617;
        }
      `}</style>
    </div>
  );
}

