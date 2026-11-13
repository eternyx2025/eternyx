'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FooterProps {
  brandName?: string;
  tagline?: string;
  phone?: string;
  hours?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export default function FraganoteFooter({
  brandName = 'ETERNYX',
  tagline = 'Memories • Feelings • Notes • Fragrances',
  phone = '+91 9990140195',
  hours = 'Timing: 10:00am to 7:00pm, Monday to Friday',
  social = {},
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="fraganote-footer">
      <div className="container">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Column 1: Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Subscribe</h4>
            <p className="newsletter-desc">
              Enter your email below to be the first to know about new collections and product launches.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                {subscribed ? '✓' : '↗'}
              </button>
            </form>
            {subscribed && (
              <span className="subscribe-success">Thank you for subscribing!</span>
            )}
          </div>

          {/* Column 2: Shop */}
          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li>
                <Link href="/shop" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Bestsellers</Link>
              </li>
              <li>
                <Link href="/shop" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>New launches</Link>
              </li>
              <li>
                <Link href="/shop" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Gifting</Link>
              </li>
              <li>
                <Link href="/shop" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Discovery Sets</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div className="footer-col">
            <h4 className="footer-heading">About</h4>
            <ul className="footer-links">
              <li>
                <Link href="/story" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>About us</Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Careers</Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>FAQs</Link>
              </li>
              <li>
                <Link href="/story" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Our Philosophy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Need Help */}
          <div className="footer-col">
            <h4 className="footer-heading">Need help?</h4>
            <ul className="footer-links">
              <li>
                <Link href="/track" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Track order</Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Shipping &amp; Delivery</Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Return &amp; refund policy</Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link" style={{ color: '#A89F9B', textDecoration: 'none' }}>Privacy policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact us */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contact us</h4>
            <p className="contact-phone">{phone}</p>
            <p className="contact-hours">{hours}</p>
          </div>
        </div>

        {/* Brand Center Section */}
        <div className="footer-brand-section">
          <Link href="/" className="footer-wordmark" style={{ color: '#FAF6F4', textDecoration: 'none' }}>
            {brandName}
          </Link>
          <p className="footer-tagline">{tagline}</p>

          {/* Social Icons */}
          <div className="footer-social-row">
            <a
              href={social.instagram || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href={social.facebook || 'https://facebook.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a
              href={social.linkedin || 'https://linkedin.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a
              href={social.youtube || 'https://youtube.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="YouTube"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .fraganote-footer {
          background: #1A1617;
          color: #FAF6F4;
          padding: 80px 0 50px 0;
          font-family: var(--font-sans, system-ui);
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1.2fr 1.4fr;
          gap: 36px;
          margin-bottom: 70px;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          .newsletter-col {
            grid-column: span 3;
            margin-bottom: 20px;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .newsletter-col {
            grid-column: span 1;
          }
        }
        .footer-heading {
          font-size: 0.95rem;
          font-weight: 800;
          color: #FAF6F4;
          margin: 0 0 18px 0;
          letter-spacing: 0.04em;
        }
        .newsletter-desc {
          font-size: 0.85rem;
          color: #A89F9B;
          line-height: 1.5;
          margin-bottom: 18px;
          max-width: 280px;
        }
        .newsletter-form {
          display: flex;
          align-items: center;
          background: #FAF6F4;
          border-radius: 9999px;
          padding: 4px 6px 4px 18px;
          max-width: 320px;
        }
        .newsletter-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.85rem;
          color: #1A1617;
          flex-grow: 1;
          padding: 8px 0;
        }
        .newsletter-input::placeholder {
          color: #7A6E6A;
        }
        .newsletter-submit-btn {
          background: #D99458;
          color: #1A1617;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .newsletter-submit-btn:hover {
          background: #C47E42;
        }
        .subscribe-success {
          display: block;
          color: #4ade80;
          font-size: 0.78rem;
          margin-top: 8px;
        }
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links :global(a),
        .footer-links :global(a:link),
        .footer-links :global(a:visited),
        .footer-links li a,
        .footer-links li a:link,
        .footer-links li a:visited,
        .footer-link,
        .footer-link:link,
        .footer-link:visited {
          color: #A89F9B !important;
          text-decoration: none !important;
          font-size: 0.85rem;
          transition: color 0.2s ease;
          display: inline-block;
        }
        .footer-links :global(a:hover),
        .footer-links :global(a:focus),
        .footer-links li a:hover,
        .footer-links li a:focus,
        .footer-link:hover,
        .footer-link:focus {
          color: #D99458 !important;
          text-decoration: none !important;
        }
        .contact-phone {
          font-size: 0.95rem;
          font-weight: 700;
          color: #FAF6F4;
          margin: 0 0 8px 0;
        }
        .contact-hours {
          font-size: 0.82rem;
          color: #A89F9B;
          line-height: 1.45;
        }
        .footer-brand-section {
          border-top: 1px solid rgba(250, 246, 244, 0.12);
          padding-top: 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .footer-brand-section :global(a.footer-wordmark),
        .footer-brand-section :global(a.footer-wordmark:link),
        .footer-brand-section :global(a.footer-wordmark:visited),
        .footer-brand-section :global(a),
        .footer-brand-section :global(a:link),
        .footer-brand-section :global(a:visited),
        .footer-wordmark,
        .footer-wordmark:link,
        .footer-wordmark:visited {
          font-family: var(--font-sans, system-ui);
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 0.16em;
          color: #FAF6F4 !important;
          text-decoration: none !important;
          text-transform: uppercase;
          transition: color 0.2s ease;
          display: inline-block;
        }
        .footer-brand-section :global(a.footer-wordmark:hover),
        .footer-brand-section :global(a.footer-wordmark:focus),
        .footer-brand-section :global(a:hover),
        .footer-brand-section :global(a:focus),
        .footer-wordmark:hover,
        .footer-wordmark:focus {
          color: #D99458 !important;
          text-decoration: none !important;
        }
        .footer-tagline {
          font-size: 0.82rem;
          color: #A89F9B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .footer-social-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 8px;
        }
        .social-icon-btn {
          color: #FAF6F4;
          opacity: 0.75;
          transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .social-icon-btn:hover {
          opacity: 1;
          color: #D99458;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}

