'use client';

import { HomepageRetailPartner } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface RetailPartnersProps {
  partners?: HomepageRetailPartner[];
  title?: string;
}

export default function RetailPartnersSection({
  partners = [],
  title = "WE'RE ALSO AVAILABLE AT",
}: RetailPartnersProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section className="fraganote-retail-section">
      <div className="container">
        <h3 className="retail-title">{title}</h3>

        <div className="retail-logos-row">
          {partners.map((partner) => {
            const logoSrc = partner.logoUrl ? formatImageUrl(partner.logoUrl) : '';
            return (
              <a
                key={partner.id}
                href={partner.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="retail-logo-item"
                title={partner.name}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={partner.name}
                    className="partner-logo-img"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="partner-name-text">{partner.text || partner.name}</span>
                )}
              </a>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .fraganote-retail-section {
          background: #FAF6F4;
          padding: 48px 0 36px 0;
          border-top: 1px solid #EDE1DC;
          border-bottom: 1px solid #EDE1DC;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          text-align: center;
        }
        .retail-title {
          font-family: var(--font-sans, system-ui);
          font-size: 1.15rem;
          font-weight: 900;
          color: #1A1617;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 28px 0;
        }
        .retail-logos-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }
        .retail-logo-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .retail-logo-item:hover {
          opacity: 1;
          transform: scale(1.05);
        }
        .partner-name-text {
          font-family: var(--font-sans, system-ui);
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #1A1617;
          transition: color 0.2s ease;
        }
        .retail-logo-item:hover .partner-name-text {
          color: #D99458;
        }
        .partner-logo-img {
          height: 32px;
          max-width: 120px;
          object-fit: contain;
        }
        @media (max-width: 768px) {
          .retail-logos-row {
            gap: 28px;
          }
          .partner-name-text {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}

