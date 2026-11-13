import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | ETERNYX',
  description: 'Terms and Conditions, Shipping, Returns, Refunds, and Limitation of Liability for ETERNYX Luxury Fragrances.',
};

export default function TermsPage() {
  return (
    <main className="terms-page-container">
      {/* Hero Header */}
      <section className="terms-hero">
        <p className="terms-eyebrow">Legal & Policies</p>
        <h1 className="terms-title">Terms & Conditions</h1>
        <p className="terms-subtitle">
          Please review the official terms of use, product purchases, shipping, cancellations, and returns governing ETERNYX Luxury Fragrances.
        </p>

        {/* Quick Nav Pills */}
        <div className="terms-nav-pills">
          <a href="#acceptance" className="pill-link">Terms of Use</a>
          <a href="#liability" className="pill-link">Liability & Law</a>
          <a href="#returns" className="pill-link">Returns & Refunds</a>
          <a href="#shipping" className="pill-link">Shipping Info</a>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="terms-content-section">
        <div className="terms-card">

          {/* 01 Acceptance */}
          <div id="acceptance" className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">01</span>
              <h2>Acceptance of Terms</h2>
            </div>
            <p>
              Welcome to <strong>ETERNYX</strong>! By accessing or using our website{' '}
              <a href="https://www.eternyxfragrance.com" target="_blank" rel="noopener noreferrer" className="terms-link">
                www.eternyxfragrance.com
              </a>{' '}
              and purchasing our products, you agree to comply with and be bound by the following terms and conditions.
            </p>
            <p>
              If you do not agree with any part of these terms, please discontinue use of our website and services immediately.
            </p>
          </div>

          <div className="terms-divider" />

          {/* 02 Intellectual Property */}
          <div className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">02</span>
              <h2>Intellectual Property Rights</h2>
            </div>
            <p>
              All content on this website, including product designs, olfactory names, text, graphics, logos, images, and digital media, is the proprietary property of <strong>ETERNYX</strong> and is protected by intellectual property and copyright laws.
            </p>
            <p>
              You may not reproduce, duplicate, copy, sell, or distribute any content or brand assets without our prior written consent.
            </p>
          </div>

          <div className="terms-divider" />

          {/* 03 Products, Services & Pricing */}
          <div className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">03</span>
              <h2>Products, Services & Pricing</h2>
            </div>
            <p>
              We reserve the right to modify or discontinue any fragrance creation, service, or feature at any time without prior notice.
            </p>
            <p>
              Prices for our products are subject to change without notice. All prices are listed in Indian Rupees (₹) or the applicable checkout currency.
            </p>
          </div>

          <div className="terms-divider" />

          {/* 04 Limitation of Liability & Governing Law */}
          <div id="liability" className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">04</span>
              <h2>Limitation of Liability & Governing Law</h2>
            </div>
            <p>
              In no event shall <strong>ETERNYX</strong>, its directors, employees, or partners be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability shall in no circumstances exceed the actual amount paid by the customer for the specific product.
            </p>
            <p>
              These terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes shall be subject to the exclusive jurisdiction of the courts in <strong>Ramgarh, Jharkhand</strong>.
            </p>
          </div>

          <div className="terms-divider" />

          {/* 05 Returns & Cancellations */}
          <div id="returns" className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">05</span>
              <h2>Returns, Cancellations & Refunds Policy</h2>
            </div>
            <p>
              <strong>Order Cancellations:</strong> You may cancel your order within <strong>24 hours</strong> of placing it by contacting our support concierge. If the order has already been shipped, it cannot be cancelled.
            </p>
            <p>
              <strong>Eligible Returns:</strong> Due to the personal and cosmetic nature of luxury fragrance formulations, we accept returns only for products that are <strong>damaged, defective, or incorrect upon arrival</strong>. Items must be unused, in the same condition as received, and in their original packaging.
            </p>
            <p>
              <strong>Notification Window:</strong> To initiate a return, please contact us within <strong>48 hours of delivery</strong> with your order number and clear photographic proof of the damaged or incorrect product.
            </p>
          </div>

          <div className="terms-divider" />

          {/* 06 Refund Timeline */}
          <div id="refunds" className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">06</span>
              <h2>Refund Timeline</h2>
            </div>
            <p>
              Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund.
            </p>
            <p>
              If approved, the refund will be processed and automatically credited back to your original method of payment within <strong>5-7 business days</strong>.
            </p>
            <p>
              <em>Please note that original shipping costs are non-refundable.</em>
            </p>
          </div>

          <div className="terms-divider" />

          {/* 07 Shipping Information */}
          <div id="shipping" className="terms-section-block">
            <div className="terms-section-header">
              <span className="terms-section-num">07</span>
              <h2>Shipping Information & Contact</h2>
            </div>
            <p>
              <strong>Processing Times:</strong> Orders are processed and prepared for transit within <strong>2-3 business days</strong>.
            </p>
            <p>
              <strong>Tracking:</strong> Delivery times vary by location. You will receive an official tracking number and dispatch confirmation via email or SMS once your order has shipped.
            </p>
            <p>
              For any further queries, orders, or return requests, you can reach us at:
            </p>
            <div className="address-box">
              <p className="address-line"><strong>ETERNYX Luxury Fragrances</strong></p>
              <p className="address-line">Jagdish Nagar, Bazar Tand, Road No. 2,</p>
              <p className="address-line">5th Building, 1st Floor, Ramgarh Cantt,</p>
              <p className="address-line">Jharkhand, Pincode 829122, India</p>
              <p className="address-line">Website:{' '}
                <a href="https://www.eternyxfragrance.com" target="_blank" rel="noopener noreferrer" className="terms-link">
                  www.eternyxfragrance.com
                </a>
              </p>
            </div>
          </div>

          <div className="terms-footer-actions">
            <Link href="/privacy" className="terms-action-btn secondary">
              Privacy Policy
            </Link>
            <Link href="/contact" className="terms-action-btn secondary">
              Contact Concierge
            </Link>
            <Link href="/shop" className="terms-action-btn primary">
              Shop Fragrances
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .terms-page-container {
          min-height: 100vh;
          background: #FAF6F4;
          color: #1A1617;
          padding: 140px 24px 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .terms-hero {
          max-width: 820px;
          text-align: center;
          margin-bottom: 40px;
        }

        .terms-eyebrow {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #B66D31;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .terms-title {
          font-family: var(--font-cormorant, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(2.2rem, 4.5vw, 3.4rem);
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #1A1617;
          line-height: 1.15;
          margin-bottom: 18px;
        }

        .terms-subtitle {
          font-size: 0.95rem;
          color: #7A6E6A;
          line-height: 1.7;
          font-weight: 400;
          max-width: 650px;
          margin: 0 auto 24px auto;
        }

        .terms-nav-pills {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pill-link {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A6E6A;
          border: 1px solid #EDE1DC;
          border-radius: 20px;
          padding: 6px 14px;
          transition: all 0.2s ease;
          text-decoration: none;
          background: #FFFFFF;
          font-weight: 500;
        }

        .pill-link:hover {
          color: #1A1617;
          border-color: #D99458;
          background: #FAF6F4;
        }

        .terms-content-section {
          width: 100%;
          max-width: 860px;
        }

        .terms-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          padding: 48px 40px;
          box-shadow: 0 4px 20px rgba(26, 22, 23, 0.03);
        }

        @media (max-width: 640px) {
          .terms-card {
            padding: 32px 20px;
          }
        }

        .terms-section-block {
          margin-bottom: 32px;
          scroll-margin-top: 100px;
        }

        .terms-section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .terms-section-num {
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

        .terms-section-header h2 {
          font-family: var(--font-cormorant, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.45rem;
          font-weight: 400;
          color: #1A1617;
          letter-spacing: 0.03em;
          margin: 0;
        }

        .terms-section-block p {
          font-size: 0.92rem;
          line-height: 1.8;
          color: #4A403E;
          margin-bottom: 12px;
          font-weight: 400;
        }

        .terms-section-block p:last-child {
          margin-bottom: 0;
        }

        .terms-section-block strong {
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

        .terms-link {
          color: #B66D31;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 500;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .terms-link:hover {
          color: #1A1617;
        }

        .terms-divider {
          height: 1px;
          background: #EDE1DC;
          margin: 32px 0;
        }

        .terms-footer-actions {
          display: flex;
          gap: 16px;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #EDE1DC;
          flex-wrap: wrap;
        }

        .terms-action-btn {
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

        .terms-action-btn.primary {
          background: #1A1617;
          color: #FAF6F4;
          border: 1px solid #1A1617;
        }

        .terms-action-btn.primary:hover {
          background: #2D2527;
          border-color: #2D2527;
        }

        .terms-action-btn.secondary {
          background: #FAF6F4;
          color: #1A1617;
          border: 1px solid #EDE1DC;
        }

        .terms-action-btn.secondary:hover {
          color: #1A1617;
          border-color: #D99458;
          background: #FFFFFF;
        }
      `}</style>
    </main>
  );
}
