'use client';

import { Review } from '@/lib/types';
import { formatImageUrl } from '@/lib/formatImageUrl';

interface CustomerReviewsProps {
  reviews?: Review[];
  products?: any[];
  title?: string;
}

export default function CustomerReviewsSection({
  reviews = [],
  products = [],
  title = 'LOVED BY 50,000+ CUSTOMERS',
}: CustomerReviewsProps) {
  // Fallback reviews matching Fraganote reference if no reviews published yet
  const defaultReviews: any[] = [
    {
      id: 'rev-1',
      customer: 'April',
      product_name: 'ITALIAN SUMMER 50ML',
      rating: 5,
      headline: 'Best Summer Scent',
      comment:
        'The perfume is so summer coded. It smells fresh and lively. It gives me the vibe of summer holidays in Western country. I would highly recommend this particular perfume.',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'rev-2',
      customer: 'Julius Thiyam',
      product_name: 'SPORTS MODE 50ML',
      rating: 5,
      headline: 'Excellent',
      comment:
        "It's strong, energetic, refreshing and long lasting. Definitely recommended for sports/outdoor activities. Team Eternyx really delivered on this blend.",
      imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const reviewList = reviews.length > 0
    ? reviews.map((r) => {
        const prod = products.find(
          (p) => p.name.toLowerCase() === (r.product_name || '').toLowerCase()
        );
        return {
          id: r.id,
          customer: r.customer,
          product_name: r.product_name,
          rating: r.rating || 5,
          headline: 'Verified Review',
          comment: r.comment,
          imageUrl: prod ? formatImageUrl(prod.image_url) : 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
        };
      })
    : defaultReviews;

  return (
    <section className="fraganote-reviews-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="reviews-grid">
          {reviewList.slice(0, 4).map((rev) => {
            const fallbackReviewImg = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';
            const reviewImg = rev.imageUrl || fallbackReviewImg;
            return (
              <div key={rev.id} className="review-card">
                <div className="review-prod-img-box">
                  <img
                    src={reviewImg}
                    alt={rev.product_name}
                    className="review-prod-img"
                    referrerPolicy="no-referrer"
                  />
                </div>

              <div className="review-details">
                <h4 className="review-prod-name">{rev.product_name}</h4>

                <div className="review-stars-row">
                  <span className="stars">★★★★★</span>
                  <span className="verified-badge">Verified Purchase</span>
                </div>

                {rev.headline && (
                  <h5 className="review-headline">{rev.headline}</h5>
                )}

                <p className="review-comment">{rev.comment}</p>

                <div className="reviewer-name-row">
                  <span className="reviewer-name">{rev.customer}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <style jsx>{`
        .fraganote-reviews-section {
          background: #FAF6F4;
          padding: 60px 0;
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
          }
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .reviews-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        .review-card {
          border: 1px solid #EDE1DC;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          gap: 24px;
          background: #FFFFFF;
          box-shadow: 0 6px 20px rgba(26, 22, 23, 0.04);
        }
        @media (max-width: 540px) {
          .review-card {
            flex-direction: column;
            gap: 16px;
          }
        }
        .review-prod-img-box {
          width: 130px;
          height: 130px;
          border-radius: 14px;
          overflow: hidden;
          background: #FAF6F4;
          flex-shrink: 0;
        }
        .review-prod-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .review-details {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .review-prod-name {
          font-family: var(--font-sans, system-ui);
          font-size: 0.95rem;
          font-weight: 800;
          color: #1A1617;
          text-transform: uppercase;
          margin: 0 0 8px 0;
          letter-spacing: 0.02em;
        }
        .review-stars-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .stars {
          color: #D99458;
          font-size: 0.85rem;
          letter-spacing: 2px;
        }
        .verified-badge {
          font-family: var(--font-sans, system-ui);
          font-size: 0.68rem;
          font-weight: 600;
          color: #7A6E6A;
        }
        .review-headline {
          font-family: var(--font-sans, system-ui);
          font-size: 0.9rem;
          font-weight: 800;
          color: #1A1617;
          margin: 0 0 8px 0;
        }
        .review-comment {
          font-family: var(--font-sans, system-ui);
          font-size: 0.85rem;
          color: #4A403E;
          line-height: 1.5;
          margin: 0 0 14px 0;
        }
        .reviewer-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
        }
        .reviewer-name {
          font-family: var(--font-sans, system-ui);
          font-size: 0.82rem;
          font-weight: 800;
          color: #1A1617;
        }
      `}</style>
    </section>
  );
}

