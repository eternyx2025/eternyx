'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatImageUrl } from '@/lib/formatImageUrl';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    compare_at_price?: number;
    volume?: string;
    image_url: string;
    additional_images?: string[];
    badge?: string | null;
    gender?: string;
    note_profile?: string;
    top_notes?: string[];
    rating?: number;
    review_count?: number;
    sizes?: { size: string; stock: number }[];
    is_trending?: boolean;
    is_new_launch?: boolean;
    is_bestseller?: boolean;
    is_gifting?: boolean;
    gifting_category?: string;
  };
  onQuickView?: (product: any) => void;
}

export default function FraganoteProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Compute numerical price
  const numericPrice = typeof product.price === 'string'
    ? parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0
    : Number(product.price) || 0;

  // Compare at price / MRP calculation
  const comparePrice = product.compare_at_price && product.compare_at_price > numericPrice
    ? product.compare_at_price
    : Math.round(numericPrice * 1.5);

  const discountPercent = comparePrice > numericPrice
    ? Math.round(((comparePrice - numericPrice) / comparePrice) * 100)
    : 0;

  // Rating & Review count defaults
  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : '4.7';
  const reviewsCount = product.review_count || 128;

  // Top notes or tags
  const noteTags: string[] = [];
  if (product.note_profile) {
    noteTags.push(product.note_profile);
  }
  if (Array.isArray(product.top_notes) && product.top_notes.length > 0) {
    product.top_notes.slice(0, 2).forEach((n) => {
      if (!noteTags.includes(n)) noteTags.push(n);
    });
  }
  if (noteTags.length === 0) {
    noteTags.push('Luxury Blend', 'Eau De Parfum');
  }

  // Stock check
  const isOutOfStock = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes.every((s) => s.stock <= 0)
    : false;

  // Primary and hover image with fallback
  const fallbackProductImg = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';
  const primaryImg = formatImageUrl(product.image_url) || fallbackProductImg;
  const hoverImg = Array.isArray(product.additional_images) && product.additional_images[0]
    ? (formatImageUrl(product.additional_images[0]) || primaryImg)
    : primaryImg;

  // Campaign Badge determination
  const campaignBadge = product.badge
    ? product.badge
    : product.is_new_launch
    ? 'NEW LAUNCH'
    : product.is_trending
    ? 'TRENDING'
    : product.is_bestseller
    ? 'BESTSELLER'
    : null;

  const genderBadge = (product.gender || 'UNISEX').toUpperCase();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      alert(`We will notify you when ${product.name} is back in stock!`);
      return;
    }

    setIsAdding(true);
    addToCart(
      {
        name: product.name,
        category: (product as any).category || 'Eau De Parfum',
        price: numericPrice,
        image: primaryImg,
      },
      product.volume || (product.sizes?.[0]?.size || '50ML'),
      1
    );

    setTimeout(() => {
      setIsAdding(false);
      setIsCartOpen(true);
    }, 250);
  };

  return (
    <div
      className="fraganote-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Media Box with Badges */}
      <div className="card-media-wrapper">
        {/* Top Badges */}
        <div className="card-badge-row">
          {campaignBadge ? (
            <span className="card-campaign-badge">{campaignBadge}</span>
          ) : (
            <span />
          )}
          <span className="card-gender-badge">{genderBadge}</span>
        </div>

        {/* Product Image */}
        <div className="card-image-container">
          <img
            src={isHovered && hoverImg !== primaryImg ? hoverImg : primaryImg}
            alt={product.name}
            className="card-image"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Info Details */}
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>

        {/* Rating & Social Proof */}
        <div className="card-rating-row">
          <span className="rating-star">★ {ratingValue}</span>
          <span className="rating-divider">|</span>
          <span className="verified-check">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#1877f2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </span>
          <span className="reviews-count">({reviewsCount} Reviews)</span>
        </div>

        {/* Note Profile Pills */}
        <div className="card-notes-row">
          {noteTags.slice(0, 2).map((note, idx) => (
            <span key={idx} className="note-pill">
              {note}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div className="card-price-row">
          <span className="current-price">₹{numericPrice.toLocaleString('en-IN')}</span>
          {comparePrice > numericPrice && (
            <span className="original-price">₹{comparePrice.toLocaleString('en-IN')}</span>
          )}
          {discountPercent > 0 && (
            <span className="save-badge">SAVE {discountPercent}%</span>
          )}
        </div>

        {/* CTA Button */}
        <button
          type="button"
          className={`card-cta-btn ${isOutOfStock ? 'out-of-stock' : ''} ${isAdding ? 'loading' : ''}`}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'Notify Me' : isAdding ? 'Adding...' : 'Add to cart'}
        </button>
      </div>

      <style jsx>{`
        .fraganote-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          position: relative;
          height: 100%;
        }
        .fraganote-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(26, 22, 23, 0.08);
          border-color: #D99458;
        }
        .card-media-wrapper {
          position: relative;
          width: 100%;
          padding-top: 100%; /* 1:1 Aspect Ratio */
          background: #FAF6F4;
          overflow: hidden;
        }
        .card-badge-row {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 3;
          pointer-events: none;
        }
        .card-campaign-badge {
          background: rgba(217, 148, 88, 0.16);
          color: #B66D31;
          border: 1px solid rgba(217, 148, 88, 0.35);
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 9px;
          border-radius: 9999px;
        }
        .card-gender-badge {
          background: #1A1617;
          color: #FAF6F4;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 9px;
          border-radius: 9999px;
          margin-left: auto;
        }
        .card-image-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fraganote-card:hover .card-image {
          transform: scale(1.05);
        }
        .card-body {
          padding: 16px 14px 14px 14px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .card-title {
          font-family: var(--font-sans, system-ui);
          font-size: 0.92rem;
          font-weight: 800;
          color: #1A1617;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #7A6E6A;
          margin-bottom: 8px;
        }
        .rating-star {
          font-weight: 700;
          color: #D99458;
        }
        .rating-divider {
          color: #EDE1DC;
        }
        .verified-check {
          display: inline-flex;
          align-items: center;
        }
        .reviews-count {
          color: #7A6E6A;
        }
        .card-notes-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .note-pill {
          background: #FAF6F4;
          color: #1A1617;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 9999px;
          border: 1px solid #EDE1DC;
        }
        .card-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          margin-bottom: 14px;
        }
        .current-price {
          font-size: 1.05rem;
          font-weight: 800;
          color: #1A1617;
        }
        .original-price {
          font-size: 0.8rem;
          color: #8F8480;
          text-decoration: line-through;
        }
        .save-badge {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }
        .card-cta-btn {
          width: 100%;
          background: #1A1617;
          color: #FAF6F4;
          border: none;
          padding: 10px 16px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: capitalize;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .card-cta-btn:hover {
          background: #2D2527;
          transform: scale(1.02);
        }
        .card-cta-btn.out-of-stock {
          background: #FAF6F4;
          color: #7A6E6A;
          border: 1px solid #EDE1DC;
        }
      `}</style>
    </div>
  );
}

