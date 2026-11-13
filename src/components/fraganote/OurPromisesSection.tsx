'use client';

import { HomepagePromise } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface OurPromisesProps {
  promises?: HomepagePromise[];
  title?: string;
}

export default function OurPromisesSection({
  promises = [],
  title = 'OUR PROMISES',
}: OurPromisesProps) {
  if (!promises || promises.length === 0) return null;

  // Duplicate items enough times so that a single group spans beyond wide screens
  const repeatCount = Math.max(2, Math.ceil(10 / promises.length));
  const loopList = Array.from({ length: repeatCount }, () => promises).flat();

  const renderBadge = (promise: HomepagePromise, idx: number, prefix: string) => {
    const iconSrc = promise.iconUrl ? formatImageUrl(promise.iconUrl) : '';
    return (
      <div key={`${prefix}-${promise.id || idx}-${idx}`} className="promise-badge-item">
        <div className="promise-circle">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={promise.title}
              className="promise-icon-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="promise-seal-text">{promise.title}</span>
          )}
        </div>
        <span className="promise-label">{promise.title}</span>
      </div>
    );
  };

  return (
    <section className="fraganote-promises-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
      </div>

      <div className="promises-marquee-wrapper">
        <div className="promises-marquee-group">
          {loopList.map((promise, idx) => renderBadge(promise, idx, 'g1'))}
        </div>
        <div className="promises-marquee-group" aria-hidden="true">
          {loopList.map((promise, idx) => renderBadge(promise, idx, 'g2'))}
        </div>
      </div>

      <style jsx>{`
        .fraganote-promises-section {
          background: #FAF6F4;
          padding: 60px 0 50px 0;
          border-top: 1px solid #EDE1DC;
          overflow: hidden;
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
          margin: 0 0 36px 0;
        }
        @media (max-width: 768px) {
          .section-title {
            font-size: 1.4rem;
            margin-bottom: 24px;
          }
        }
        .promises-marquee-wrapper {
          display: flex;
          width: 100%;
          overflow: hidden;
          user-select: none;
          gap: 36px;
          padding: 10px 0;
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .promises-marquee-group {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 36px;
          min-width: 100%;
          animation: promisesMarquee 32s linear infinite;
          will-change: transform;
        }
        .promises-marquee-wrapper:hover .promises-marquee-group {
          animation-play-state: paused;
        }
        @keyframes promisesMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100% - 36px));
          }
        }
        .promise-badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          width: 110px;
          text-align: center;
          cursor: pointer;
        }
        .promise-circle {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          border: 1.5px solid #D99458;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(26, 22, 23, 0.04);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .promise-badge-item:hover .promise-circle {
          transform: scale(1.08);
          border-color: #1A1617;
          box-shadow: 0 8px 20px rgba(217, 148, 88, 0.18);
        }
        .promise-seal-text {
          font-family: var(--font-sans, system-ui);
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #1A1617;
          line-height: 1.15;
          letter-spacing: 0.02em;
          text-align: center;
        }
        .promise-icon-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .promise-label {
          font-family: var(--font-sans, system-ui);
          font-size: 0.74rem;
          font-weight: 700;
          color: #7A6E6A;
          line-height: 1.25;
          transition: color 0.2s ease;
        }
        .promise-badge-item:hover .promise-label {
          color: #1A1617;
        }
        @media (max-width: 768px) {
          .promises-marquee-track {
            gap: 22px;
            animation-duration: 22s;
          }
          .promise-badge-item {
            width: 95px;
            gap: 8px;
          }
          .promise-circle {
            width: 72px;
            height: 72px;
          }
          .promise-seal-text {
            font-size: 0.58rem;
          }
          .promise-label {
            font-size: 0.68rem;
          }
        }
      `}</style>
    </section>
  );
}

