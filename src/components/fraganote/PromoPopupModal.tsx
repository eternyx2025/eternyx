'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomepagePopup } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface PromoPopupModalProps {
  popup?: HomepagePopup;
}

export default function PromoPopupModal({ popup }: PromoPopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!popup || !popup.enabled) return;

    // Check if user dismissed it within the last 24 hours
    const dismissedUntil = localStorage.getItem('eternyx_popup_suppress_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, (popup.delaySeconds || 1) * 1000);

    return () => clearTimeout(timer);
  }, [popup]);

  const handleDismiss = () => {
    setIsOpen(false);
    // Suppress for 24 hours
    const suppressUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('eternyx_popup_suppress_until', suppressUntil.toString());
  };

  if (!isOpen || !popup || !popup.enabled) return null;

  const imgSrc = formatImageUrl(popup.imageUrl);

  return (
    <div className="popup-backdrop" onClick={handleDismiss}>
      <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="popup-close-btn"
          onClick={handleDismiss}
          aria-label="Close promotion"
        >
          ✕
        </button>

        {/* Campaign Visual Banner */}
        {imgSrc && (
          <div className="popup-banner-container">
            <img
              src={imgSrc}
              alt={popup.title}
              className="popup-banner-image"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Content Box */}
        <div className="popup-content">
          <h2 className="popup-title">{popup.title}</h2>
          <p className="popup-subtitle">{popup.subtitle}</p>

          <Link
            href={popup.buttonUrl || '/shop'}
            className="popup-cta-btn"
            onClick={handleDismiss}
          >
            {popup.buttonText || 'Explore Now'}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .popup-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 16px;
          animation: fadeIn 0.25s ease-out forwards;
        }
        .popup-dialog {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 18px;
          overflow: hidden;
          width: 100%;
          max-width: 440px;
          position: relative;
          box-shadow: 0 24px 50px rgba(26, 22, 23, 0.25);
          animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .popup-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(26, 22, 23, 0.65);
          color: #FAF6F4;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s ease;
        }
        .popup-close-btn:hover {
          background: #1A1617;
        }
        .popup-banner-container {
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: #FAF6F4;
        }
        .popup-banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .popup-content {
          padding: 24px 20px;
          text-align: center;
        }
        .popup-title {
          font-family: var(--font-sans, system-ui);
          font-size: 1.35rem;
          font-weight: 800;
          color: #1A1617;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }
        .popup-subtitle {
          font-family: var(--font-sans, system-ui);
          font-size: 0.88rem;
          color: #7A6E6A;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        .popup-cta-btn {
          display: inline-block;
          width: 100%;
          background: #1A1617;
          color: #FAF6F4;
          padding: 12px 24px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .popup-cta-btn:hover {
          background: #2D2527;
          transform: scale(1.02);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popUp {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

