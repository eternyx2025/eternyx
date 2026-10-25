import { orderService } from '@/services/orderService';
import { icarryService } from '@/services/icarryService';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const order = await orderService.getById(decodedId);

  if (!order) {
    return (
      <div className="order-not-found-container">
        <div className="not-found-card">
          <div className="gold-seal">ETERNYX</div>
          <h1>Order Not Found</h1>
          <p>We could not find an order matching reference <strong>{decodedId}</strong>.</p>
          <div className="actions">
            <Link href="/shop" className="btn-gold">Return to Boutique</Link>
          </div>
        </div>
        <style>{`
          .order-not-found-container {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #080808;
            color: #fff;
            padding: 120px 24px;
          }
          .not-found-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(212, 175, 55, 0.2);
            padding: 48px;
            text-align: center;
            max-width: 480px;
            width: 100%;
          }
          .gold-seal {
            font-size: 0.75rem;
            letter-spacing: 0.3em;
            color: #d4af37;
            margin-bottom: 16px;
          }
          .not-found-card h1 {
            font-size: 1.8rem;
            font-weight: 300;
            margin-bottom: 12px;
          }
          .not-found-card p {
            color: #888;
            font-size: 0.9rem;
            margin-bottom: 28px;
          }
          .btn-gold {
            display: inline-block;
            background: #d4af37;
            color: #000;
            padding: 12px 28px;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  // Fetch live tracking if order has tracking/AWB or order ID
  const trackingRef = order.shipping_tracking_id || order.tracking_id || order.id;
  const trackingData = await icarryService.trackShipment(trackingRef);

  // Self-Healing Auto-Sync: if courier reports a new status, write it to MySQL in the background
  let currentStatus = order.status || 'Processing';
  if (trackingData && trackingData.status) {
    const synced = await orderService.syncDeliveryStatus(order.id, trackingData.status);
    if (synced) {
      currentStatus = synced;
    } else {
      currentStatus = order.status || trackingData.status;
    }
  }

  const statusSteps = ['Placed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes('deliver')) return 4;
    if (lower.includes('out for')) return 3;
    if (lower.includes('transit')) return 2;
    if (lower.includes('ship') || lower.includes('dispatch') || lower.includes('pickup')) return 1;
    return 0;
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="order-detail-page">
      <div className="order-detail-wrapper">
        
        {/* Header Bar */}
        <div className="order-page-header">
          <div className="header-meta">
            <span className="order-tag">Order Confirmation & Dispatch</span>
            <h1>Order #{order.id}</h1>
            <p className="order-timestamp">Placed on {order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently')}</p>
          </div>
          <div className="header-badges">
            <span className={`status-pill ${order.status?.toLowerCase()}`}>
              {order.status || 'Processing'}
            </span>
            <span className="payment-pill">
              {order.payment_status === 'Paid' ? 'Paid via Razorpay' : (order.payment_status || 'Prepaid')}
            </span>
          </div>
        </div>

        {/* ================= LIVE TRACKING SECTION ================= */}
        <div className="tracking-section-card">
          <div className="tracking-card-header">
            <div className="carrier-badge">
              <span className="dot" />
              <span>Live Parcel Tracking &bull; iCarry Logistics</span>
            </div>
            {(order.shipping_tracking_id || order.tracking_id) && (
              <span className="awb-num">AWB: {order.shipping_tracking_id || order.tracking_id}</span>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="stepper-wrapper">
            <div className="stepper-line">
              <div
                className="stepper-line-fill"
                style={{ width: `${(activeIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
            <div className="stepper-nodes">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                return (
                  <div key={step} className={`step-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="node-circle">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className="node-label">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkpoints Timeline */}
          {trackingData.checkpoints && trackingData.checkpoints.length > 0 && (
            <div className="timeline-block">
              <h3 className="timeline-title">Dispatch Activity & Checkpoints</h3>
              <div className="timeline-list">
                {trackingData.checkpoints.map((cp, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="tl-indicator" />
                    <div className="tl-content">
                      <div className="tl-top">
                        <span className="tl-time">{cp.time}</span>
                        {cp.location && <span className="tl-loc">{cp.location}</span>}
                      </div>
                      <p className="tl-desc">{cp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tracking-footer">
            <p className="tracking-note">
              Carrier: <strong>{order.carrier || 'iCarry Courier Partner (Delhivery/BlueDart)'}</strong> &bull; Estimated delivery: 2-4 business days.
            </p>
            <Link href={`/track?query=${encodeURIComponent(order.shipping_tracking_id || order.tracking_id || order.id)}`} className="btn-full-track">
              Open Full Tracking View →
            </Link>
          </div>
        </div>

        {/* ================= ORDER DETAILS GRID ================= */}
        <div className="details-grid">
          
          {/* Left: Items List */}
          <div className="grid-card items-card">
            <h2>Items in Shipment ({order.items?.length || 0})</h2>
            <div className="items-list">
              {order.items && order.items.map((item, i) => (
                <div key={i} className="item-row">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="item-img" />
                  ) : (
                    <div className="item-img placeholder" />
                  )}
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    {item.size && <span className="item-size">{item.size}</span>}
                    <div className="item-qty">Qty: {item.quantity} &times; ₹{Number(item.price).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="item-total">
                    ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Financials Breakdown */}
            <div className="price-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
              {order.discount_code && (
                <div className="summary-row discount">
                  <span>Coupon Applied ({order.discount_code})</span>
                  <span>Applied</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping & Insurance</span>
                <span className="free">COMPLIMENTARY</span>
              </div>
              <div className="summary-row grand-total">
                <span>Total Paid</span>
                <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right: Shipping & Customer Info */}
          <div className="grid-card customer-card">
            <h2>Delivery Address</h2>
            <div className="address-box">
              <p className="recipient-name">{order.customer_name || 'Customer'}</p>
              {order.shipping_address ? (
                <>
                  <p>{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.zip}</p>
                  <p>{order.shipping_address.country || 'India'}</p>
                </>
              ) : (
                <p>Address on file with courier.</p>
              )}
            </div>

            <div className="contact-box">
              <h3>Contact Details</h3>
              <p>Email: {order.customer_email || '—'}</p>
              {order.customer?.phone && <p>Phone: {order.customer.phone}</p>}
            </div>

            <div className="support-box">
              <h3>Need Assistance?</h3>
              <p>If you have any questions regarding this order or delivery dispatch, our concierge is available 24/7.</p>
              <Link href="/contact" className="btn-contact">Contact Concierge</Link>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .order-detail-page {
          min-height: 100vh;
          background: #080808;
          color: #e5e5e5;
          padding: 120px 24px 80px 24px;
        }
        .order-detail-wrapper {
          max-width: 1000px;
          margin: 0 auto;
        }
        .order-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .order-tag {
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #d4af37;
          display: block;
          margin-bottom: 6px;
        }
        .order-page-header h1 {
          font-size: 2rem;
          font-weight: 300;
          color: #fff;
          margin: 0 0 6px 0;
          font-family: serif;
        }
        .order-timestamp {
          font-size: 0.85rem;
          color: #777;
          margin: 0;
        }
        .header-badges {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .status-pill {
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .status-pill.delivered {
          background: rgba(72, 187, 120, 0.15);
          color: #48bb78;
          border-color: rgba(72, 187, 120, 0.3);
        }
        .payment-pill {
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          color: #aaa;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Tracking Section Card */
        .tracking-section-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(212, 175, 55, 0.25);
          padding: 32px;
          border-radius: 4px;
          margin-bottom: 32px;
        }
        .tracking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .carrier-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #d4af37;
        }
        .carrier-badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #48bb78;
          box-shadow: 0 0 10px #48bb78;
        }
        .awb-num {
          font-family: monospace;
          font-size: 0.85rem;
          color: #aaa;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
        }

        /* Stepper */
        .stepper-wrapper {
          position: relative;
          margin: 40px 0 36px 0;
          padding: 0 20px;
        }
        .stepper-line {
          position: absolute;
          top: 15px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 1;
        }
        .stepper-line-fill {
          height: 100%;
          background: #d4af37;
          transition: width 0.4s ease;
        }
        .stepper-nodes {
          position: relative;
          display: flex;
          justify-content: space-between;
          z-index: 2;
        }
        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .node-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #111;
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.3s;
        }
        .step-node.completed .node-circle {
          border-color: #d4af37;
          background: #d4af37;
          color: #000;
        }
        .step-node.current .node-circle {
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.5);
        }
        .node-label {
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: #666;
          text-transform: uppercase;
        }
        .step-node.completed .node-label {
          color: #d4af37;
        }

        /* Timeline */
        .timeline-block {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .timeline-title {
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 20px;
        }
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .timeline-item {
          display: flex;
          gap: 16px;
        }
        .tl-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d4af37;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .tl-content {
          flex: 1;
        }
        .tl-top {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
        }
        .tl-time {
          font-size: 0.75rem;
          color: #d4af37;
          font-weight: 500;
        }
        .tl-loc {
          font-size: 0.75rem;
          color: #888;
        }
        .tl-desc {
          font-size: 0.85rem;
          color: #ccc;
          margin: 0;
        }

        .tracking-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .tracking-note {
          font-size: 0.82rem;
          color: #888;
          margin: 0;
        }
        .btn-full-track {
          font-size: 0.8rem;
          color: #d4af37;
          text-decoration: none;
          letter-spacing: 0.08em;
          font-weight: 500;
        }
        .btn-full-track:hover {
          text-decoration: underline;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 28px;
        }
        @media (max-width: 860px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
        .grid-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 28px;
          border-radius: 4px;
        }
        .grid-card h2 {
          font-size: 1.1rem;
          font-weight: 400;
          color: #fff;
          margin-top: 0;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .item-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .item-img {
          width: 54px;
          height: 54px;
          object-fit: cover;
          border-radius: 2px;
          background: #111;
        }
        .item-img.placeholder {
          background: #1a1a1a;
        }
        .item-info {
          flex: 1;
        }
        .item-info h4 {
          margin: 0 0 4px 0;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
        }
        .item-size {
          font-size: 0.75rem;
          color: #888;
          display: block;
          margin-bottom: 2px;
        }
        .item-qty {
          font-size: 0.78rem;
          color: #aaa;
        }
        .item-total {
          font-size: 0.9rem;
          font-weight: 500;
          color: #d4af37;
        }

        .price-summary {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #888;
        }
        .summary-row.discount {
          color: #48bb78;
        }
        .summary-row .free {
          color: #d4af37;
          font-weight: 500;
        }
        .summary-row.grand-total {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 12px;
          font-size: 1.05rem;
          color: #fff;
          font-weight: 600;
        }
        .summary-row.grand-total span:last-child {
          color: #d4af37;
        }

        .address-box, .contact-box, .support-box {
          margin-bottom: 20px;
          font-size: 0.85rem;
          line-height: 1.6;
          color: #aaa;
        }
        .recipient-name {
          color: #fff;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .contact-box h3, .support-box h3 {
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 8px;
        }
        .btn-contact {
          display: inline-block;
          margin-top: 10px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          padding: 8px 18px;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
