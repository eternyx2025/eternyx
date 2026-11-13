'use client';

import { useRef } from 'react';
import { HomepageInstagramPost } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface InstagramFeedProps {
  posts?: HomepageInstagramPost[];
  title?: string;
}

export default function InstagramFeedSection({
  posts = [],
  title = 'OUR INSTAGRAM',
}: InstagramFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!posts || posts.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="fraganote-insta-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="insta-carousel-wrapper">
          <button
            type="button"
            className="carousel-arrow prev"
            onClick={scrollLeft}
            aria-label="Previous photos"
          >
            ‹
          </button>

          <div className="insta-track" ref={scrollRef}>
            {posts.map((post) => {
              const imgSrc = formatImageUrl(post.imageUrl) || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';
              return (
                <a
                  key={post.id}
                  href={post.url || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="insta-post-card"
                >
                  <img
                    src={imgSrc}
                    alt={post.caption || 'Instagram feed'}
                    className="insta-img"
                    referrerPolicy="no-referrer"
                  />
                  <div className="insta-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    {post.caption && <p className="insta-caption">{post.caption}</p>}
                  </div>
                </a>
              );
            })}
          </div>

          <button
            type="button"
            className="carousel-arrow next"
            onClick={scrollRight}
            aria-label="Next photos"
          >
            ›
          </button>
        </div>
      </div>

      <style jsx>{`
        .fraganote-insta-section {
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
        .insta-carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .carousel-arrow {
          position: absolute;
          top: 50%;
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
        .insta-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 8px 4px;
          width: 100%;
        }
        .insta-track::-webkit-scrollbar {
          display: none;
        }
        .insta-post-card {
          flex: 0 0 calc(20% - 13px);
          min-width: 200px;
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          display: block;
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          box-shadow: 0 4px 14px rgba(26, 22, 23, 0.05);
        }
        @media (max-width: 900px) {
          .insta-post-card {
            flex: 0 0 40%;
          }
        }
        @media (max-width: 600px) {
          .insta-post-card {
            flex: 0 0 65%;
          }
        }
        .insta-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .insta-post-card:hover .insta-img {
          transform: scale(1.08);
        }
        .insta-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26, 22, 23, 0.65);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          opacity: 0;
          transition: opacity 0.25s ease;
          text-align: center;
        }
        .insta-post-card:hover .insta-overlay {
          opacity: 1;
        }
        .insta-caption {
          font-family: var(--font-sans, system-ui);
          font-size: 0.72rem;
          color: #FAF6F4;
          line-height: 1.35;
          max-width: 180px;
        }
      `}</style>
    </section>
  );
}

