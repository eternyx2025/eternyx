'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import WriteReviewModal from './WriteReviewModal';

interface ProductDetailClientProps {
  product: Product;
  richData?: any;
}

export default function ProductDetailClient({ product, richData }: ProductDetailClientProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedSize, setSelectedSize] = useState('100ml');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'journey' | 'specs' | 'faqs' | 'objections'>('journey');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [dbReviews, setDbReviews] = useState<{ author: string; rating: number; text: string; date: string }[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const fetchReviews = () => {
    if (!product?.name) return;
    fetch(`/api/reviews?productName=${encodeURIComponent(product.name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r: any) => ({
            author: r.customer,
            rating: Number(r.rating) || 5,
            text: r.comment,
            date: r.date || new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          }));
          setDbReviews(mapped);
        } else {
          setDbReviews([]);
        }
      })
      .catch(() => setDbReviews([]));
  };

  useEffect(() => {
    fetchReviews();
  }, [product?.name]);

  // Compile all images
  const allImages = [
    product.image_url,
    ...(product.additional_images || [])
  ].filter(Boolean) as string[];

  const altTexts = richData?.image_alt || [
    `ETERNYX ${product.name} Eau de Parfum 100ml bottle`,
    `ETERNYX ${product.name} luxury fragrance notes shot`,
    `ETERNYX ${product.name} perfume lifestyle showcase`
  ];

  const currentAlt = altTexts[activeImageIdx] || altTexts[0] || `${product.name} Eau de Parfum by ETERNYX`;

  const handleAddToCart = (e: React.MouseEvent) => {
    const productForCart = {
      name: product.name,
      category: product.category,
      price: `₹${product.price}`,
      image: product.image_url || '',
      badge: product.badge,
    };
    addToCart(productForCart, selectedSize, quantity, { x: e.clientX, y: e.clientY });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    handleAddToCart(e);
    setIsCartOpen(true);
  };

  const topNotes = (product.top_notes && product.top_notes.length > 0) ? product.top_notes : (richData?.scent_notes?.top || []);
  const heartNotes = (product.heart_notes && product.heart_notes.length > 0) ? product.heart_notes : (richData?.scent_notes?.mid || []);
  const baseNotes = (product.base_notes && product.base_notes.length > 0) ? product.base_notes : (richData?.scent_notes?.base || []);

  const journey = richData?.fragrance_journey;
  const keyFeatures = richData?.key_features || {
    "Fragrance Family": richData?.specs?.family || "Luxury Blend",
    "Longevity": richData?.longevity || richData?.specs?.longevity || "8–10 Hours",
    "Projection": richData?.projection || richData?.specs?.projection || "Moderate to Strong",
    "Season": richData?.season || richData?.specs?.season || "All-Year",
    "Occasion": richData?.occasion || richData?.specs?.occasion || "Daily & Evening",
    "Gender": richData?.gender || richData?.specs?.gender || "Unisex",
    "Volume": "100ml",
    "Made In": richData?.made_in || richData?.specs?.made_in || "Crafted with Premium Imported Oils"
  };

  const faqs = richData?.faqs || [];
  const objections = richData?.objection_handling || [];
  const amazonBullets = richData?.amazon_bullets || [];
  const perfectFor = richData?.perfect_for || [];
  const crossSells = richData?.cross_sells || [];

  return (
    <div className="pd-container">
      {/* Breadcrumb Navigation */}
      <nav className="pd-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="separator">/</span>
        <Link href="/shop">Shop</Link>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="pd-grid">
        {/* Left Column: Gallery & Scent Pyramid */}
        <div className="pd-media-col">
          <div className="pd-main-image-wrap">
            {product.badge && <span className="pd-badge">{product.badge}</span>}
            {allImages.length > 0 ? (
              <Image
                src={allImages[activeImageIdx] || allImages[0]}
                alt={currentAlt}
                width={650}
                height={750}
                priority
                className="pd-main-img"
                key={activeImageIdx}
                referrerPolicy="no-referrer"
                unoptimized={Boolean(
                  (allImages[activeImageIdx] || allImages[0])?.includes('drive.google.com') ||
                  (allImages[activeImageIdx] || allImages[0])?.includes('googleusercontent.com')
                )}
              />
            ) : (
              <div className="pd-no-image-box">
                <span className="placeholder-brand">ETERNYX</span>
                <span className="placeholder-name">{product.name}</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="pd-thumbnails">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd-thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`View ${product.name} image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={altTexts[idx] || `${product.name} thumbnail ${idx + 1}`}
                    className="pd-thumb-img"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Desktop Scent Pyramid */}
          {(topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0) && (
            <div className="pd-pyramid-card">
              <p className="pd-card-eyebrow">Olfactory Architecture</p>
              <h3 className="pd-card-title">Scent Pyramid</h3>
              <div className="pd-notes-list">
                {topNotes.length > 0 && (
                  <div className="pd-note-row">
                    <span className="pd-note-level">Top</span>
                    <div className="pd-note-tags">
                      {topNotes.map((n: string) => <span key={n} className="pd-tag">{n}</span>)}
                    </div>
                  </div>
                )}
                {heartNotes.length > 0 && (
                  <div className="pd-note-row">
                    <span className="pd-note-level">Heart</span>
                    <div className="pd-note-tags">
                      {heartNotes.map((n: string) => <span key={n} className="pd-tag">{n}</span>)}
                    </div>
                  </div>
                )}
                {baseNotes.length > 0 && (
                  <div className="pd-note-row">
                    <span className="pd-note-level">Base</span>
                    <div className="pd-note-tags">
                      {baseNotes.map((n: string) => <span key={n} className="pd-tag">{n}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="pd-info-col">
          <p className="pd-category">{product.category}</p>
          <h1 className="pd-title">{product.name}</h1>
          
          <div className="pd-price-row">
            <span className="pd-price">₹{product.price}</span>
            <span className="pd-mrp-strike">MRP ₹1,499</span>
            <span className="pd-discount-badge">60% OFF</span>
          </div>

          {dbReviews.length > 0 && (
            <div className="pd-rating-strip">
              <div className="pd-stars">
                {'★'.repeat(Math.max(1, Math.round(dbReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / dbReviews.length)))}
              </div>
              <span className="pd-rating-text">
                {(dbReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / dbReviews.length).toFixed(1)} ({dbReviews.length} Verified Customer {dbReviews.length === 1 ? 'Review' : 'Reviews'})
              </span>
            </div>
          )}

          {/* Short Premium Hook */}
          {richData?.hook && (
            <div className="pd-hook-box">
              <p className="pd-hook-text">&ldquo;{richData.hook}&rdquo;</p>
            </div>
          )}

          {/* Perfect For Tags */}
          {perfectFor.length > 0 && (
            <div className="pd-perfect-for">
              <p className="pd-sublabel">Ideal Occasions</p>
              <div className="pd-occasion-chips">
                {perfectFor.map((occ: string) => (
                  <span key={occ} className="pd-occasion-chip">{occ}</span>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="pd-size-section">
            <p className="pd-sublabel">Select Volume</p>
            <div className="pd-size-buttons">
              <button
                className={`pd-size-pill ${selectedSize === '100ml' ? 'active' : ''}`}
                onClick={() => setSelectedSize('100ml')}
              >
                100ml (Standard Luxury)
              </button>
            </div>
          </div>

          {/* Quantity & CTA Actions */}
          <div className="pd-action-row">
            <div className="pd-qty-control">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button className="pd-btn-cart" onClick={handleAddToCart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Add to Bag
            </button>

            <button className="pd-btn-buy" onClick={handleBuyNow}>
              Order Now • ₹{product.price * quantity}
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pd-trust-grid">
            <div className="pd-trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-label">Secure Checkout (Razorpay)</span>
            </div>
            <div className="pd-trust-item">
              <span className="trust-icon">🚚</span>
              <span className="trust-label">Free Express Dispatch</span>
            </div>
            <div className="pd-trust-item">
              <span className="trust-icon">🛡️</span>
              <span className="trust-label">100% Genuine Imported Oils</span>
            </div>
            <div className="pd-trust-item">
              <span className="trust-icon">🔄</span>
              <span className="trust-label">Easy Returns & Replacements</span>
            </div>
          </div>

          {/* Upsell Bundle Card */}
          {richData?.upsell && (
            <div className="pd-upsell-box">
              <div className="pd-upsell-tag">Luxury Upgrade</div>
              <p className="pd-upsell-body">{richData.upsell}</p>
            </div>
          )}

          {/* Amazon-Style Feature Bullets */}
          {amazonBullets.length > 0 && (
            <div className="pd-highlights-box">
              <h3 className="pd-box-heading">Key Highlights</h3>
              <ul className="pd-bullets-list">
                {amazonBullets.map((bullet: string, i: number) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Fragrance Story / Description */}
          {product.description && (
            <div className="pd-story-box" style={{ marginTop: '24px' }}>
              <p className="pd-sublabel">The Fragrance Story</p>
              <p className="pd-description" style={{ marginBottom: 0 }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Deep-Dive Interactive Details: Scent Journey, Specs, FAQs, Buyer Assurance */}
      <section className="pd-tabs-section">
        <div className="pd-tabs-nav">
          {journey && (
            <button
              className={`pd-tab-btn ${activeTab === 'journey' ? 'active' : ''}`}
              onClick={() => setActiveTab('journey')}
            >
              Fragrance Journey
            </button>
          )}
          <button
            className={`pd-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Technical Specifications
          </button>
          {faqs.length > 0 && (
            <button
              className={`pd-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('faqs')}
            >
              Frequently Asked Questions
            </button>
          )}
          {objections.length > 0 && (
            <button
              className={`pd-tab-btn ${activeTab === 'objections' ? 'active' : ''}`}
              onClick={() => setActiveTab('objections')}
            >
              Buyer Assurance
            </button>
          )}
        </div>

        <div className="pd-tab-panel">
          {activeTab === 'journey' && journey && (
            <div className="pd-journey-grid">
              <div className="pd-journey-card">
                <div className="journey-phase">0 – 30 MIN</div>
                <h4>The Opening</h4>
                <p>{journey.opening}</p>
              </div>
              <div className="pd-journey-card">
                <div className="journey-phase">30 MIN – 3 HRS</div>
                <h4>The Heart</h4>
                <p>{journey.heart}</p>
              </div>
              <div className="pd-journey-card">
                <div className="journey-phase">3 HRS+ (DRY DOWN)</div>
                <h4>The Sillage & Base</h4>
                <p>{journey.dry_down}</p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="pd-specs-table-wrap">
              <table className="pd-specs-table">
                <tbody>
                  {Object.entries(keyFeatures).map(([key, val]) => (
                    <tr key={key}>
                      <td className="spec-label">{key.replace('_', ' ').toUpperCase()}</td>
                      <td className="spec-value">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="pd-faqs-wrap">
              {faqs.map((faq: any, idx: number) => (
                <div className="pd-faq-item" key={idx}>
                  <button
                    className={`pd-faq-q ${expandedFaq === idx ? 'open' : ''}`}
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-toggle-sign">{expandedFaq === idx ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="pd-faq-a">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'objections' && (
            <div className="pd-objections-wrap">
              {objections.map((obj: any, idx: number) => (
                <div className="pd-obj-card" key={idx}>
                  <h4 className="pd-obj-q">{obj.question}</h4>
                  <p className="pd-obj-a">{obj.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cross-Sell Recommendations */}
      {crossSells.length > 0 && (
        <section className="pd-cross-sell-section">
          <p className="pd-cross-eyebrow">Complete The Olfactory Statement</p>
          <h2 className="pd-cross-title">Pairs Elegantly With</h2>
          <div className="pd-cross-pills">
            {crossSells.map((item: string, idx: number) => {
              const cleanSlug = item.toLowerCase().replace(/eterndx|eternyx/gi, '').trim().replace(/\s+/g, '-');
              return (
                <div key={idx} className="pd-cross-card">
                  <span className="cross-icon">✦</span>
                  <span className="cross-name">{item}</span>
                  {cleanSlug && (
                    <Link href={`/shop/${cleanSlug}`} className="cross-explore-link">
                      Explore &rarr;
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Verified Reviews Section */}
      <section className="pd-reviews-section">
        <div className="pd-review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p className="pd-review-eyebrow">Client Feedback</p>
            <h2 className="pd-review-title">Verified Reviews</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {dbReviews.length > 0 && (
              <div className="pd-review-score-box">
                <span className="pd-score-num">
                  {(dbReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / dbReviews.length).toFixed(1)}
                </span>
                <div>
                  <div className="pd-stars">
                    {'★'.repeat(Math.max(1, Math.round(dbReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / dbReviews.length)))}
                  </div>
                  <span className="pd-score-sub">Based on {dbReviews.length} authenticated {dbReviews.length === 1 ? 'review' : 'reviews'}</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              style={{
                background: 'rgba(200, 165, 100, 0.12)',
                border: '1px solid rgba(200, 165, 100, 0.45)',
                color: '#e8cf91',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.25s',
              }}
            >
              ✦ Write a Review
            </button>
          </div>
        </div>

        {dbReviews.length > 0 ? (
          <div className="pd-reviews-grid">
            {dbReviews.map((r, i) => (
              <div key={i} className="pd-review-card">
                <div className="review-top">
                  <span className="reviewer-avatar">{r.author ? r.author[0] : 'C'}</span>
                  <div>
                    <strong className="reviewer-name">{r.author || 'Verified Customer'}</strong>
                    <span className="reviewer-meta">{r.date}</span>
                  </div>
                  <span className="review-stars">{'★'.repeat(r.rating || 5)}</span>
                </div>
                <p className="review-text">&ldquo;{r.text}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <div 
            style={{ 
              padding: '36px 20px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.06)', 
              borderRadius: '12px', 
              textAlign: 'center',
              marginTop: '28px'
            }}
          >
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.9rem', marginBottom: '8px' }}>
              No reviews yet for this fragrance.
            </p>
            <p style={{ color: 'rgba(200, 165, 100, 0.85)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Be the first to share your experience with {product.name}.
            </p>
          </div>
        )}
      </section>

      {/* Write a Review Modal */}
      <WriteReviewModal
        productName={product.name}
        productId={product.id}
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        onReviewSubmitted={() => {
          fetchReviews();
        }}
      />

      {/* Styled JSX for the Product Detail Page */}
      <style jsx>{`
        .pd-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 130px 24px 100px 24px;
          color: #ffffff;
          background: #0a0a0a;
        }

        .pd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 40px;
        }

        .pd-breadcrumb a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .pd-breadcrumb a:hover {
          color: #d4af37;
        }

        .pd-breadcrumb .separator {
          color: rgba(255, 255, 255, 0.2);
        }

        .pd-breadcrumb .current {
          color: #d4af37;
          font-weight: 500;
        }

        .pd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: flex-start;
          margin-bottom: 90px;
        }

        .pd-media-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .pd-main-image-wrap {
          position: relative;
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 4 / 5;
        }

        .pd-badge {
          position: absolute;
          top: 18px;
          left: 18px;
          background: #d4af37;
          color: #000;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          z-index: 2;
        }

        .pd-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          background: #080808;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pd-main-image-wrap:hover .pd-main-img {
          transform: scale(1.03);
        }

        .pd-thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .pd-thumb-btn {
          width: 72px;
          height: 86px;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          opacity: 0.5;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .pd-thumb-btn.active, .pd-thumb-btn:hover {
          opacity: 1;
          border-color: #d4af37;
          transform: translateY(-2px);
        }

        .pd-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pd-pyramid-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 26px;
        }

        .pd-card-eyebrow {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #d4af37;
          margin-bottom: 6px;
        }

        .pd-card-title {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          font-weight: 300;
          color: #fff;
          margin-bottom: 18px;
        }

        .pd-notes-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pd-note-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pd-note-level {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.4);
          width: 50px;
          flex-shrink: 0;
        }

        .pd-note-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pd-tag {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 4px 10px;
          border-radius: 3px;
        }

        .pd-info-col {
          display: flex;
          flex-direction: column;
        }

        .pd-category {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #d4af37;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .pd-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 300;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: 0.03em;
          margin-bottom: 18px;
        }

        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 16px;
        }

        .pd-price {
          font-size: 2rem;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .pd-mrp-strike {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.35);
          text-decoration: line-through;
        }

        .pd-discount-badge {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          padding: 3px 8px;
          border-radius: 3px;
        }

        .pd-rating-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .pd-stars {
          color: #d4af37;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
        }

        .pd-rating-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .pd-hook-box {
          background: rgba(212, 175, 55, 0.04);
          border-left: 3px solid #d4af37;
          padding: 14px 18px;
          border-radius: 0 4px 4px 0;
          margin-bottom: 24px;
        }

        .pd-hook-text {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          font-style: italic;
        }

        .pd-description {
          font-size: 0.88rem;
          line-height: 1.85;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
          margin-bottom: 28px;
        }

        .pd-perfect-for {
          margin-bottom: 24px;
        }

        .pd-sublabel {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 10px;
        }

        .pd-occasion-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pd-occasion-chip {
          font-size: 0.7rem;
          color: rgba(212, 175, 55, 0.9);
          background: rgba(212, 175, 55, 0.06);
          border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 5px 12px;
          border-radius: 20px;
        }

        .pd-size-section {
          margin-bottom: 30px;
        }

        .pd-size-buttons {
          display: flex;
          gap: 12px;
        }

        .pd-size-pill {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #d4af37;
          color: #d4af37;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 3px;
          cursor: pointer;
        }

        .pd-action-row {
          display: flex;
          gap: 12px;
          margin-bottom: 35px;
        }

        .pd-qty-control {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0 4px;
        }

        .pd-qty-control button {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.1rem;
          width: 36px;
          height: 48px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .pd-qty-control button:hover {
          color: #d4af37;
        }

        .pd-qty-control span {
          font-size: 0.85rem;
          font-weight: 500;
          min-width: 24px;
          text-align: center;
        }

        .pd-btn-cart {
          flex: 1;
          padding: 15px 20px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          font-size: 0.72rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .pd-btn-cart:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #d4af37;
        }

        .pd-btn-buy {
          flex: 1.2;
          padding: 15px 24px;
          background: #d4af37;
          border: 1px solid #d4af37;
          color: #000;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pd-btn-buy:hover {
          background: #ffffff;
          border-color: #ffffff;
        }

        .pd-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 18px;
          margin-bottom: 30px;
        }

        .pd-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .trust-icon {
          font-size: 1rem;
        }

        .trust-label {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .pd-upsell-box {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.12) 100%);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .pd-upsell-tag {
          display: inline-block;
          background: #d4af37;
          color: #000;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 3px;
          margin-bottom: 10px;
        }

        .pd-upsell-body {
          font-size: 0.8rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 300;
        }

        .pd-highlights-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 22px;
        }

        .pd-box-heading {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #d4af37;
          margin-bottom: 14px;
        }

        .pd-bullets-list {
          list-style: square;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pd-bullets-list li {
          font-size: 0.78rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
        }

        /* Tabs Section */
        .pd-tabs-section {
          margin-bottom: 90px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 50px;
        }

        .pd-tabs-nav {
          display: flex;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
          overflow-x: auto;
          margin-bottom: 35px;
        }

        .pd-tab-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          border-radius: 3px;
        }

        .pd-tab-btn.active, .pd-tab-btn:hover {
          color: #ffffff;
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
        }

        .pd-journey-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .pd-journey-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 28px;
        }

        .journey-phase {
          font-size: 0.65rem;
          color: #d4af37;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .pd-journey-card h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #fff;
          margin-bottom: 12px;
          font-weight: 300;
        }

        .pd-journey-card p {
          font-size: 0.8rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.55);
        }

        .pd-specs-table-wrap {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          overflow: hidden;
        }

        .pd-specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .pd-specs-table tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .pd-specs-table tr:last-child {
          border-bottom: none;
        }

        .spec-label {
          padding: 16px 24px;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.4);
          width: 35%;
        }

        .spec-value {
          padding: 16px 24px;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 400;
        }

        .pd-faqs-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pd-faq-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          overflow: hidden;
        }

        .pd-faq-q {
          width: 100%;
          background: none;
          border: none;
          padding: 18px 24px;
          text-align: left;
          color: #fff;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .pd-faq-q:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .faq-toggle-sign {
          color: #d4af37;
          font-size: 1.2rem;
        }

        .pd-faq-a {
          padding: 0 24px 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
        }

        .pd-faq-a p {
          font-size: 0.8rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 14px;
        }

        .pd-objections-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pd-obj-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 20px 24px;
        }

        .pd-obj-q {
          font-size: 0.85rem;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .pd-obj-a {
          font-size: 0.78rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Cross-Sell Section */
        .pd-cross-sell-section {
          margin-bottom: 90px;
          text-align: center;
        }

        .pd-cross-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #d4af37;
          margin-bottom: 10px;
        }

        .pd-cross-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 300;
          color: #fff;
          margin-bottom: 35px;
        }

        .pd-cross-pills {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pd-cross-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 22px;
          border-radius: 40px;
          transition: all 0.3s ease;
        }

        .pd-cross-card:hover {
          border-color: #d4af37;
          background: rgba(212, 175, 55, 0.05);
        }

        .cross-icon {
          color: #d4af37;
          font-size: 0.75rem;
        }

        .cross-name {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .cross-explore-link {
          font-size: 0.7rem;
          color: #d4af37;
          text-decoration: none;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-left: 6px;
        }

        /* Reviews Section */
        .pd-reviews-section {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 60px;
        }

        .pd-review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .pd-review-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #d4af37;
          margin-bottom: 8px;
        }

        .pd-review-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 300;
          color: #fff;
        }

        .pd-review-score-box {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pd-score-num {
          font-family: var(--font-serif);
          font-size: 3rem;
          font-weight: 300;
          color: #fff;
          line-height: 1;
        }

        .pd-score-sub {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .pd-reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .pd-review-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 24px;
        }

        .review-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .reviewer-avatar {
          width: 34px;
          height: 34px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: #d4af37;
          font-weight: 600;
        }

        .reviewer-name {
          display: block;
          font-size: 0.82rem;
          color: #fff;
        }

        .reviewer-meta {
          display: block;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .review-stars {
          margin-left: auto;
          color: #d4af37;
          font-size: 0.8rem;
        }

        .review-text {
          font-size: 0.82rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
          font-style: italic;
        }

        @media (max-width: 960px) {
          .pd-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .pd-journey-grid {
            grid-template-columns: 1fr;
          }
          .pd-objections-wrap {
            grid-template-columns: 1fr;
          }
          .pd-reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
