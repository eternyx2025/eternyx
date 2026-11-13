'use client';

import { HomepagePressItem } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface PressMarqueeProps {
  items?: HomepagePressItem[];
  title?: string;
}

export default function PressMarquee({ items = [], title = 'FEATURED IN' }: PressMarqueeProps) {
  if (!items || items.length === 0) return null;

  // Duplicate items for continuous marquee
  const marqueeItems = [...items, ...items, ...items];

  return (
    <section className="fraganote-press-section">
      <div className="container">
        <h3 className="press-title">{title}</h3>
      </div>

      <div className="press-marquee-wrapper">
        <div className="press-marquee-track">
          {marqueeItems.map((item, idx) => {
            const logoSrc = item.logoUrl ? formatImageUrl(item.logoUrl) : '';
            return (
              <div key={idx} className="press-item">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={item.name}
                    className="press-logo-img"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="press-name-text">{item.text || item.name}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .fraganote-press-section {
          background: #FAF6F4;
          padding: 36px 0 28px 0;
          overflow: hidden;
          border-bottom: 1px solid #EDE1DC;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          text-align: center;
        }
        .press-title {
          font-family: var(--font-sans, system-ui);
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #1A1617;
          text-transform: uppercase;
          margin: 0 0 24px 0;
        }
        .press-marquee-wrapper {
          display: flex;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .press-marquee-track {
          display: flex;
          align-items: center;
          gap: 56px;
          animation: pressScroll 30s linear infinite;
          width: max-content;
        }
        .press-marquee-wrapper:hover .press-marquee-track {
          animation-play-state: paused;
        }
        .press-item {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .press-name-text {
          font-family: var(--font-serif, 'Times New Roman', serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A1617;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.85;
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .press-item:hover .press-name-text {
          opacity: 1;
          color: #D99458;
        }
        .press-logo-img {
          height: 28px;
          max-width: 130px;
          object-fit: contain;
          filter: grayscale(100%);
          opacity: 0.8;
          transition: opacity 0.2s ease, filter 0.2s ease;
        }
        .press-item:hover .press-logo-img {
          opacity: 1;
          filter: grayscale(0%);
        }
        @keyframes pressScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        @media (max-width: 768px) {
          .press-marquee-track {
            gap: 36px;
          }
          .press-name-text {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </section>
  );
}

