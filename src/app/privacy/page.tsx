import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ETERNYX',
  description: 'Privacy Policy and Data Protection at ETERNYX Luxury Fragrances.',
};

export default function PrivacyPage() {
  return (
    <main className="policy-page-container">
      {/* Hero Header */}
      <section className="policy-hero">
        <p className="policy-eyebrow">Privacy & Security</p>
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-subtitle">
          At ETERNYX, your privacy is our priority. We are committed to safeguarding your personal information with absolute integrity and bank-grade security.
        </p>
      </section>

      {/* Main Content Area */}
      <section className="policy-content-section">
        <div className="policy-card">
          
          {/* Section 1 */}
          <div className="policy-section-block">
            <div className="policy-section-header">
              <span className="policy-section-num">01</span>
              <h2>Collection of Information</h2>
            </div>
            <p>
              At <strong>ETERNYX</strong>, your privacy is our priority. This policy describes how we collect, use, and protect your personal information when you visit{' '}
              <a href="https://www.eternyxfragrance.com" target="_blank" rel="noopener noreferrer" className="policy-link">
                www.eternyxfragrance.com
              </a>{' '}
              or purchase our artisanal olfactory creations.
            </p>
            <p>
              We collect personal information such as your <strong>name, shipping address, and email address</strong> to process your orders, manage your bespoke account, facilitate seamless order dispatch, and periodically send curated promotional notices regarding new limited editions.
            </p>
          </div>

          <div className="policy-divider" />

          {/* Section 2 */}
          <div className="policy-section-block">
            <div className="policy-section-header">
              <span className="policy-section-num">02</span>
              <h2>Data Protection & Security</h2>
            </div>
            <p>
              We implement industry-standard security measures, including <strong>Secure Socket Layer (SSL) encryption technology</strong>, to protect your personal and payment information during all digital transactions.
            </p>
            <p>
              Your payment details are securely processed through encrypted, certified financial gateways. <strong>We do not store full credit card or debit card numbers on our servers</strong> under any circumstance.
            </p>
          </div>

          <div className="policy-divider" />

          {/* Section 3 */}
          <div className="policy-section-block">
            <div className="policy-section-header">
              <span className="policy-section-num">03</span>
              <h2>Third-Party Disclosure</h2>
            </div>
            <p>
              We respect your trust. <strong>We do not sell, trade, rent, or lease your personal information</strong> to third parties for commercial gain or advertising.
            </p>
            <p>
              We may disclose your information only if strictly required by applicable legal authorities, lawful court orders, or governmental law enforcement agencies.
            </p>
          </div>

          <div className="policy-divider" />

          {/* Section 4 */}
          <div className="policy-section-block">
            <div className="policy-section-header">
              <span className="policy-section-num">04</span>
              <h2>Registered Boutique Office & Queries</h2>
            </div>
            <p>
              For questions regarding our privacy practices, data deletion requests, or order inquiries, you may reach our boutique concierges at:
            </p>
            <div className="address-box">
              <p className="address-line"><strong>ETERNYX Luxury Fragrances</strong></p>
              <p className="address-line">Jagdish Nagar, Bazar Tand, Road No. 2,</p>
              <p className="address-line">5th Building, 1st Floor, Ramgarh Cantt,</p>
              <p className="address-line">Jharkhand, Pincode 829122, India</p>
              <p className="address-line">Official Website:{' '}
                <a href="https://www.eternyxfragrance.com" target="_blank" rel="noopener noreferrer" className="policy-link">
                  www.eternyxfragrance.com
                </a>
              </p>
            </div>
          </div>

          <div className="policy-footer-actions">
            <Link href="/terms" className="policy-action-btn secondary">
              View Terms & Conditions
            </Link>
            <Link href="/contact" className="policy-action-btn primary">
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .policy-page-container {
          min-height: 100vh;
          background: #FAF6F4;
          color: #1A1617;
          padding: 140px 24px 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .policy-hero {
          max-width: 820px;
          text-align: center;
          margin-bottom: 50px;
        }

        .policy-eyebrow {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #B66D31;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .policy-title {
          font-family: var(--font-cormorant, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(2.2rem, 4.5vw, 3.4rem);
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #1A1617;
          line-height: 1.15;
          margin-bottom: 18px;
        }

        .policy-subtitle {
          font-size: 0.95rem;
          color: #7A6E6A;
          line-height: 1.7;
          font-weight: 400;
          max-width: 650px;
          margin: 0 auto;
        }

        .policy-content-section {
          width: 100%;
          max-width: 860px;
        }

        .policy-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          padding: 48px 40px;
          box-shadow: 0 4px 20px rgba(26, 22, 23, 0.03);
        }

        @media (max-width: 640px) {
          .policy-card {
            padding: 32px 20px;
          }
        }

        .policy-section-block {
          margin-bottom: 32px;
        }

        .policy-section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .policy-section-num {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #B66D31;
          border: 1px solid rgba(217, 148, 88, 0.4);
          background: rgba(217, 148, 88, 0.1);
          border-radius: 4px;
          padding: 3px 8px;
          display: inline-block;
        }

        .policy-section-header h2 {
          font-family: var(--font-cormorant, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.45rem;
          font-weight: 400;
          color: #1A1617;
          letter-spacing: 0.03em;
          margin: 0;
        }

        .policy-section-block p {
          font-size: 0.92rem;
          line-height: 1.8;
          color: #4A403E;
          margin-bottom: 12px;
          font-weight: 400;
        }

        .policy-section-block p:last-child {
          margin-bottom: 0;
        }

        .policy-section-block strong {
          color: #1A1617;
          font-weight: 600;
        }

        .address-box {
          background: #FAF6F4;
          border-left: 3px solid #D99458;
          padding: 16px 20px;
          border-radius: 0 6px 6px 0;
          margin-top: 14px;
        }

        .address-line {
          font-size: 0.88rem !important;
          color: #4A403E !important;
          margin-bottom: 6px !important;
          line-height: 1.6 !important;
        }

        .address-line:last-child {
          margin-bottom: 0 !important;
        }

        .policy-link {
          color: #B66D31;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 500;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .policy-link:hover {
          color: #1A1617;
        }

        .policy-divider {
          height: 1px;
          background: #EDE1DC;
          margin: 32px 0;
        }

        .policy-footer-actions {
          display: flex;
          gap: 16px;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #EDE1DC;
          flex-wrap: wrap;
        }

        .policy-action-btn {
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: all 0.2s ease;
          text-align: center;
          text-decoration: none;
        }

        .policy-action-btn.primary {
          background: #1A1617;
          color: #FAF6F4;
          border: 1px solid #1A1617;
        }

        .policy-action-btn.primary:hover {
          background: #2D2527;
          border-color: #2D2527;
        }

        .policy-action-btn.secondary {
          background: #FAF6F4;
          color: #1A1617;
          border: 1px solid #EDE1DC;
        }

        .policy-action-btn.secondary:hover {
          color: #1A1617;
          border-color: #D99458;
          background: #FFFFFF;
        }
      `}</style>
    </main>
  );
}
