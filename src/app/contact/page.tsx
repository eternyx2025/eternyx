'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('General');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type: inquiryType, message }),
      });
      if (res.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json();
        setSubmitError(data.error || 'Failed to dispatch inquiry.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-container">
      {/* Hero Header */}
      <section className="contact-hero">
        <p className="contact-eyebrow">Client Care</p>
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">
          Whether seeking details on our collections, inquiring about bespoke formulation commissions, or requesting digital scent guidance, our online concierge is at your disposal.
        </p>
      </section>

      {/* Main Grid: Form Left, Concierge Right */}
      <section className="contact-grid-section">
        <div className="contact-grid">
          
          {/* Inquiry Form Card */}
          <div className="form-col">
            <div className="glass-card contact-card">
              <h2>Send an Inquiry</h2>
              <p className="card-desc">For digital assistance, complete the fields below.</p>
              
              {success ? (
                <div className="success-state">
                  <span className="success-icon">✓</span>
                  <h3>Inquiry Dispatched</h3>
                  <p>Thank you for contacting ETERNYX. A concierge representative will review your message and reply within 12 hours.</p>
                  <button className="reset-btn" onClick={() => setSuccess(false)}>Send Another Inquiry</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="con-name">Full Name</label>
                    <input 
                      id="con-name"
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Julian Vane"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="con-email">Email Address</label>
                    <input 
                      id="con-email"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="julian@vane.com"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="con-type">Inquiry Type</label>
                    <select 
                      id="con-type"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                    >
                      <option value="General">General & Scent Advice</option>
                      <option value="Bespoke">Bespoke Commissions</option>
                      <option value="Press">Press & Collaborations</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="con-message">Message</label>
                    <textarea 
                      id="con-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry in detail..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  {submitError && <p className="form-error">{submitError}</p>}
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Dispatch Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Digital Concierge Details */}
          <div className="boutiques-col">
            <h2 className="boutiques-title">Customer Concierge</h2>
            <p className="boutiques-desc">For order inquiries, digital advice, or custom consultations.</p>
            
            <div className="boutique-list">
              <div className="boutique-card glass-card">
                <div className="card-top">
                  <span className="boutique-city">Digital Support</span>
                  <h3 className="boutique-name">Online Client Care</h3>
                </div>
                
                <div className="card-details">
                  <div className="detail-row">
                    <span className="label">Hours</span>
                    <p className="value">Monday – Saturday: 09:00 – 19:00 (GMT)</p>
                  </div>
                  <div className="detail-row">
                    <span className="label">Client Email</span>
                    <p className="value">concierge@eternyx.com</p>
                  </div>
                  <div className="detail-row">
                    <span className="label">Corporate</span>
                    <p className="value">info@eternyx.com</p>
                  </div>
                </div>
              </div>

              <div className="boutique-card glass-card">
                <div className="card-top">
                  <span className="boutique-city">Bespoke Guidance</span>
                  <h3 className="boutique-name">Virtual Consultations</h3>
                </div>
                
                <div className="card-details">
                  <div className="detail-row">
                    <span className="label">Availability</span>
                    <p className="value">By reservation only. Schedule a virtual consultation using our bespoke booking form.</p>
                  </div>
                  <div className="detail-row">
                    <span className="label">Platform</span>
                    <p className="value">Private Zoom / Google Meet video sessions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style jsx>{`
        .contact-container {
          min-height: 100vh;
          background-color: #FAF6F4;
          padding: 140px 50px 80px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #1A1617;
        }

        .contact-hero {
          text-align: center;
          margin-bottom: 60px;
          max-width: 700px;
        }

        .contact-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #B66D31;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .contact-title {
          font-family: var(--font-serif);
          font-size: 2.75rem;
          color: #1A1617;
          font-weight: 400;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .contact-subtitle {
          font-size: 0.95rem;
          color: #7A6E6A;
          line-height: 1.7;
          font-weight: 400;
        }

        .contact-grid-section {
          width: 100%;
          max-width: 1100px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }
        }

        .glass-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .contact-card {
          padding: 40px;
        }

        .contact-card h2 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: #1A1617;
          margin-bottom: 8px;
          font-weight: 400;
        }

        .card-desc {
          font-size: 0.85rem;
          color: #7A6E6A;
          margin-bottom: 30px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7A6E6A;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: #FFFFFF;
          border: 1.5px solid #EDE1DC;
          padding: 11px 14px;
          color: #1A1617;
          font-size: 0.88rem;
          font-family: inherit;
          border-radius: 4px;
          transition: border-color 0.2s;
        }

        .form-group select option {
          background: #FFFFFF;
          color: #1A1617;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #D99458;
          background: #FFFFFF;
        }

        .submit-btn {
          margin-top: 10px;
          background: #1A1617;
          color: #FAF6F4;
          border: none;
          padding: 13px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover { background: #2D2527; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-error {
          color: #c53030;
          font-size: 0.8rem;
          padding: 8px 12px;
          background: rgba(229, 62, 62, 0.08);
          border: 1px solid rgba(229, 62, 62, 0.25);
          border-radius: 4px;
        }

        .success-state {
          text-align: center;
          padding: 40px 0;
        }

        .success-icon {
          font-size: 2.5rem;
          color: #276749;
          display: block;
          margin-bottom: 16px;
        }

        .success-state h3 {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #1A1617;
          margin-bottom: 10px;
          font-weight: 400;
        }

        .success-state p {
          font-size: 0.88rem;
          color: #7A6E6A;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .reset-btn {
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          color: #1A1617;
          padding: 10px 20px;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          border-color: #D99458;
          background: #FFFFFF;
        }

        .boutiques-title {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: #1A1617;
          margin-bottom: 8px;
          font-weight: 400;
        }

        .boutiques-desc {
          font-size: 0.85rem;
          color: #7A6E6A;
          margin-bottom: 30px;
        }

        .boutique-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .boutique-card {
          padding: 24px 30px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .boutique-card:hover {
          border-color: #D99458;
          box-shadow: 0 6px 20px rgba(217, 148, 88, 0.08);
        }

        .boutique-city {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #B66D31;
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .boutique-name {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: #1A1617;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid #EDE1DC;
          padding-top: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          gap: 20px;
        }

        @media (max-width: 480px) {
          .detail-row {
            flex-direction: column;
            gap: 4px;
          }
        }

        .detail-row .label {
          color: #7A6E6A;
          text-transform: uppercase;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          font-weight: 600;
          flex-shrink: 0;
        }

        .detail-row .value {
          color: #4A403E;
          text-align: right;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 480px) {
          .detail-row .value {
            text-align: left;
          }
        }

        .phone-value {
          color: #B66D31 !important;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .contact-container {
            padding: 100px 24px 60px 24px;
          }
          .contact-title {
            font-size: 2rem;
          }
          .contact-card, .boutique-card {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
