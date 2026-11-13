'use client';

import { useState } from 'react';
import { HomepageAnnouncement } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface AnnouncementBarProps {
  announcements?: HomepageAnnouncement[];
}

export default function AnnouncementBar({ announcements = [] }: AnnouncementBarProps) {
  const { appliedCoupon, applyCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!announcements || announcements.length === 0) return null;

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Duplicate items for continuous seamless marquee scroll
  const marqueeItems = [...announcements, ...announcements, ...announcements];

  return (
    <div className="fraganote-announcement-bar">
      <div className="marquee-wrapper">
        <div className="marquee-content">
          {marqueeItems.map((item, idx) => (
            <div key={idx} className="marquee-item">
              <span className="marquee-sparkle">✦</span>
              <span className="marquee-text">{item.text}</span>
              {item.code && (
                <button
                  type="button"
                  className="coupon-pill"
                  onClick={(e) => handleCopy(item.code!, e)}
                  title={`Click to copy & apply ${item.code}`}
                >
                  <span className="code-text">{item.code}</span>
                  <span className="code-action">
                    {copiedCode === item.code || appliedCoupon === item.code ? '✓ APPLIED' : 'COPY'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .fraganote-announcement-bar {
          background: #1A1617;
          color: #FAF6F4;
          height: 38px;
          display: flex;
          align-items: center;
          overflow: hidden;
          font-family: var(--font-sans, system-ui);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(217, 148, 88, 0.2);
          user-select: none;
          z-index: 1001;
          position: relative;
        }
        .marquee-wrapper {
          display: flex;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }
        .marquee-content {
          display: flex;
          align-items: center;
          width: max-content;
          animation: fraganoteMarquee 32s linear infinite;
        }
        .marquee-wrapper:hover .marquee-content {
          animation-play-state: paused;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 28px;
        }
        .marquee-sparkle {
          color: #D99458;
          font-size: 0.8rem;
        }
        .marquee-text {
          color: #FAF6F4;
        }
        .coupon-pill {
          background: rgba(217, 148, 88, 0.15);
          color: #D99458;
          border: 1px solid rgba(217, 148, 88, 0.35);
          border-radius: 9999px;
          padding: 2px 8px;
          font-size: 0.65rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .coupon-pill:hover {
          background: #D99458;
          color: #1A1617;
        }
        .code-action {
          font-size: 0.58rem;
          opacity: 0.85;
          letter-spacing: 0.05em;
        }
        @keyframes fraganoteMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

