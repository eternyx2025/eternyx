'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customer_id: string;
  date: string;
  total: number;
  status: string;
  items_count: number;
  items: OrderItem[];
  shipping_address: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  discount_code: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    spent: number;
    orders: number;
    lastActive: string;
  } | null;
  shipping_carrier?: string | null;
  shipping_tracking_id?: string | null;
  shipping_label_url?: string | null;
  shipping_cost?: number | null;
  payment_status?: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Drawer States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // iCarry logistics states
  const [weightGrams, setWeightGrams] = useState<number>(250);
  const [shipmentMode, setShipmentMode] = useState<'E' | 'S'>('E');
  const [rates, setRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<any | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [syncingCourier, setSyncingCourier] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Synchronize state when selectedOrder changes in details drawer
  useEffect(() => {
    if (selectedOrder) {
      // Calculate default package weight based on scent manifest items
      let defaultWeight = 0;
      selectedOrder.items?.forEach((item) => {
        const qty = item.quantity || 1;
        const sizeLower = (item.size || '').toLowerCase();
        if (sizeLower.includes('100ml') || sizeLower.includes('100 ml')) {
          defaultWeight += 250 * qty;
        } else if (sizeLower.includes('50ml') || sizeLower.includes('50 ml')) {
          defaultWeight += 150 * qty;
        } else {
          defaultWeight += 200 * qty;
        }
      });
      
      setWeightGrams(defaultWeight || 250);
      setShipmentMode('E');
      setRates([]);
      setSelectedRate(null);
      setRatesError('');
      setRatesLoading(false);
      setBookingLoading(false);
      setBookingError('');
      
      // If tracking ID is present, fetch checkpoints timeline from iCarry API
      if (selectedOrder.shipping_tracking_id) {
        fetchTracking(selectedOrder.shipping_tracking_id);
      } else {
        setTrackingInfo(null);
      }
    }
  }, [selectedOrder]);

  const fetchRates = async () => {
    if (!selectedOrder) return;
    setRatesLoading(true);
    setRatesError('');
    setRates([]);
    setSelectedRate(null);
    try {
      const res = await fetch('/api/admin/icarry/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          weightGrams,
          shipmentMode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRates(data.rates || []);
        if (data.rates && data.rates.length > 0) {
          setSelectedRate(data.rates[0]);
        }
      } else {
        setRatesError(data.error || 'Failed to calculate rates.');
      }
    } catch (err) {
      console.error(err);
      setRatesError('Error calculating shipping rates.');
    } finally {
      setRatesLoading(false);
    }
  };

  const bookCourier = async () => {
    if (!selectedOrder || !selectedRate) return;
    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await fetch('/api/admin/icarry/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          weightGrams,
          shipmentMode,
          courierId: selectedRate.courier_id,
          courierName: selectedRate.courier_name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh local orders list
        fetchOrders();
        // Keep the drawer view synchronized
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: 'Shipped',
                shipping_carrier: data.booking.carrier,
                shipping_tracking_id: data.booking.tracking_id,
                shipping_label_url: data.booking.label_url,
                shipping_cost: data.booking.cost,
              }
            : null
        );
      } else {
        setBookingError(data.error || 'Courier booking failed.');
      }
    } catch (err) {
      console.error(err);
      setBookingError('Error booking shipping carrier.');
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchTracking = async (awb: string) => {
    setTrackingLoading(true);
    try {
      const orderIdParam = selectedOrder?.id ? `&order_id=${encodeURIComponent(selectedOrder.id)}` : '';
      const res = await fetch(`/api/admin/icarry/track?tracking_id=${encodeURIComponent(awb)}${orderIdParam}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackingInfo(data.tracking);
        if (data.syncedStatus && selectedOrder && data.syncedStatus !== selectedOrder.status) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: data.syncedStatus } : null));
          fetchOrders();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleSyncAllDeliveries = async () => {
    setSyncingCourier(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/admin/icarry/sync-all', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.message || 'Delivery statuses updated.');
        fetchOrders();
      } else {
        alert(data.error || 'Failed to sync courier delivery statuses.');
      }
    } catch (err) {
      console.error('Courier sync error:', err);
    } finally {
      setSyncingCourier(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = () => {
    setLoading(true);
    const url = statusFilter === 'all' 
      ? '/api/admin/orders' 
      : `/api/admin/orders?status=${statusFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort orders by created_at desc or date desc
          const sorted = data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          setOrders(sorted);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        // Keep the local drawer details in sync
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const orderIdMatch = o.id.toLowerCase().includes(query);
    const customerNameMatch = o.customer?.name.toLowerCase().includes(query) || false;
    const customerEmailMatch = o.customer?.email.toLowerCase().includes(query) || false;
    const customerPhoneMatch = o.customer?.phone?.toLowerCase().includes(query) || false;
    return orderIdMatch || customerNameMatch || customerEmailMatch || customerPhoneMatch;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          {syncMessage && <p style={{ fontSize: '0.8rem', color: '#d4af37', margin: '4px 0 0 0' }}>{syncMessage}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="admin-btn-secondary"
            onClick={handleSyncAllDeliveries}
            disabled={syncingCourier}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#d4af37',
              borderRadius: '3px',
              cursor: syncingCourier ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{syncingCourier ? 'Syncing Parcels...' : '🔄 Sync Live Courier Statuses'}</span>
          </button>
          <button className="admin-btn-primary" onClick={fetchOrders}>Refresh Lists</button>
        </div>
      </div>

      <div className="admin-filters">
        <input 
          type="text" 
          placeholder="Search orders by ID, customer name or email..." 
          className="admin-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Loading scent orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty">
          <p>No orders matching filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <div className="col-id">Order ID</div>
            <div className="col-customer">Customer</div>
            <div className="col-date">Date</div>
            <div className="col-items">Items</div>
            <div className="col-total">Total</div>
            <div className="col-status">Status</div>
            <div className="col-actions"></div>
          </div>

          <div className="table-body">
            {filteredOrders.map((order) => (
              <div key={order.id} className="table-row">
                <div className="col-id"><strong>{order.id}</strong></div>
                <div className="col-customer">
                  {order.customer ? (
                    <div>
                      <p className="cust-name">{order.customer.name}</p>
                      <p className="cust-email">{order.customer.email}</p>
                      {order.customer.phone && (
                        <p className="cust-phone" style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '3px', fontWeight: 500 }}>
                          📞 {order.customer.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    'Guest User'
                  )}
                </div>
                <div className="col-date">{order.date}</div>
                <div className="col-items">{order.items_count} items</div>
                <div className="col-total">₹{Number(order.total).toFixed(2)}</div>
                <div className="col-status">
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  {order.payment_status === 'Paid' ? (
                    <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '3px', background: 'rgba(39, 174, 96, 0.2)', color: '#2ecc71', fontWeight: 700, border: '1px solid rgba(46, 204, 113, 0.35)', letterSpacing: '0.04em' }}>
                      ✓ PAID
                    </span>
                  ) : order.payment_status === 'Failed' ? (
                    <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '3px', background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', fontWeight: 700, border: '1px solid rgba(231, 76, 60, 0.35)', letterSpacing: '0.04em' }}>
                      ✕ FAILED
                    </span>
                  ) : (
                    <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '3px', background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', fontWeight: 700, border: '1px solid rgba(243, 156, 18, 0.35)', letterSpacing: '0.04em' }}>
                      ⏳ UNPAID
                    </span>
                  )}
                </div>
                <div className="col-actions">
                  <button className="action-link" onClick={() => handleOpenDetails(order)}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Drawer for Order Details */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      <div className={`drawer-panel ${isDrawerOpen ? 'open' : ''}`} data-lenis-prevent="true">
        {selectedOrder && (
          <>
            <div className="drawer-header">
              <div>
                <h2>Order Details</h2>
                <p className="drawer-subhead">{selectedOrder.id}</p>
              </div>
              <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}>&times;</button>
            </div>

            <div className="drawer-content">
              {/* Payment Verification Card */}
              <div className="info-card payment-card" style={{ 
                background: selectedOrder.payment_status === 'Paid' ? 'rgba(46, 204, 113, 0.08)' : 'rgba(243, 156, 18, 0.08)',
                border: selectedOrder.payment_status === 'Paid' ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(243, 156, 18, 0.4)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: '#fff' }}>
                    <span>💳</span> Payment Status
                  </h3>
                  {selectedOrder.payment_status === 'Paid' ? (
                    <span style={{ background: '#27ae60', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                      PAID ✓
                    </span>
                  ) : selectedOrder.payment_status === 'Failed' ? (
                    <span style={{ background: '#e74c3c', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                      FAILED ✕
                    </span>
                  ) : (
                    <span style={{ background: '#e67e22', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                      UNPAID / PENDING ⏳
                    </span>
                  )}
                </div>

                <div className="info-grid">
                  <div>
                    <p className="info-label">Payment Gateway</p>
                    <p className="info-val" style={{ fontWeight: 600 }}>Razorpay Secure</p>
                  </div>
                  <div>
                    <p className="info-label">Order Total</p>
                    <p className="info-val" style={{ color: '#d4af37', fontWeight: 700, fontSize: '1.05rem' }}>₹{Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="info-label">Razorpay Order ID</p>
                    <p className="info-val" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {selectedOrder.razorpay_order_id || 'Not initiated'}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">Razorpay Payment ID</p>
                    <p className="info-val" style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: selectedOrder.razorpay_payment_id ? '#2ecc71' : '#888' }}>
                      {selectedOrder.razorpay_payment_id || 'None (Payment not captured)'}
                    </p>
                  </div>
                </div>

                {selectedOrder.payment_status !== 'Paid' ? (
                  <p style={{ marginTop: '14px', marginBottom: 0, fontSize: '0.8rem', color: '#f39c12', background: 'rgba(243, 156, 18, 0.12)', padding: '10px 14px', borderRadius: '4px', lineHeight: 1.5 }}>
                    ⚠️ <strong>Payment Not Received:</strong> Razorpay has not confirmed payment for this order yet. Do not ship items until status shows <strong>PAID ✓</strong>.
                  </p>
                ) : (
                  <p style={{ marginTop: '14px', marginBottom: 0, fontSize: '0.8rem', color: '#2ecc71', background: 'rgba(46, 204, 113, 0.12)', padding: '10px 14px', borderRadius: '4px', lineHeight: 1.5 }}>
                    ✓ <strong>Payment Confirmed:</strong> Transaction was verified and funds have been received via Razorpay. Safe to dispatch.
                  </p>
                )}
              </div>

              {/* Status Update Card */}
              <div className="info-card status-card">
                <label htmlFor="ord-status-sel">Redemption / Delivery Status</label>
                <div className="status-selector-row">
                  <span className={`status-badge big ${selectedOrder.status.toLowerCase()}`}>
                    {selectedOrder.status}
                  </span>
                  <select 
                    id="ord-status-sel"
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="status-dropdown"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="info-card">
                <h3>Customer Information</h3>
                {selectedOrder.customer ? (
                  <div className="info-grid">
                    <div>
                      <p className="info-label">Name</p>
                      <p className="info-val">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <p className="info-label">Email</p>
                      <p className="info-val">{selectedOrder.customer.email}</p>
                    </div>
                    <div>
                      <p className="info-label">Contact Number</p>
                      {selectedOrder.customer.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <a 
                            href={`tel:${selectedOrder.customer.phone}`} 
                            style={{ color: '#d4af37', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            📞 {selectedOrder.customer.phone}
                          </a>
                          <a 
                            href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ 
                              background: '#25D366', 
                              color: '#fff', 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              textDecoration: 'none', 
                              fontWeight: 600 
                            }}
                          >
                            WhatsApp
                          </a>
                        </div>
                      ) : (
                        <p className="info-val" style={{ color: '#777' }}>Not provided</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>Guest Profile</p>
                )}
              </div>

              {/* Shipping Address Card */}
              <div className="info-card">
                <h3>Shipping Details</h3>
                <div className="info-address">
                  <p className="address-line">{selectedOrder.shipping_address.street}</p>
                  <p className="address-line">
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.zip}
                  </p>
                  <p className="address-line">{selectedOrder.shipping_address.country}</p>
                </div>
              </div>

              {/* iCarry Logistics Fulfillment Panel */}
              <div className="info-card shipping-fulfillment-card">
                <h3>iCarry Logistics Fulfillment</h3>
                
                {selectedOrder.shipping_tracking_id ? (
                  /* Shipped View showing tracking timeline and print options */
                  <div className="shipped-status-details">
                    <div className="logistic-row">
                      <p className="info-label">Courier Carrier</p>
                      <p className="info-val"><strong>{selectedOrder.shipping_carrier}</strong></p>
                    </div>
                    <div className="logistic-row" style={{ marginTop: '10px' }}>
                      <p className="info-label">Tracking Number (AWB)</p>
                      <p className="info-val" style={{ fontFamily: 'monospace', color: '#d4af37' }}>
                        {selectedOrder.shipping_tracking_id}
                      </p>
                    </div>
                    {selectedOrder.shipping_cost && (
                      <div className="logistic-row" style={{ marginTop: '10px' }}>
                        <p className="info-label">Actual Shipping Cost</p>
                        <p className="info-val">₹{Number(selectedOrder.shipping_cost).toFixed(2)}</p>
                      </div>
                    )}
                    
                    <div className="fulfillment-actions-row" style={{ marginTop: '15px' }}>
                      <a 
                        href={selectedOrder.shipping_label_url || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="print-label-btn"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        Print Shipping Label
                      </a>
                    </div>
                    
                    {/* Live Tracking Timeline */}
                    <div className="tracking-timeline-box" style={{ marginTop: '20px' }}>
                      <h4>Live Delivery Progress</h4>
                      {trackingLoading ? (
                        <p className="tracking-loading">Updating checkpoints...</p>
                      ) : trackingInfo && trackingInfo.checkpoints && trackingInfo.checkpoints.length > 0 ? (
                        <div className="timeline-list">
                          {trackingInfo.checkpoints.map((cp: any, index: number) => (
                            <div key={index} className="timeline-node">
                              <div className="node-marker" />
                              <div className="node-content">
                                <p className="node-desc">{cp.description}</p>
                                <p className="node-meta">{cp.time} — {cp.location}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="tracking-loading">Package booked. Awaiting tracking logs.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fulfillment Booking Form */
                  <div className="fulfillment-form">
                    <div className="form-row">
                      <div className="form-group half">
                        <label htmlFor="ful-weight">Weight (Grams)</label>
                        <input 
                          id="ful-weight"
                          type="number" 
                          value={weightGrams} 
                          onChange={(e) => setWeightGrams(Number(e.target.value) || 250)}
                          placeholder="250"
                        />
                      </div>
                      <div className="form-group half">
                        <label htmlFor="ful-mode">Shipment Mode</label>
                        <select 
                          id="ful-mode"
                          value={shipmentMode} 
                          onChange={(e) => setShipmentMode(e.target.value as 'E' | 'S')}
                        >
                          <option value="E">Express (Air)</option>
                          <option value="S">Surface (Ground)</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      className="calc-rates-btn" 
                      onClick={fetchRates}
                      disabled={ratesLoading}
                    >
                      {ratesLoading ? 'Calculating Courier Rates...' : 'Calculate Delivery Rates'}
                    </button>
                    
                    {ratesError && <p className="rates-error-msg">{ratesError}</p>}
                    
                    {rates.length > 0 && (
                      <div className="rates-selection-box" style={{ marginTop: '15px' }}>
                        <label>Select Courier Service</label>
                        <div className="rates-list">
                          {rates.map((r, i) => (
                            <label key={i} className={`rate-option-item ${selectedRate?.courier_id === r.courier_id ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="courier_rate" 
                                checked={selectedRate?.courier_id === r.courier_id}
                                onChange={() => setSelectedRate(r)}
                                style={{ display: 'none' }}
                              />
                              <div className="rate-details">
                                <span className="rate-carrier">{r.courier_name}</span>
                                <span className="rate-time">{r.expected_days} ({r.mode})</span>
                              </div>
                              <span className="rate-price">₹{r.shipping_cost.toFixed(2)}</span>
                            </label>
                          ))}
                        </div>
                        
                        {bookingError && <p className="booking-error-msg">{bookingError}</p>}
                        
                        <button 
                          type="button" 
                          className="book-courier-btn" 
                          onClick={bookCourier}
                          disabled={bookingLoading || !selectedRate}
                        >
                          {bookingLoading ? 'Assigning Courier Partner...' : `Book Shipping Partner`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="info-card">
                <h3>Scent Manifest</h3>
                <div className="items-list">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="manifest-item">
                      <div className="manifest-img">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="manifest-details">
                        <h4>{item.name}</h4>
                        <p className="manifest-meta">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <p className="manifest-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Breakdown */}
              <div className="breakdown-box">
                {selectedOrder.discount_code && (
                  <div className="breakdown-row promo">
                    <span>Applied Coupon:</span>
                    <strong>{selectedOrder.discount_code}</strong>
                  </div>
                )}
                <div className="breakdown-row grand-total">
                  <span>Grand Total Paid:</span>
                  <strong>₹{Number(selectedOrder.total).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .admin-btn-primary {
          background: #d4af37;
          color: #000;
          padding: 10px 20px;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
        }

        .admin-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-search-input, .admin-select {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 12px 16px;
          border-radius: 4px;
          font-family: inherit;
        }

        .admin-search-input {
          flex: 1;
        }
        
        .admin-search-input:focus, .admin-select:focus {
          outline: none;
          border-color: #d4af37;
        }

        .admin-loading, .admin-empty {
          padding: 80px 0;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .table-container {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .table-header {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }

        .table-row {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: #151515;
        }

        .col-id { width: 130px; color: #d4af37; font-family: monospace; letter-spacing: 0.5px; }
        .col-customer { flex: 1.5; }
        .cust-name { font-weight: 500; color: #fff; }
        .cust-email { font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); margin-top: 2px; }
        .col-date { width: 140px; color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; }
        .col-items { width: 100px; color: rgba(255, 255, 255, 0.5); font-size: 0.85rem; }
        .col-total { width: 120px; font-family: var(--font-serif); font-size: 1.05rem; color: #fff; }
        .col-status { width: 120px; }
        .col-actions { width: 110px; text-align: right; }

        .status-badge {
          font-size: 0.65rem;
          padding: 4px 10px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.pending { background: rgba(234, 179, 8, 0.15); color: #facc15; }
        .status-badge.processing { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .status-badge.shipped { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        .status-badge.delivered { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
        .status-badge.cancelled { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .status-badge.big {
          font-size: 0.8rem;
          padding: 8px 16px;
        }

        .action-link {
          background: none;
          border: none;
          color: #d4af37;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .action-link:hover {
          color: #fff;
          text-decoration: underline;
        }

        /* Detail Drawer panel Overlay */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          z-index: 10000;
        }

        .drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .drawer-panel {
          position: fixed;
          top: 0;
          right: -460px;
          width: 100%;
          max-width: 460px;
          height: 100%;
          background: #080808;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          z-index: 10001;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 30px;
        }

        .drawer-panel.open {
          transform: translateX(-460px);
        }

        @media (max-width: 460px) {
          .drawer-panel {
            right: -100%;
            max-width: 100%;
          }
          .drawer-panel.open {
            transform: translateX(-100%);
          }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 20px;
          margin-bottom: 25px;
          flex-shrink: 0;
        }

        .drawer-header h2 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #fff;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin: 0;
        }

        .drawer-subhead {
          font-size: 0.75rem;
          color: #d4af37;
          font-family: monospace;
          margin-top: 4px;
        }

        .drawer-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }

        .drawer-close:hover {
          color: #fff;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-right: 5px;
          padding-bottom: 40px;
        }

        .drawer-content::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .drawer-content::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }
        .drawer-content::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.6);
        }

        .info-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          padding: 20px;
        }

        .info-card h3 {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #d4af37;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          padding-bottom: 8px;
        }

        .status-card {
          border-color: rgba(212, 175, 55, 0.15);
          background: rgba(212, 175, 55, 0.02);
        }

        .status-card label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          display: block;
          margin-bottom: 10px;
        }

        .status-selector-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .status-dropdown {
          flex: 1;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.8rem;
        }

        .status-dropdown:focus {
          outline: none;
          border-color: #d4af37;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-label {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 2px;
        }

        .info-val {
          font-size: 0.85rem;
          color: #fff;
        }

        .address-line {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 4px;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .manifest-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }

        .manifest-item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .manifest-img {
          width: 50px;
          height: 60px;
          background: #111;
          border-radius: 2px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .manifest-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .manifest-details {
          flex: 1;
        }

        .manifest-details h4 {
          font-family: var(--font-serif);
          font-size: 0.9rem;
          font-weight: 300;
          color: #fff;
          margin-bottom: 4px;
        }

        .manifest-meta {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .manifest-price {
          font-size: 0.85rem;
          font-weight: 500;
          color: #fff;
        }

        .breakdown-box {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 10px;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .breakdown-row.promo {
          color: #d4af37;
        }

        .breakdown-row.grand-total {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 10px;
          font-size: 0.95rem;
          color: #fff;
        }

        .breakdown-row.grand-total strong {
          color: #d4af37;
          font-family: var(--font-serif);
          font-size: 1.25rem;
        }

        /* iCarry Shipping Fulfillment Styles */
        .shipping-fulfillment-card {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(212, 175, 55, 0.01);
        }
        
        .shipped-status-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .logistic-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          padding-bottom: 8px;
        }
        
        .print-label-btn {
          display: inline-flex;
          align-items: center;
          background: #d4af37;
          color: #000;
          padding: 8px 16px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
          border-radius: 2px;
          transition: opacity 0.2s;
        }

        .print-label-btn:hover {
          opacity: 0.9;
        }
        
        .tracking-timeline-box h4 {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 12px;
        }
        
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-left: 1px solid rgba(212, 175, 55, 0.2);
          padding-left: 16px;
          margin-left: 6px;
        }
        
        .timeline-node {
          position: relative;
        }
        
        .node-marker {
          position: absolute;
          left: -21px;
          top: 4px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #d4af37;
          box-shadow: 0 0 6px #d4af37;
        }
        
        .node-content {
          display: flex;
          flex-direction: column;
        }
        
        .node-desc {
          font-size: 0.8rem;
          color: #fff;
          margin: 0;
          font-weight: 500;
        }
        
        .node-meta {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          margin: 2px 0 0 0;
        }
        
        .tracking-loading {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          margin: 0;
        }

        .fulfillment-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .form-row {
          display: flex;
          gap: 10px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .form-group.half {
          flex: 1;
        }
        
        .form-group label {
          font-size: 0.6rem;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .form-group input, .form-group select {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: inherit;
        }
        
        .calc-rates-btn {
          background: transparent;
          border: 1px solid #d4af37;
          color: #d4af37;
          padding: 10px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
        }
        
        .calc-rates-btn:hover {
          background: #d4af37;
          color: #000;
        }
        
        .rates-error-msg, .booking-error-msg {
          font-size: 0.7rem;
          color: #ef4444;
          margin: 4px 0 0 0;
        }
        
        .rates-selection-box label {
          font-size: 0.6rem;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 8px;
          display: block;
        }
        
        .rates-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .rate-option-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .rate-option-item:hover {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(212, 175, 55, 0.02);
        }
        
        .rate-option-item.selected {
          border-color: #d4af37;
          background: rgba(212, 175, 55, 0.05);
        }
        
        .rate-details {
          display: flex;
          flex-direction: column;
        }
        
        .rate-carrier {
          font-size: 0.8rem;
          color: #fff;
          font-weight: 500;
        }
        
        .rate-time {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 2px;
        }
        
        .rate-price {
          font-size: 0.85rem;
          color: #d4af37;
          font-weight: 600;
        }
        
        .book-courier-btn {
          width: 100%;
          background: #d4af37;
          color: #000;
          border: none;
          padding: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .book-courier-btn:hover {
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
}
