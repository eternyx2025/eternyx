'use client';

import Link from 'next/link';
import { HomepageBundleCard } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface BuildBundleSectionProps {
  bundles?: HomepageBundleCard[];
  title?: string;
}

export default function BuildBundleSection({
  bundles = [],
  title = 'BUILD YOUR BUNDLE',
}: BuildBundleSectionProps) {
  if (!bundles || bundles.length === 0) return null;

  return (
    <section className="fraganote-bundle-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="bundles-grid">
          {bundles.map((bundle) => {
            const imgSrc = formatImageUrl(bundle.imageUrl) || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80';
            return (
              <div key={bundle.id} className="bundle-card">
                <img
                  src={imgSrc}
                  alt={bundle.title}
                  className="bundle-bg-image"
                  referrerPolicy="no-referrer"
                />
                <div className="bundle-overlay" />

                <div className="bundle-content">
                  <h3 className="bundle-heading">{bundle.title}</h3>
                  {bundle.subtitle && (
                    <span className="bundle-discount-badge">{bundle.subtitle}</span>
                  )}
                  <Link href={bundle.buttonUrl || '/shop'} className="bundle-cta-btn">
                    {bundle.buttonText || 'BUILD BUNDLE ↗'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .fraganote-bundle-section {
          background: #FAF6F4;
          padding: 50px 0;
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
        .bundles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .bundles-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .section-title {
            font-size: 1.4rem;
          }
        }
        .bundle-card {
          position: relative;
          height: 380px;
          border-radius: 22px;
          overflow: hidden;
          background: #1A1617;
          box-shadow: 0 12px 30px rgba(26, 22, 23, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bundle-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(26, 22, 23, 0.16);
        }
        .bundle-bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bundle-card:hover .bundle-bg-image {
          transform: scale(1.05);
        }
        .bundle-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26, 22, 23, 0.8) 0%, rgba(26, 22, 23, 0.25) 60%, transparent 100%);
          z-index: 1;
        }
        .bundle-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
        }
        .bundle-heading {
          font-family: var(--font-sans, system-ui);
          font-size: 1.45rem;
          font-weight: 900;
          color: #FAF6F4;
          line-height: 1.25;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          margin: 0 0 12px 0;
          max-width: 320px;
        }
        .bundle-discount-badge {
          color: #D99458;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .bundle-cta-btn {
          background: #D99458;
          color: #1A1617;
          padding: 11px 24px;
          border-radius: 9999px;
          font-family: var(--font-sans, system-ui);
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .bundle-cta-btn:hover {
          background: #C47E42;
          transform: scale(1.03);
        }
      `}</style>
    </section>
  );
}

