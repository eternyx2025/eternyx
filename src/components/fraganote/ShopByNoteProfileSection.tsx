'use client';

import { useState } from 'react';
import { HomepageNoteProfile } from '@/lib/types';
import FraganoteProductCard from './FraganoteProductCard';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface ShopByNoteProfileProps {
  noteProfiles?: HomepageNoteProfile[];
  products?: any[];
  title?: string;
  onQuickView?: (product: any) => void;
}

export default function ShopByNoteProfileSection({
  noteProfiles = [],
  products = [],
  title = 'SHOP BY NOTE PROFILE',
  onQuickView,
}: ShopByNoteProfileProps) {
  const [selectedTag, setSelectedTag] = useState<string>(
    noteProfiles[0]?.tag || 'Gourmand'
  );

  if (!noteProfiles || noteProfiles.length === 0) return null;

  const filteredProducts = products.filter((p) => {
    const profile = (p.note_profile || '').toLowerCase();
    const tag = selectedTag.toLowerCase();
    const top = Array.isArray(p.top_notes) ? p.top_notes.join(' ').toLowerCase() : '';
    const heart = Array.isArray(p.heart_notes) ? p.heart_notes.join(' ').toLowerCase() : '';
    const base = Array.isArray(p.base_notes) ? p.base_notes.join(' ').toLowerCase() : '';
    const category = (p.category || '').toLowerCase();

    return (
      profile.includes(tag) ||
      top.includes(tag) ||
      heart.includes(tag) ||
      base.includes(tag) ||
      category.includes(tag)
    );
  });

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 4);

  return (
    <section className="fraganote-note-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        {/* Note Profile Avatars */}
        <div className="note-avatars-row">
          {noteProfiles.map((note) => {
            const isSelected = selectedTag.toLowerCase() === note.tag.toLowerCase();
            const imgSrc = formatImageUrl(note.imageUrl) || 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80';

            return (
              <button
                key={note.id}
                type="button"
                className={`note-avatar-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedTag(note.tag)}
              >
                <div className="avatar-img-frame">
                  <img
                    src={imgSrc}
                    alt={note.name}
                    className="avatar-img"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="avatar-label">{note.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Products Grid */}
        <div className="products-grid">
          {displayProducts.slice(0, 4).map((product) => (
            <div key={product.id} className="grid-item">
              <FraganoteProductCard product={product} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .fraganote-note-section {
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
          margin: 0 0 32px 0;
        }
        @media (max-width: 768px) {
          .section-title {
            font-size: 1.4rem;
          }
        }
        .note-avatars-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-bottom: 40px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 6px 0;
        }
        .note-avatars-row::-webkit-scrollbar {
          display: none;
        }
        .note-avatar-item {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .note-avatar-item:hover {
          transform: translateY(-2px);
        }
        .avatar-img-frame {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          overflow: hidden;
          background: #FAF6F4;
          border: 2px solid #EDE1DC;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .note-avatar-item.active .avatar-img-frame {
          border-color: #D99458;
          box-shadow: 0 0 0 3px rgba(217, 148, 88, 0.25);
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-label {
          font-family: var(--font-sans, system-ui);
          font-size: 0.8rem;
          font-weight: 700;
          color: #7A6E6A;
          letter-spacing: 0.02em;
        }
        .note-avatar-item.active .avatar-label {
          color: #1A1617;
          font-weight: 900;
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
          .note-avatars-row {
            justify-content: flex-start;
            gap: 18px;
          }
        }
      `}</style>
    </section>
  );
}

