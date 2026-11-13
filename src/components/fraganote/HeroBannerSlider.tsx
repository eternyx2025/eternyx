'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatImageUrl } from '@/lib/formatImageUrl';

export interface BannerItem {
  id?: string;
  image_url: string;
  mobile_image_url?: string;
  link?: string;
  title?: string;
  subtitle?: string;
}

interface HeroBannerSliderProps {
  banners?: BannerItem[];
}

export default function HeroBannerSlider({ banners = [] }: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback banner if none uploaded
  const defaultBanners: BannerItem[] = [
    {
      image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1800&q=85',
      mobile_image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85',
      title: 'SWEET PICKS FOR THE FESTIVE SEASON',
      subtitle: 'Discover Eternyx Luxury Fragrances',
      link: '/shop',
    },
  ];

  const slideList = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    if (slideList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slideList.length]);

  return (
    <div className="fraganote-hero">
      <div className="hero-slider-track">
        {slideList.map((banner, idx) => {
          const isActive = idx === currentIndex;
          const fallbackHero = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1800&q=85';
          const desktopSrc = formatImageUrl(banner.image_url) || fallbackHero;
          const mobileSrc = formatImageUrl(banner.mobile_image_url || banner.image_url) || desktopSrc;

          return (
            <div
              key={idx}
              className={`hero-slide ${isActive ? 'active' : ''}`}
            >
              <Link href={banner.link || '/shop'} className="hero-slide-link">
                <picture>
                  <source media="(max-width: 768px)" srcSet={mobileSrc} />
                  <img
                    src={desktopSrc}
                    alt={banner.title || `Eternyx Banner ${idx + 1}`}
                    className="hero-img"
                    referrerPolicy="no-referrer"
                  />
                </picture>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {slideList.length > 1 && (
        <div className="hero-dots">
          {slideList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {slideList.length > 1 && (
        <>
          <button
            type="button"
            className="hero-arrow prev"
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? slideList.length - 1 : prev - 1))}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-arrow next"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slideList.length)}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      <style jsx>{`
        .fraganote-hero {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #000000;
          margin: 0;
          padding: 0;
        }
        .hero-slider-track {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 7;
          max-height: 560px;
          min-height: 380px;
        }
        @media (max-width: 768px) {
          .hero-slider-track {
            min-height: 440px;
            max-height: none;
            aspect-ratio: 4 / 5;
          }
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.8s;
        }
        .hero-slide.active {
          opacity: 1;
          visibility: visible;
        }
        .hero-slide-link {
          display: block;
          width: 100%;
          height: 100%;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hero-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          padding: 0;
        }
        .dot.active {
          background: #ffffff;
          transform: scale(1.3);
        }
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.35);
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          line-height: 1;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s ease;
        }
        .hero-arrow:hover {
          background: rgba(0, 0, 0, 0.7);
        }
        .hero-arrow.prev {
          left: 16px;
        }
        .hero-arrow.next {
          right: 16px;
        }
        @media (max-width: 768px) {
          .hero-arrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

