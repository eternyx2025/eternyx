'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function CustomerAccountPage() {
  const { customer, isLoggedIn, isLoading, openAuthModal, logout, refreshCustomer } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'security'>('orders');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Profile edit state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassSuccess('Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
        await refreshCustomer();
      } else {
        setPassError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPassError('Failed to communicate with server.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setProfileMsg('Profile updated successfully.');
        setIsEditingProfile(false);
        await refreshCustomer();
      } else {
        setProfileMsg('Failed to update profile.');
      }
    } catch (err) {
      setProfileMsg('Network error.');
    } finally {
      setProfileLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="account-loading-view">
        <div className="loading-spinner" />
        <p>Accessing Eternyx Client Suite...</p>
        <style jsx>{`
          .account-loading-view {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #080808;
            color: #d4af37;
            gap: 16px;
            font-size: 0.85rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }
          .loading-spinner {
            width: 36px;
            height: 36px;
            border: 2px solid rgba(212, 175, 55, 0.2);
            border-top-color: #d4af37;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not Logged In View
  if (!isLoggedIn || !customer) {
    return (
      <div className="account-guest-view">
        <div className="guest-card">
          <span className="guest-seal">CLIENT PRIVILEGE</span>
          <h1>Eternyx Concierge Suite</h1>
          <p>
            Please authenticate your account to view your past fragrance acquisitions, real-time courier checkpoints, and bespoke preferences.
          </p>
          <div className="guest-actions">
            <button onClick={() => openAuthModal('login')} className="btn-gold-account">
              Sign In to Your Account
            </button>
            <button onClick={() => openAuthModal('otp')} className="btn-ghost-account">
              Sign In with Email OTP
            </button>
          </div>
          <p className="guest-note">
            First time ordering? Add any fragrance to your cart to begin with guest checkout.
          </p>
        </div>

        <style jsx>{`
          .account-guest-view {
            min-height: 85vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #080808;
            padding: 120px 24px 80px 24px;
            color: #fff;
          }
          .guest-card {
            background: #0d0d0d;
            border: 1px solid rgba(212, 175, 55, 0.3);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.1);
            padding: 50px 40px;
            text-align: center;
            max-width: 520px;
            width: 100%;
            border-radius: 4px;
          }
          .guest-seal {
            font-size: 0.7rem;
            letter-spacing: 0.25em;
            color: #d4af37;
            display: block;
            margin-bottom: 12px;
          }
          .guest-card h1 {
            font-family: Georgia, serif;
            font-size: 1.9rem;
            font-weight: 300;
            margin: 0 0 14px 0;
            color: #fff;
          }
          .guest-card p {
            color: #888;
            font-size: 0.88rem;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .guest-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
          }
          .btn-gold-account {
            background: linear-gradient(135deg, #d4af37 0%, #aa8528 100%);
            color: #000;
            border: none;
            padding: 14px 24px;
            font-size: 0.82rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            cursor: pointer;
            border-radius: 3px;
            transition: all 0.2s;
          }
          .btn-gold-account:hover {
            box-shadow: 0 0 16px rgba(212, 175, 55, 0.5);
          }
          .btn-ghost-account {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(212, 175, 55, 0.4);
            color: #d4af37;
            padding: 13px 24px;
            font-size: 0.8rem;
            font-weight: 500;
            letter-spacing: 0.08em;
            cursor: pointer;
            border-radius: 3px;
            transition: all 0.2s;
          }
          .btn-ghost-account:hover {
            background: rgba(212, 175, 55, 0.1);
          }
          .guest-note {
            font-size: 0.74rem !important;
            color: #666 !important;
            margin: 0 !important;
          }
        `}</style>
      </div>
    );
  }

  const orders = customer.orders || [];

  return (
    <div className="account-page">
      <div className="account-container">
        
        {/* Header Suite Banner */}
        <div className="account-header">
          <div className="header-left">
            <span className="client-badge">CLIENT CONCIERGE SUITE</span>
            <h1 className="client-name">Welcome, {customer.name}</h1>
            <p className="client-contact">
              {customer.email} {customer.phone ? `• ${customer.phone}` : ''}
            </p>
          </div>

          <div className="header-right">
            <div className="stat-pill">
              <span className="stat-num">{orders.length}</span>
              <span className="stat-lbl">{orders.length === 1 ? 'Acquisition' : 'Acquisitions'}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">₹{Number(customer.spent || 0).toLocaleString('en-IN')}</span>
              <span className="stat-lbl">Lifetime Spend</span>
            </div>
            <button onClick={logout} className="btn-signout">
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="account-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span>Orders &amp; Shipments</span>
            <span className="tab-count">{orders.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            <span>Delivery Address</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* ================= TAB 1: ORDERS & SHIPMENTS ================= */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            {orders.length === 0 ? (
              <div className="empty-orders-card">
                <div className="empty-icon">✦</div>
                <h3>No Orders Recorded</h3>
                <p>You have not placed any orders yet. Discover our private blends in the boutique.</p>
                <Link href="/shop" className="btn-explore">
                  Explore The Collection →
                </Link>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order: any) => {
                  const status = (order.status || 'Processing').toLowerCase();
                  const dateStr = order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently');
                  return (
                    <div key={order.id} className="order-card">
                      {/* Order Card Top Bar */}
                      <div className="order-card-header">
                        <div className="order-id-group">
                          <span className="order-ref">Order Reference</span>
                          <span className="order-id">#{order.id}</span>
                          <span className="order-date">Placed on {dateStr}</span>
                        </div>
                        <div className="order-badges-group">
                          <span className={`status-pill ${status}`}>
                            {order.status || 'Processing'}
                          </span>
                          <span className="payment-pill">
                            {order.payment_status === 'Paid' ? 'Paid via Razorpay' : (order.payment_status || 'Prepaid')}
                          </span>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="order-items-list">
                        {order.items && order.items.map((item: any, i: number) => (
                          <div key={i} className="order-item-row">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="order-item-img" />
                            ) : (
                              <div className="order-item-img placeholder">✦</div>
                            )}
                            <div className="order-item-meta">
                              <h4>{item.name}</h4>
                              <span className="order-item-size">{item.size || 'Standard Volume'}</span>
                              <span className="order-item-qty">Qty: {item.quantity} &times; ₹{Number(item.price).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="order-item-subtotal">
                              ₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Card Bottom Footer */}
                      <div className="order-card-footer">
                        <div className="total-group">
                          <span className="total-lbl">Total Acquisition</span>
                          <span className="total-val">₹{Number(order.total).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="actions-group">
                          <Link href={`/order/${encodeURIComponent(order.id)}`} className="btn-track-order">
                            <span className="btn-icon">📦</span>
                            <span>Track Live Courier Shipment →</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: DELIVERY ADDRESS ================= */}
        {activeTab === 'address' && (
          <div className="address-section">
            <div className="address-card">
              <h3>Primary Shipping Address</h3>
              <p className="card-sub">
                This address was saved from your previous order and will automatically pre-fill your next checkout.
              </p>

              {customer.address ? (
                <div className="address-box">
                  <p className="address-recipient"><strong>{customer.name}</strong></p>
                  <p className="address-line">{customer.address.street}</p>
                  <p className="address-line">{customer.address.city}, {customer.address.zip}</p>
                  <p className="address-line">{customer.address.country || 'India'}</p>
                  {customer.phone && <p className="address-phone">Phone: {customer.phone}</p>}
                </div>
              ) : (
                <div className="no-address-box">
                  <p>No address on file yet. Your shipping details will be securely saved when you place your first order.</p>
                </div>
              )}

              <div className="address-note">
                ✦ To change your delivery address for a new order, simply enter the new address during checkout—it will automatically update your preferences.
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SECURITY & PASSWORD ================= */}
        {activeTab === 'security' && (
          <div className="security-section">
            <div className="security-grid">
              {/* Password Setting Card */}
              <div className="security-card">
                <h3>{customer.hasPassword ? 'Change Account Password' : 'Create an Account Password'}</h3>
                <p className="card-sub">
                  {customer.hasPassword
                    ? 'Enter a new password below to update your login credentials.'
                    : 'You currently authenticate using Email OTP. Create a permanent password for instant login.'}
                </p>

                {passError && <div className="alert-msg error">{passError}</div>}
                {passSuccess && <div className="alert-msg success">{passSuccess}</div>}

                <form onSubmit={handleUpdatePassword} className="security-form">
                  <div className="form-item">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-item">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="btn-save-security" disabled={passLoading}>
                    {passLoading ? 'Saving...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Personal Details Card */}
              <div className="security-card">
                <div className="card-header-row">
                  <h3>Client Contact Details</h3>
                  {!isEditingProfile && (
                    <button
                      className="btn-edit-toggle"
                      onClick={() => {
                        setName(customer.name);
                        setPhone(customer.phone || '');
                        setIsEditingProfile(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {profileMsg && <div className="alert-msg info">{profileMsg}</div>}

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="security-form">
                    <div className="form-item">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-item">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-actions-row">
                      <button type="submit" className="btn-save-security" disabled={profileLoading}>
                        {profileLoading ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-details-view">
                    <div className="detail-row">
                      <span className="lbl">Client Name</span>
                      <span className="val">{customer.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="lbl">Registered Email</span>
                      <span className="val">{customer.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="lbl">Phone Number</span>
                      <span className="val">{customer.phone || 'Not registered'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="lbl">Authentication Mode</span>
                      <span className="val gold">{customer.hasPassword ? 'Password + Email OTP' : 'Email OTP Active'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        .account-page {
          min-height: 100vh;
          background: #080808;
          color: #e5e5e5;
          padding: 120px 24px 80px 24px;
        }
        .account-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 24px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 32px;
        }
        .client-badge {
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          color: #d4af37;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .client-name {
          font-family: Georgia, serif;
          font-size: 2.2rem;
          font-weight: 300;
          color: #fff;
          margin: 0 0 6px 0;
        }
        .client-contact {
          font-size: 0.85rem;
          color: #888;
          margin: 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .stat-pill {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(212, 175, 55, 0.25);
          padding: 8px 16px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-num {
          font-size: 1.1rem;
          font-weight: 600;
          color: #d4af37;
        }
        .stat-lbl {
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: #888;
          text-transform: uppercase;
        }
        .btn-signout {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #aaa;
          padding: 10px 18px;
          border-radius: 3px;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-signout:hover {
          color: #fc8181;
          border-color: rgba(229, 62, 62, 0.4);
        }
        .account-nav-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 32px;
          overflow-x: auto;
        }
        .tab-btn {
          background: transparent;
          border: none;
          padding: 14px 18px;
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #777;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-btn.active {
          color: #d4af37;
          font-weight: 500;
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #d4af37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
        }
        .tab-count {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .orders-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .order-card {
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .order-card:hover {
          border-color: rgba(212, 175, 55, 0.35);
        }
        .order-card-header {
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .order-id-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .order-ref {
          font-size: 0.72rem;
          color: #777;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .order-id {
          font-family: monospace;
          font-weight: 600;
          color: #d4af37;
          font-size: 0.95rem;
        }
        .order-date {
          font-size: 0.8rem;
          color: #888;
        }
        .order-badges-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .status-pill {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .status-pill.delivered {
          background: rgba(72, 187, 120, 0.15);
          color: #68d391;
          border-color: rgba(72, 187, 120, 0.35);
        }
        .payment-pill {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.72rem;
          color: #999;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .order-items-list {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-item-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .order-item-img {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 3px;
          background: #141414;
        }
        .order-item-img.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d4af37;
          font-size: 0.9rem;
        }
        .order-item-meta {
          flex: 1;
        }
        .order-item-meta h4 {
          margin: 0 0 3px 0;
          font-size: 0.92rem;
          font-weight: 400;
          color: #fff;
        }
        .order-item-size {
          font-size: 0.75rem;
          color: #888;
          display: block;
        }
        .order-item-qty {
          font-size: 0.78rem;
          color: #aaa;
        }
        .order-item-subtotal {
          font-size: 0.92rem;
          font-weight: 500;
          color: #d4af37;
        }
        .order-card-footer {
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.015);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .total-group {
          display: flex;
          flex-direction: column;
        }
        .total-lbl {
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
        }
        .total-val {
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
        }
        .btn-track-order {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          padding: 10px 18px;
          border-radius: 3px;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-track-order:hover {
          background: #d4af37;
          color: #000;
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.4);
        }
        .empty-orders-card {
          padding: 60px 24px;
          text-align: center;
          background: #0d0d0d;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .empty-icon {
          font-size: 2rem;
          color: #d4af37;
          margin-bottom: 12px;
        }
        .empty-orders-card h3 {
          font-family: Georgia, serif;
          font-size: 1.4rem;
          font-weight: 300;
          margin: 0 0 8px 0;
          color: #fff;
        }
        .empty-orders-card p {
          color: #888;
          font-size: 0.88rem;
          max-width: 400px;
          margin: 0 auto 24px auto;
        }
        .btn-explore {
          display: inline-block;
          background: #d4af37;
          color: #000;
          padding: 12px 24px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 2px;
        }
        .address-card, .security-card {
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 32px;
        }
        .address-card h3, .security-card h3 {
          font-family: Georgia, serif;
          font-size: 1.3rem;
          font-weight: 300;
          color: #fff;
          margin: 0 0 6px 0;
        }
        .card-sub {
          font-size: 0.84rem;
          color: #888;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }
        .address-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .address-recipient {
          color: #fff;
          font-size: 0.92rem;
          margin: 0 0 6px 0;
        }
        .address-line {
          color: #aaa;
          font-size: 0.86rem;
          margin: 0 0 4px 0;
        }
        .address-phone {
          color: #d4af37;
          font-size: 0.82rem;
          margin: 12px 0 0 0;
        }
        .no-address-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          padding: 24px;
          border-radius: 4px;
          color: #777;
          font-size: 0.86rem;
          margin-bottom: 20px;
        }
        .address-note {
          font-size: 0.78rem;
          color: #777;
          line-height: 1.5;
        }
        .security-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        @media (max-width: 820px) {
          .security-grid {
            grid-template-columns: 1fr;
          }
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .btn-edit-toggle {
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          padding: 4px 12px;
          border-radius: 3px;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .security-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-item label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #888;
        }
        .form-item input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 3px;
          padding: 11px 14px;
          color: #fff;
          font-size: 0.88rem;
          outline: none;
        }
        .form-item input:focus {
          border-color: #d4af37;
        }
        .btn-save-security {
          background: #d4af37;
          color: #000;
          border: none;
          padding: 12px 20px;
          border-radius: 3px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 6px;
        }
        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #888;
          padding: 12px 20px;
          border-radius: 3px;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .form-actions-row {
          display: flex;
          gap: 12px;
          margin-top: 6px;
        }
        .alert-msg {
          padding: 10px 14px;
          border-radius: 3px;
          font-size: 0.8rem;
          margin-bottom: 16px;
        }
        .alert-msg.error {
          background: rgba(229, 62, 62, 0.12);
          border: 1px solid rgba(229, 62, 62, 0.35);
          color: #fc8181;
        }
        .alert-msg.success {
          background: rgba(72, 187, 120, 0.12);
          border: 1px solid rgba(72, 187, 120, 0.35);
          color: #68d391;
        }
        .alert-msg.info {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
        }
        .profile-details-view {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
        }
        .detail-row .lbl {
          color: #777;
        }
        .detail-row .val {
          color: #fff;
          font-weight: 500;
        }
        .detail-row .val.gold {
          color: #d4af37;
        }
      `}</style>
    </div>
  );
}
