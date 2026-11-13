'use client';

import { useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { formatImageUrl } from '@/lib/formatImageUrl';

export interface ReelItem {
  id?: string;
  handle?: string;
  likes?: string;
  product?: string;
  image: string;
  video: string;
}

interface ShoppableReelsProps {
  reels?: ReelItem[];
  products?: any[];
  title?: string;
}

export default function ShoppableReelsSection({
  reels = [],
  products = [],
  title = "SEE WHAT THE HYPE'S ABOUT",
}: ShoppableReelsProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const trackRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (!reels || reels.length === 0) return null;

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, matchedProduct: any) => {
    e.stopPropagation();
    const priceNum = typeof matchedProduct.price === 'string'
      ? parseFloat(matchedProduct.price.replace(/[^0-9.]/g, '')) || 999
      : Number(matchedProduct.price) || 999;

    addToCart(
      {
        name: matchedProduct.name,
        category: matchedProduct.category || 'Eau De Parfum',
        price: priceNum,
        image: formatImageUrl(matchedProduct.image_url || matchedProduct.image),
      },
      matchedProduct.volume || '50ML',
      1
    );
    setIsCartOpen(true);
  };

  return (
    <section className="fraganote-reels-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="reels-carousel-wrapper">
          {/* Left Arrow */}
          <button
            type="button"
            className="carousel-arrow prev"
            onClick={scrollLeft}
            aria-label="Previous reels"
          >
            ‹
          </button>

          {/* Scrolling Track */}
          <div className="reels-track" ref={trackRef}>
            {reels.map((reel, idx) => {
              const reelId = reel.id || `reel-${idx}`;
              const matchedProduct = products.find(
                (p) =>
                  p.name.toLowerCase().includes((reel.product || '').toLowerCase()) ||
                  (reel.product || '').toLowerCase().includes(p.name.toLowerCase())
              ) || {
                name: reel.product || 'Eternyx Parfum 50ML',
                price: 999,
                compare_at_price: 1699,
                image_url: reel.image,
              };

              const numericPrice = typeof matchedProduct.price === 'string'
                ? parseFloat(matchedProduct.price.replace(/[^0-9.]/g, '')) || 999
                : Number(matchedProduct.price) || 999;

              const comparePrice = matchedProduct.compare_at_price || Math.round(numericPrice * 1.5);
              const discount = Math.round(((comparePrice - numericPrice) / comparePrice) * 100);

              const isPlaying = playingId === reelId;
              const reelThumb = formatImageUrl(reel.image) || formatImageUrl(matchedProduct.image_url || matchedProduct.image) || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';

              return (
                <div key={reelId} className="reel-card-container">
                  {/* Video Box */}
                  <div
                    className="reel-video-box"
                    onClick={() => setPlayingId(isPlaying ? null : reelId)}
                  >
                    {reel.video && reel.video !== '#' && isPlaying ? (
                      <video
                        src={reel.video}
                        autoPlay
                        loop
                        playsInline
                        className="reel-video"
                      />
                    ) : reelThumb ? (
                      <img
                        src={reelThumb}
                        alt={reel.product || 'Reel thumbnail'}
                        className="reel-thumb-img"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="reel-thumb-placeholder" />
                    )}

                    {/* Play/Sound icon overlay */}
                    <div className="reel-sound-badge">
                      <span>{isPlaying ? 'SOUND ON' : 'TAP TO PLAY'}</span>
                    </div>
                  </div>

                  {/* Attached Shoppable Product Card Underneath */}
                  <div className="reel-product-info">
                    <h4 className="reel-prod-title">{matchedProduct.name}</h4>
                    <div className="reel-prod-price-row">
                      <span className="reel-prod-price">₹{numericPrice}</span>
                      <span className="reel-prod-mrp">₹{comparePrice}</span>
                      <span className="reel-prod-discount">{discount}% off</span>
                    </div>

                    <button
                      type="button"
                      className="reel-add-cart-btn"
                      onClick={(e) => handleAddToCart(e, matchedProduct)}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            className="carousel-arrow next"
            onClick={scrollRight}
            aria-label="Next reels"
          >
            ›
          </button>
        </div>
      </div>

      <style jsx>{`
        .fraganote-reels-section {
          background: #FAF6F4;
          padding: 60px 0;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
        }
        .section-title {
          font-family: var(--font-sans, system-ui);
          font-size: 1.85rem;
          font-weight: 900;
          color: #1A1617;
          text-align: center;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          margin: 0 0 36px 0;
        }
        @media (max-width: 768px) {
          .section-title {
            font-size: 1.4rem;
          }
        }
        .reels-carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .carousel-arrow {
          position: absolute;
          top: 40%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 4px 14px rgba(26, 22, 23, 0.12);
          color: #1A1617;
          border: 1px solid #EDE1DC;
          font-size: 1.8rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }
        .carousel-arrow:hover {
          background: #1A1617;
          color: #FAF6F4;
        }
        .carousel-arrow.prev {
          left: -14px;
        }
        .carousel-arrow.next {
          right: -14px;
        }
        @media (max-width: 768px) {
          .carousel-arrow {
            display: none;
          }
        }
        .reels-track {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          padding: 10px 4px;
          width: 100%;
        }
        .reels-track::-webkit-scrollbar {
          display: none;
        }
        .reel-card-container {
          flex: 0 0 calc(20% - 15px);
          min-width: 230px;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 1024px) {
          .reel-card-container {
            flex: 0 0 calc(33.33% - 12px);
          }
        }
        @media (max-width: 640px) {
          .reel-card-container {
            flex: 0 0 75%;
          }
        }
        .reel-video-box {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 15;
          border-radius: 18px;
          overflow: hidden;
          background: #1A1617;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(26, 22, 23, 0.08);
        }
        .reel-thumb-img,
        .reel-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .reel-sound-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(26, 22, 23, 0.7);
          color: #FAF6F4;
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          backdrop-filter: blur(4px);
        }
        .reel-product-info {
          padding: 12px 6px 4px 6px;
        }
        .reel-prod-title {
          font-family: var(--font-sans, system-ui);
          font-size: 0.88rem;
          font-weight: 800;
          color: #1A1617;
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .reel-prod-price-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }
        .reel-prod-price {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1A1617;
        }
        .reel-prod-mrp {
          font-size: 0.78rem;
          color: #8F8480;
          text-decoration: line-through;
        }
        .reel-prod-discount {
          font-size: 0.75rem;
          font-weight: 700;
          color: #047857;
        }
        .reel-add-cart-btn {
          width: 100%;
          background: #1A1617;
          color: #FAF6F4;
          border: none;
          padding: 9px 12px;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .reel-add-cart-btn:hover {
          background: #2D2527;
          transform: scale(1.02);
        }
      `}</style>
    </section>
  );
}

