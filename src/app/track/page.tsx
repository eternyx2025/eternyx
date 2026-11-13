'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TrackingCheckpoint {
  time: string;
  location: string;
  description: string;
}

interface TrackingData {
  trackingId: string;
  carrier: string;
  order?: {
    orderId: string;
    date: string;
    status: string;
    carrier: string;
    destinationCity: string;
    destinationZip: string;
    itemsCount: number;
  };
  tracking: {
    status: string;
    tracking_id: string;
    checkpoints: TrackingCheckpoint[];
  };
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || searchParams.get('tracking_id') || searchParams.get('order_id') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<TrackingData | null>(null);

  useEffect(() => {
    if (initialQuery) {
      handleTrack(initialQuery);
    }
  }, [initialQuery]);

  const handleTrack = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(q)}`);
      const result = await res.json();

      if (res.ok && result.success) {
        setData(result);
      } else {
        setError(result.error || 'No tracking record found for this tracking number or order.');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError('Unable to fetch live tracking at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(query);
  };

  return (
    <div className="track-page-container">
      <div className="track-card">
        <div className="track-header">
          <span className="eyebrow">iCarry Logistics Fulfillment</span>
          <h1>Live Parcel Tracking</h1>
          <p className="subtitle">
            Enter your AWB Airway Bill tracking number or Order ID to inspect real-time dispatch progress.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={onSubmit} className="track-form">
          <div className="input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="e.g. AWB-101-123456 or ORD-A1B2C3D4"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="track-btn">
            {loading ? 'LOOKING UP…' : 'TRACK PARCEL'}
          </button>
        </form>

        {error && <div className="track-error">{error}</div>}

        {/* Results view */}
        {data && (
          <div className="track-result-section">
            {/* Status Banner */}
            <div className="status-banner">
              <div className="status-badge">
                <span className="live-dot" />
                <span className="status-text">{data.tracking?.status || 'In Transit'}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-label">Airway Bill (AWB)</span>
                <span className="meta-val font-mono">{data.trackingId}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-label">Courier Carrier</span>
                <span className="meta-val">{data.carrier}</span>
              </div>
            </div>

            {/* Order info if found */}
            {data.order && (
              <div className="order-summary-chip">
                <div className="chip-col">
                  <span className="chip-label">Order Reference</span>
                  <span className="chip-val">{data.order.orderId}</span>
                </div>
                {data.order.destinationCity && (
                  <div className="chip-col">
                    <span className="chip-label">Destination</span>
                    <span className="chip-val">{data.order.destinationCity} ({data.order.destinationZip})</span>
                  </div>
                )}
                <div className="chip-col">
                  <span className="chip-label">Order Date</span>
                  <span className="chip-val">{data.order.date || 'Recent'}</span>
                </div>
              </div>
            )}

            {/* Checkpoints Timeline */}
            <div className="timeline-container">
              <h3>Live Checkpoints & Delivery Logs</h3>

              {data.tracking?.checkpoints && data.tracking.checkpoints.length > 0 ? (
                <div className="timeline">
                  {data.tracking.checkpoints.map((cp, idx) => (
                    <div key={idx} className={`timeline-step ${idx === 0 ? 'current' : ''}`}>
                      <div className="step-marker">
                        <div className="outer-circle">
                          <div className="inner-dot" />
                        </div>
                        {idx < data.tracking.checkpoints.length - 1 && <div className="step-line" />}
                      </div>
                      <div className="step-content">
                        <p className="step-desc">{cp.description}</p>
                        <div className="step-meta">
                          <span className="step-time">{cp.time}</span>
                          {cp.location && <span className="step-loc">• {cp.location}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-logs-msg">
                  <p>Shipment is booked and confirmed with the courier partner. Checkpoints will appear shortly once scanned at the pickup hub.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="track-footer">
          <Link href="/" className="back-link">
            ← Return to Eternyx Boutique
          </Link>
        </div>
      </div>

      <style jsx>{`
        .track-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 130px 20px 80px 20px;
          background: #FAF6F4;
          color: #1A1617;
          font-family: var(--font-sans);
        }

        .track-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 16px;
          padding: 48px;
          width: 100%;
          max-width: 680px;
          box-shadow: 0 10px 40px rgba(26, 22, 23, 0.05);
        }

        .track-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .eyebrow {
          display: block;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #D99458;
          margin-bottom: 10px;
          font-weight: 700;
        }
        h1 {
          font-family: var(--font-serif);
          font-size: 2.1rem;
          font-weight: 500;
          color: #1A1617;
          letter-spacing: -0.01em;
          margin: 0 0 12px 0;
        }
        .subtitle {
          color: #7A6E6A;
          font-size: 0.88rem;
          line-height: 1.6;
          margin: 0 auto;
          max-width: 480px;
        }

        .track-form {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }
        .input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          border-radius: 8px;
          padding: 12px 16px;
          transition: border-color 0.2s;
        }
        .input-wrap:focus-within {
          border-color: #D99458;
          box-shadow: 0 0 0 2px rgba(217, 148, 88, 0.15);
        }
        .input-wrap svg {
          color: #7A6E6A;
        }
        .input-wrap input {
          background: none;
          border: none;
          color: #1A1617;
          font-size: 0.92rem;
          outline: none;
          width: 100%;
          font-weight: 500;
        }
        .track-btn {
          background: #1A1617;
          color: #FAF6F4;
          border: 1px solid #1A1617;
          padding: 0 24px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.25s;
          white-space: nowrap;
        }
        .track-btn:hover:not(:disabled) {
          background: #D99458;
          border-color: #D99458;
          color: #1A1617;
        }
        .track-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .track-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #dc2626;
          padding: 14px 18px;
          border-radius: 8px;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 24px;
        }

        /* Results */
        .track-result-section {
          animation: fadeIn 0.3s ease;
          border-top: 1px solid #EDE1DC;
          padding-top: 28px;
        }

        .status-banner {
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          border-radius: 10px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #047857;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 1.8s infinite;
        }

        .meta-pair {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .meta-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #7A6E6A;
          font-weight: 600;
        }
        .meta-val {
          font-size: 0.9rem;
          color: #1A1617;
          font-weight: 600;
        }
        .font-mono {
          font-family: monospace;
          color: #D99458;
        }

        .order-summary-chip {
          display: flex;
          gap: 20px;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 8px;
          padding: 12px 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .chip-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .chip-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7A6E6A;
          font-weight: 600;
        }
        .chip-val {
          font-size: 0.85rem;
          color: #1A1617;
          font-weight: 600;
        }

        /* Timeline */
        .timeline-container h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1A1617;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 24px 0;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .timeline-step {
          display: flex;
          gap: 20px;
          position: relative;
        }

        .step-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 24px;
        }
        .outer-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #EDE1DC;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          z-index: 2;
        }
        .timeline-step.current .outer-circle {
          border-color: #D99458;
          background: rgba(217, 148, 88, 0.15);
        }
        .inner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #EDE1DC;
        }
        .timeline-step.current .inner-dot {
          background: #D99458;
        }
        .step-line {
          width: 2px;
          flex: 1;
          background: #EDE1DC;
          margin: 4px 0;
          min-height: 44px;
        }

        .step-content {
          padding-bottom: 24px;
        }
        .step-desc {
          font-size: 0.9rem;
          color: #1A1617;
          margin: 0 0 4px 0;
          line-height: 1.4;
          font-weight: 500;
        }
        .timeline-step.current .step-desc {
          color: #D99458;
          font-weight: 600;
        }
        .step-meta {
          font-size: 0.78rem;
          color: #7A6E6A;
        }

        .no-logs-msg {
          padding: 24px;
          text-align: center;
          color: #7A6E6A;
          font-size: 0.85rem;
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          border-radius: 8px;
        }

        .track-footer {
          margin-top: 36px;
          text-align: center;
        }
        .back-link {
          color: #7A6E6A;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #D99458;
        }

        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .track-card {
            padding: 24px;
          }
          .track-form {
            flex-direction: column;
          }
          .track-btn {
            padding: 12px;
          }
          .status-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .step-content {
          padding-bottom: 24px;
        }
        .step-desc {
          font-size: 0.9rem;
          color: #fff;
          margin: 0 0 4px 0;
          line-height: 1.4;
        }
        .timeline-step.current .step-desc {
          color: #d4af37;
          font-weight: 500;
        }
        .step-meta {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .no-logs-msg {
          padding: 24px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }

        .track-footer {
          margin-top: 36px;
          text-align: center;
        }
        .back-link {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.82rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #d4af37;
        }

        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .track-card {
            padding: 24px;
          }
          .track-form {
            flex-direction: column;
          }
          .track-btn {
            padding: 12px;
          }
          .status-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', color: '#888' }}>Loading tracking...</div>}>
      <TrackContent />
    </Suspense>
  );
}
