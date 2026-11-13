'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import WriteReviewModal from './WriteReviewModal';
import { formatImageUrl } from '@/lib/formatImageUrl';

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

  // Compile all images with Google Drive URL format support and fallback
  const rawImages = [
    product.image_url,
    ...(product.additional_images || [])
  ].filter(Boolean) as string[];

  const slug = (product.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const fallbackImg = `/images/product-${slug}.png`;

  const allImages = (
    rawImages.length > 0 
      ? rawImages.map(formatImageUrl) 
      : [fallbackImg]
  ).filter(Boolean);

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
    <div className="pd-page-wrapper">
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
                background: '#FFFFFF',
                border: '1px solid #EDE1DC',
                color: '#1A1617',
                padding: '10px 22px',
                borderRadius: '24px',
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.25s',
                boxShadow: '0 2px 8px rgba(26, 22, 23, 0.04)',
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
              background: '#FFFFFF', 
              border: '1px solid #EDE1DC', 
              borderRadius: '12px', 
              textAlign: 'center',
              marginTop: '28px'
            }}
          >
            <p style={{ color: '#7A6E6A', fontSize: '0.9rem', marginBottom: '8px' }}>
              No reviews yet for this fragrance.
            </p>
            <p style={{ color: '#D99458', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: 600 }}>
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
        .pd-page-wrapper {
          background-color: #FAF6F4;
          min-height: 100vh;
          width: 100%;
        }

        .pd-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 130px 24px 100px 24px;
          color: #1A1617;
          background: transparent;
        }

        .pd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7A6E6A;
          margin-bottom: 40px;
        }

        .pd-breadcrumb a {
          color: #1A1617;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .pd-breadcrumb a:hover {
          color: #D99458;
        }

        .pd-breadcrumb .separator {
          color: #EDE1DC;
        }

        .pd-breadcrumb .current {
          color: #D99458;
          font-weight: 600;
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
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 4 / 5;
          box-shadow: 0 10px 30px rgba(26, 22, 23, 0.04);
        }

        .pd-badge {
          position: absolute;
          top: 18px;
          left: 18px;
          background: #1A1617;
          color: #FAF6F4;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          z-index: 2;
        }

        .pd-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          background: #FAF6F4;
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
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 8px;
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          opacity: 0.6;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .pd-thumb-btn.active, .pd-thumb-btn:hover {
          opacity: 1;
          border-color: #D99458;
          box-shadow: 0 4px 12px rgba(217, 148, 88, 0.2);
          transform: translateY(-2px);
        }

        .pd-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pd-pyramid-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          padding: 26px;
          box-shadow: 0 6px 20px rgba(26, 22, 23, 0.03);
        }

        .pd-card-eyebrow {
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #D99458;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .pd-card-title {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          font-weight: 500;
          color: #1A1617;
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
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7A6E6A;
          font-weight: 600;
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
          color: #1A1617;
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          padding: 5px 12px;
          border-radius: 6px;
          font-weight: 500;
        }

        .pd-info-col {
          display: flex;
          flex-direction: column;
        }

        .pd-category {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #D99458;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .pd-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 500;
          color: #1A1617;
          line-height: 1.15;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
        }

        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 16px;
        }

        .pd-price {
          font-size: 2.1rem;
          font-weight: 600;
          color: #1A1617;
          letter-spacing: -0.02em;
        }

        .pd-mrp-strike {
          font-size: 1.1rem;
          color: #8F8480;
          text-decoration: line-through;
        }

        .pd-discount-badge {
          background: rgba(217, 148, 88, 0.16);
          color: #B66D31;
          border: 1px solid rgba(217, 148, 88, 0.35);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .pd-rating-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .pd-stars {
          color: #D99458;
          font-size: 1rem;
          letter-spacing: 0.1em;
        }

        .pd-rating-text {
          font-size: 0.78rem;
          color: #7A6E6A;
          font-weight: 500;
        }

        .pd-hook-box {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-left: 3px solid #D99458;
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 24px;
          box-shadow: 0 4px 14px rgba(26, 22, 23, 0.03);
        }

        .pd-hook-text {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.6;
          color: #1A1617;
          font-style: italic;
        }

        .pd-description {
          font-size: 0.9rem;
          line-height: 1.8;
          color: #4A403E;
          font-weight: 400;
          margin-bottom: 28px;
        }

        .pd-perfect-for {
          margin-bottom: 24px;
        }

        .pd-sublabel {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7A6E6A;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .pd-occasion-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pd-occasion-chip {
          font-size: 0.72rem;
          color: #1A1617;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 500;
        }

        .pd-size-section {
          margin-bottom: 30px;
        }

        .pd-size-buttons {
          display: flex;
          gap: 12px;
        }

        .pd-size-pill {
          padding: 11px 22px;
          background: #FFFFFF;
          border: 1.5px solid #EDE1DC;
          color: #1A1617;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pd-size-pill.active, .pd-size-pill:hover {
          background: #1A1617;
          border-color: #1A1617;
          color: #FAF6F4;
        }

        .pd-action-row {
          display: flex;
          gap: 12px;
          margin-bottom: 35px;
        }

        .pd-qty-control {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 8px;
          padding: 0 6px;
        }

        .pd-qty-control button {
          background: none;
          border: none;
          color: #1A1617;
          font-size: 1.1rem;
          width: 36px;
          height: 48px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .pd-qty-control button:hover {
          color: #D99458;
        }

        .pd-qty-control span {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1A1617;
          min-width: 26px;
          text-align: center;
        }

        .pd-btn-cart {
          flex: 1;
          padding: 15px 20px;
          background: #1A1617;
          border: 1px solid #1A1617;
          color: #FAF6F4;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .pd-btn-cart:hover {
          background: #2D2527;
          border-color: #D99458;
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.15);
        }

        .pd-btn-buy {
          flex: 1.2;
          padding: 15px 24px;
          background: #D99458;
          border: 1px solid #D99458;
          color: #1A1617;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pd-btn-buy:hover {
          background: #c78347;
          border-color: #c78347;
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(217, 148, 88, 0.3);
        }

        .pd-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 30px;
          box-shadow: 0 4px 14px rgba(26, 22, 23, 0.03);
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
          font-size: 0.75rem;
          color: #4A403E;
          font-weight: 500;
        }

        .pd-upsell-box {
          background: #FFFFFF;
          border: 1px dashed #D99458;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 14px rgba(217, 148, 88, 0.06);
        }

        .pd-upsell-tag {
          display: inline-block;
          background: #D99458;
          color: #1A1617;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .pd-upsell-body {
          font-size: 0.85rem;
          line-height: 1.6;
          color: #1A1617;
          font-weight: 400;
        }

        .pd-highlights-box {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 10px;
          padding: 22px;
          box-shadow: 0 4px 14px rgba(26, 22, 23, 0.03);
        }

        .pd-box-heading {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #D99458;
          margin-bottom: 14px;
          font-weight: 600;
        }

        .pd-bullets-list {
          list-style: square;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pd-bullets-list li {
          font-size: 0.82rem;
          line-height: 1.6;
          color: #4A403E;
        }

        /* Tabs Section */
        .pd-tabs-section {
          margin-bottom: 90px;
          border-top: 1px solid #EDE1DC;
          padding-top: 50px;
        }

        .pd-tabs-nav {
          display: flex;
          gap: 16px;
          border-bottom: 1px solid #EDE1DC;
          padding-bottom: 16px;
          overflow-x: auto;
          margin-bottom: 35px;
        }

        .pd-tab-btn {
          background: none;
          border: none;
          color: #7A6E6A;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          padding: 10px 18px;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          border-radius: 6px;
        }

        .pd-tab-btn.active, .pd-tab-btn:hover {
          color: #1A1617;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          box-shadow: 0 2px 8px rgba(26, 22, 23, 0.04);
        }

        .pd-journey-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .pd-journey-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .journey-phase {
          font-size: 0.65rem;
          color: #D99458;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .pd-journey-card h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #1A1617;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .pd-journey-card p {
          font-size: 0.84rem;
          line-height: 1.7;
          color: #4A403E;
        }

        .pd-specs-table-wrap {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .pd-specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .pd-specs-table tr {
          border-bottom: 1px solid #EDE1DC;
        }

        .pd-specs-table tr:last-child {
          border-bottom: none;
        }

        .spec-label {
          padding: 16px 24px;
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          color: #7A6E6A;
          font-weight: 600;
          width: 35%;
          background: #FAF6F4;
        }

        .spec-value {
          padding: 16px 24px;
          font-size: 0.82rem;
          color: #1A1617;
          font-weight: 500;
        }

        .pd-faqs-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pd-faq-item {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(26, 22, 23, 0.02);
        }

        .pd-faq-q {
          width: 100%;
          background: none;
          border: none;
          padding: 18px 24px;
          text-align: left;
          color: #1A1617;
          font-size: 0.88rem;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .pd-faq-q:hover {
          background: #FAF6F4;
        }

        .faq-toggle-sign {
          color: #D99458;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .pd-faq-a {
          padding: 0 24px 20px 24px;
          border-top: 1px solid #EDE1DC;
        }

        .pd-faq-a p {
          font-size: 0.84rem;
          line-height: 1.7;
          color: #4A403E;
          margin-top: 14px;
        }

        .pd-objections-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pd-obj-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 10px;
          padding: 20px 24px;
          box-shadow: 0 2px 10px rgba(26, 22, 23, 0.02);
        }

        .pd-obj-q {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1A1617;
          margin-bottom: 8px;
        }

        .pd-obj-a {
          font-size: 0.82rem;
          line-height: 1.6;
          color: #4A403E;
        }

        /* Cross-Sell Section */
        .pd-cross-sell-section {
          margin-bottom: 90px;
          text-align: center;
        }

        .pd-cross-eyebrow {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #D99458;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .pd-cross-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 500;
          color: #1A1617;
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
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          padding: 14px 22px;
          border-radius: 40px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(26, 22, 23, 0.03);
        }

        .pd-cross-card:hover {
          border-color: #D99458;
          background: #FAF6F4;
          transform: translateY(-2px);
        }

        .cross-icon {
          color: #D99458;
          font-size: 0.8rem;
        }

        .cross-name {
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #1A1617;
        }

        .cross-explore-link {
          font-size: 0.72rem;
          color: #D99458;
          text-decoration: none;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          margin-left: 6px;
        }

        /* Reviews Section */
        .pd-reviews-section {
          border-top: 1px solid #EDE1DC;
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
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #D99458;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .pd-review-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 500;
          color: #1A1617;
        }

        .pd-review-score-box {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pd-score-num {
          font-family: var(--font-serif);
          font-size: 3rem;
          font-weight: 500;
          color: #1A1617;
          line-height: 1;
        }

        .pd-score-sub {
          font-size: 0.75rem;
          color: #7A6E6A;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .pd-reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .pd-review-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .review-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .reviewer-avatar {
          width: 36px;
          height: 36px;
          background: rgba(217, 148, 88, 0.15);
          border: 1px solid rgba(217, 148, 88, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: #B66D31;
          font-weight: 700;
        }

        .reviewer-name {
          display: block;
          font-size: 0.85rem;
          color: #1A1617;
          font-weight: 600;
        }

        .reviewer-meta {
          display: block;
          font-size: 0.68rem;
          color: #7A6E6A;
        }

        .review-stars {
          margin-left: auto;
          color: #D99458;
          font-size: 0.85rem;
        }

        .review-text {
          font-size: 0.85rem;
          line-height: 1.7;
          color: #4A403E;
          font-weight: 400;
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
    </div>
  );
}
