'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface DiscountType {
  code: string;
  type: string;
  value: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();

  // Redirect if cart is empty and checkout is not completed successfully
  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      router.push('/');
    }
  }, [cartItems]);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');

  // Login states
  const [checkoutSubView, setCheckoutSubView] = useState<'shipping' | 'login'>('shipping');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Promo states
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountType | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Checkout and submission states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Guest save account states
  const [savePassword, setSavePassword] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch logged in customer session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.loggedIn) {
            setIsLoggedIn(true);
            setCustomerName(data.name || '');
            setEmail(data.email || '');
            setName(data.name || '');
            setPhone(data.phone || '');
            
            // Pre-fill shipping address from order history if available
            if (data.address) {
              setStreet(data.address.street || '');
              setCity(data.address.city || '');
              setZip(data.address.zip || '');
              if (data.address.country) {
                setCountry(data.address.country);
              }
            }
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }
    checkSession();
  }, []);

  // Handle promo code from URL query parameter or auto-apply available coupon
  useEffect(() => {
    const promoFromUrl = searchParams.get('promo');
    if (promoFromUrl) {
      applyPromoCode(promoFromUrl.toUpperCase());
    } else {
      // Auto-fetch and apply active promotional code
      async function fetchAutoApplyPromo() {
        try {
          const res = await fetch('/api/discounts/auto-apply');
          if (res.ok) {
            const data = await res.json();
            if (data.discount && data.discount.code) {
              setAppliedDiscount(data.discount);
            }
          }
        } catch (err) {
          console.error('Auto apply promo error:', err);
        }
      }
      fetchAutoApplyPromo();
    }
  }, [searchParams]);

  // Apply promo helper
  const applyPromoCode = async (code: string) => {
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`/api/discounts/${code}`);
      const data = await res.json();
      if (res.ok) {
        setAppliedDiscount(data);
        setPromoCode('');
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (err) {
      console.error('Promo check failed:', err);
      setPromoError('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleApplyPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    applyPromoCode(cleanCode);
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoError('');
  };

  // Calculations
  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'Percentage') {
      return cartTotal * (appliedDiscount.value / 100);
    }
    if (appliedDiscount.type === 'Fixed Amount') {
      return Math.min(cartTotal, appliedDiscount.value);
    }
    return 0;
  };

  const discountAmount = getDiscountAmount();
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setIsLoggedIn(true);
        setCustomerName(data.customer.name || '');
        setEmail(data.customer.email || '');
        setName(data.customer.name || '');
        setPhone(data.customer.phone || '');
        
        // Fetch fresh address history if exists
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.address) {
            setStreet(meData.address.street || '');
            setCity(meData.address.city || '');
            setZip(meData.address.zip || '');
            if (meData.address.country) {
              setCountry(meData.address.country);
            }
          }
        }

        setCheckoutSubView('shipping');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setLoginError('An unexpected server error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setIsLoggedIn(false);
        setCustomerName('');
        setEmail('');
        setName('');
        setPhone('');
        setStreet('');
        setCity('');
        setZip('');
        setCountry('India');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Trigger Checkout / Razorpay Integration
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      // 1. Prepare items payload matching order service schema
      const itemsPayload = cartItems.map((item) => ({
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // 2. Call local backend endpoint to establish pending MySQL order and Razorpay order payload
      const orderPayload = {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          zip: zip.trim(),
          country: country.trim()
        },
        items: itemsPayload,
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        total: finalTotal
      };

      // If Cash on Delivery is selected, place order directly without opening Razorpay
      if (paymentMethod === 'cod') {
        const res = await fetch('/api/checkout/cod-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        const orderData = await res.json();
        if (!res.ok) {
          throw new Error(orderData.error || 'Failed to place Cash on Delivery order.');
        }

        setCreatedOrderId(orderData.order_id);
        setSuccess(true);
        clearCart();
        setCheckoutLoading(false);
        return;
      }

      // Online Payment via Razorpay
      const res = await fetch('/api/checkout/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize order details with server.');
      }

      // 3. Configure and trigger Razorpay modal
      const razorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ETERNYX',
        description: 'Luxury Fragrance Purchase',
        image: '/images/logo-icon.png', // Optional fallback placeholder
        order_id: orderData.order_id,
        prefill: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          contact: phone.trim()
        },
        theme: {
          color: '#d4af37' // Luxury gold theme color
        },
        handler: async function (paymentResponse: any) {
          try {
            setCheckoutLoading(true);
            const verifyPayload = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              local_order_id: orderData.local_order_id
            };

            const verifyRes = await fetch('/api/checkout/razorpay-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyPayload)
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setCreatedOrderId(orderData.local_order_id);
              setSuccess(true);
              clearCart();
            } else {
              setCheckoutError(verifyData.error || 'Payment validation failed.');
            }
          } catch (err) {
            console.error('Payment verification request failed:', err);
            setCheckoutError('Unable to verify transaction. Please contact customer support.');
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
            setCheckoutError('Payment window closed by user.');
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(razorpayOptions);
      rzpInstance.open();

    } catch (err: any) {
      console.error('Razorpay initialization failure:', err);
      setCheckoutError(err.message || 'An unexpected error occurred during payment processing.');
      setCheckoutLoading(false);
    }
  };

  // Convert guest to account password
  const handleSaveAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savePassword) return;

    setSaveLoading(true);
    setSaveError('');
    try {
      const res = await fetch('/api/auth/register-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: savePassword,
          name: name.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setIsLoggedIn(true);
        setCustomerName(name.trim());
      } else {
        setSaveError(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register password failed:', err);
      setSaveError('An unexpected server error occurred.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success-view">
        <div className="success-card">
          <div className="success-icon-container">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Scent Confirmed</h2>
          <p className="success-sub">Your fragrance order has been accepted and is processing.</p>

          <div className="receipt-box">
            <div className="receipt-line">
              <span className="label">Order Reference</span>
              <span className="value">{createdOrderId}</span>
            </div>
            <div className="receipt-line">
              <span className="label">Payment Mode</span>
              <span className="value" style={{ color: paymentMethod === 'cod' ? '#d4af37' : '#81c784', fontWeight: 600 }}>
                {paymentMethod === 'cod' ? `Cash on Delivery (₹${finalTotal.toLocaleString()} to pay)` : 'Prepaid (Paid via Razorpay)'}
              </span>
            </div>
            <div className="receipt-line">
              <span className="label">Est. Delivery</span>
              <span className="value">2 - 4 Business Days</span>
            </div>
            <div className="receipt-line">
              <span className="label">Shipping Status</span>
              <span className="value tracking">Awaiting Courier Dispatch</span>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="save-account-box">
              <h3>Secure Your ETERNYX Account</h3>
              <p>Create a password to associate with your guest email so you can track orders and save details for future scents.</p>
              
              {saveSuccess ? (
                <div className="save-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Profile saved successfully. Welcome to ETERNYX.</span>
                </div>
              ) : (
                <form onSubmit={handleSaveAccountSubmit} className="save-account-form">
                  {saveError && <p className="error-msg">{saveError}</p>}
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={savePassword}
                      onChange={(e) => setSavePassword(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={saveLoading || !savePassword}>
                      {saveLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <Link
              href={`/order/${encodeURIComponent(createdOrderId)}`}
              style={{
                display: 'block',
                background: '#d4af37',
                color: '#000',
                padding: '12px 24px',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '2px',
                transition: 'opacity 0.2s',
              }}
            >
              View Order Details & Live Tracking →
            </Link>
            <button className="back-store-btn" onClick={() => router.push('/')}>
              Continue Browsing
            </button>
          </div>
        </div>

        <style jsx>{`
          .checkout-success-view {
            min-height: 100vh;
            background: #0a0a0a;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 120px 24px 80px 24px;
          }
          .success-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            max-width: 460px;
            width: 100%;
            padding: 40px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);
          }
          .success-icon-container {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.05);
            border: 1px solid rgba(212, 175, 55, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          }
          h2 {
            font-family: var(--font-serif);
            font-weight: 300;
            font-size: 1.8rem;
            letter-spacing: 0.15em;
            margin-bottom: 12px;
            color: #fff;
          }
          .success-sub {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 30px;
            font-style: italic;
          }
          .receipt-box {
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: left;
          }
          .receipt-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          }
          .receipt-line:last-child {
            border-bottom: none;
          }
          .receipt-line .label {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(255, 255, 255, 0.4);
          }
          .receipt-line .value {
            font-size: 0.85rem;
            font-family: monospace;
            color: #fff;
          }
          .receipt-line .value.tracking {
            color: #d4af37;
            font-family: var(--font-sans);
            font-size: 0.75rem;
          }
          .save-account-box {
            background: rgba(212, 175, 55, 0.02);
            border: 1px solid rgba(212, 175, 55, 0.15);
            border-radius: 4px;
            padding: 20px;
            text-align: left;
            margin-bottom: 30px;
          }
          .save-account-box h3 {
            font-size: 0.85rem;
            letter-spacing: 0.05em;
            color: #fff;
            margin-bottom: 8px;
            text-transform: none;
            font-family: var(--font-sans);
          }
          .save-account-box p {
            font-size: 0.72rem;
            color: rgba(255, 255, 255, 0.55);
            line-height: 1.4;
            margin-bottom: 15px;
          }
          .input-group {
            display: flex;
            gap: 10px;
          }
          .input-group input {
            flex: 1;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 10px 14px;
            font-size: 0.8rem;
            border-radius: 2px;
          }
          .input-group input:focus {
            outline: none;
            border-color: #d4af37;
          }
          .input-group button {
            background: #d4af37;
            color: #000;
            border: none;
            padding: 0 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            border-radius: 2px;
            transition: opacity 0.2s;
          }
          .input-group button:hover {
            opacity: 0.9;
          }
          .save-success {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.75rem;
            color: #d4af37;
            padding: 8px 0;
          }
          .error-msg {
            font-size: 0.75rem;
            color: #ef4444;
            margin-bottom: 10px;
          }
          .back-store-btn {
            background: transparent;
            border: 1px solid #d4af37;
            color: #d4af37;
            width: 100%;
            padding: 14px;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 2px;
          }
          .back-store-btn:hover {
            background: #d4af37;
            color: #000;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => router.push('/')}>
          &larr; Return to Perfumery
        </button>
        <h1>Secure Checkout</h1>
        <div className="checkout-progress">
          <span className="progress-step completed">01 Bag</span>
          <span className="progress-separator">&rarr;</span>
          <span className="progress-step active">02 Checkout</span>
          <span className="progress-separator">&rarr;</span>
          <span className="progress-step">03 Confirmation</span>
        </div>
      </div>

      <div className="checkout-grid">
        {/* Left Column - Forms */}
        <div className="forms-column">
          {checkoutSubView === 'login' ? (
            <div className="auth-card">
              <div className="auth-card-header">
                <h2>Account Login</h2>
                <button className="text-link-btn" onClick={() => setCheckoutSubView('shipping')}>
                  Checkout as Guest
                </button>
              </div>
              <p className="subtext">Log in to automatically populate your shipping details and order address.</p>
              {loginError && <p className="error-banner">{loginError}</p>}
              
              <form onSubmit={handleLoginSubmit} className="checkout-form">
                <div className="field-group">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                
                <div className="field-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <button type="submit" className="action-btn" disabled={loginLoading}>
                  {loginLoading ? 'Authenticating...' : 'Sign In & Continue'}
                </button>
              </form>
            </div>
          ) : (
            <div className="shipping-card">
              <div className="shipping-card-header">
                <h2>Shipping & Contact Details</h2>
                {isLoggedIn ? (
                  <div className="auth-status">
                    <span>Active Profile: <strong>{customerName}</strong></span>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                  </div>
                ) : (
                  <button className="text-link-btn" onClick={() => setCheckoutSubView('login')}>
                    Sign In for Saved Details
                  </button>
                )}
              </div>

              {checkoutError && <p className="error-banner">{checkoutError}</p>}

              <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                <div className="field-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={isLoggedIn}
                  />
                </div>

                <div className="row-group">
                  <div className="field-group half">
                    <label htmlFor="name">Recipient Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Emma Watson"
                      required
                    />
                  </div>

                  <div className="field-group half">
                    <label htmlFor="phone">Contact Number</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Apt 4B, 123 Luxury Avenue"
                    required
                  />
                </div>

                <div className="row-group">
                  <div className="field-group half">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      required
                    />
                  </div>

                  <div className="field-group half">
                    <label htmlFor="zip">ZIP / Postal Code</label>
                    <input
                      id="zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    required
                  />
                </div>

                {/* Payment Method Selector */}
                <div style={{ margin: '28px 0 20px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '10px', fontWeight: 600 }}>
                    Select Payment Method
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Option 1: Razorpay / Online */}
                    <div 
                      onClick={() => setPaymentMethod('razorpay')}
                      style={{
                        border: paymentMethod === 'razorpay' ? '1px solid #d4af37' : '1px solid #282828',
                        background: paymentMethod === 'razorpay' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        padding: '14px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          checked={paymentMethod === 'razorpay'} 
                          onChange={() => setPaymentMethod('razorpay')}
                          style={{ accentColor: '#d4af37', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Online Payment</span>
                      </div>
                      <p style={{ margin: '4px 0 0 22px', fontSize: '0.72rem', color: '#888', lineHeight: 1.4 }}>
                        UPI, Cards, NetBanking
                      </p>
                      <span style={{ display: 'inline-block', margin: '6px 0 0 22px', fontSize: '0.62rem', background: 'rgba(76, 175, 80, 0.15)', color: '#81c784', padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.05em', fontWeight: 600 }}>
                        INSTANT DISPATCH
                      </span>
                    </div>

                    {/* Option 2: Cash on Delivery */}
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      style={{
                        border: paymentMethod === 'cod' ? '1px solid #d4af37' : '1px solid #282828',
                        background: paymentMethod === 'cod' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        padding: '14px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')}
                          style={{ accentColor: '#d4af37', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Cash on Delivery</span>
                      </div>
                      <p style={{ margin: '4px 0 0 22px', fontSize: '0.72rem', color: '#888', lineHeight: 1.4 }}>
                        Pay cash or UPI upon delivery
                      </p>
                      <span style={{ display: 'inline-block', margin: '6px 0 0 22px', fontSize: '0.62rem', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.05em', fontWeight: 600 }}>
                        PAY AT DOORSTEP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="gateway-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span>
                    {paymentMethod === 'cod' 
                      ? 'Cash on Delivery • Verified Contact & Address Required' 
                      : 'Secured via Razorpay Payment Gateway'}
                  </span>
                </div>

                <button type="submit" className="action-btn checkout-pay" disabled={checkoutLoading || cartItems.length === 0}>
                  {checkoutLoading 
                    ? (paymentMethod === 'cod' ? 'Placing Order...' : 'Preparing Gateway...') 
                    : (paymentMethod === 'cod' 
                        ? `Place Cash on Delivery Order — ₹${finalTotal.toLocaleString()}` 
                        : `Proceed to Payment — ₹${finalTotal.toLocaleString()}`
                      )
                  }
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="summary-column">
          <div className="summary-card">
            <h2>Your Order</h2>
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="item-thumbnail">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="product-card-placeholder" style={{ minHeight: '100%', padding: '6px' }}>
                        <span className="placeholder-brand" style={{ fontSize: '0.65rem' }}>ETX</span>
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <div className="item-header-row">
                      <h3>{item.name}</h3>
                      <button
                        type="button"
                        className="item-remove-btn"
                        onClick={() => removeFromCart(item.name, item.size)}
                        aria-label="Remove item"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <p className="item-meta">{item.category} • {item.size}</p>
                    <div className="item-controls-row">
                      <div className="qty-selector">
                        <button 
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.name, item.size, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.name, item.size, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleApplyPromoSubmit} className="promo-box">
              <input
                type="text"
                placeholder="DISCOUNT COUPON"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoLoading || !!appliedDiscount}
              />
              {appliedDiscount ? (
                <button type="button" onClick={handleRemovePromo} className="promo-btn remove">
                  Remove
                </button>
              ) : (
                <button type="submit" className="promo-btn" disabled={promoLoading || !promoCode.trim()}>
                  {promoLoading ? '...' : 'Apply'}
                </button>
              )}
            </form>

            {promoError && <p className="promo-error">{promoError}</p>}
            {appliedDiscount && (
              <p className="promo-success">
                Coupon <strong>{appliedDiscount.code}</strong> applied ({
                  appliedDiscount.type === 'Percentage' 
                    ? `${appliedDiscount.value}% discount` 
                    : `₹${appliedDiscount.value} discount`
                })
              </p>
            )}

            <div className="price-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {appliedDiscount && (
                <div className="breakdown-row discount">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Shipping</span>
                <span className="shipping-text">Free (Silence Service)</span>
              </div>
              <div className="breakdown-row total">
                <span>Total Amount Due</span>
                <span className="total-price">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-container {
          min-height: 100vh;
          max-width: 1100px;
          margin: 0 auto;
          padding: 115px 24px 60px 24px;
          background: #0a0a0a;
          color: #fff;
        }
        .checkout-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 20px;
        }
        .back-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }
        .back-btn:hover {
          color: #d4af37;
        }
        h1 {
          font-family: var(--font-serif);
          font-weight: 300;
          font-size: 1.8rem;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .checkout-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .progress-step {
          color: rgba(255, 255, 255, 0.3);
        }
        .progress-step.completed {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: line-through;
        }
        .progress-step.active {
          color: #d4af37;
          font-weight: 600;
        }
        .progress-separator {
          color: rgba(255, 255, 255, 0.15);
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 32px;
          align-items: start;
        }
        .forms-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .auth-card, .shipping-card, .summary-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 6px;
          backdrop-filter: blur(16px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .auth-card-header, .shipping-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        h2 {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #fff;
          margin: 0;
        }
        .text-link-btn {
          background: none;
          border: none;
          color: #d4af37;
          font-size: 0.68rem;
          text-decoration: underline;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }
        .text-link-btn:hover {
          color: #fff;
        }
        .subtext {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: -10px;
          margin-bottom: 18px;
          line-height: 1.4;
        }
        .auth-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(212, 175, 55, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.15);
          padding: 4px 10px;
          border-radius: 20px;
        }
        .logout-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          text-decoration: underline;
          font-family: inherit;
          padding: 0;
          margin-left: 6px;
        }
        .logout-btn:hover {
          color: #f87171;
        }
        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 10px 14px;
          font-size: 0.75rem;
          border-radius: 2px;
          margin-bottom: 16px;
        }
        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-group label {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 500;
        }
        .field-group input {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          padding: 10px 12px;
          font-size: 0.8rem;
          border-radius: 2px;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .field-group input:focus {
          outline: none;
          border-color: #d4af37;
          background: rgba(255, 255, 255, 0.02);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.1);
        }
        .field-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.02);
        }
        .row-group {
          display: flex;
          gap: 16px;
        }
        .field-group.half {
          flex: 1;
        }
        .gateway-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(212, 175, 55, 0.03);
          border: 1px solid rgba(212, 175, 55, 0.1);
          padding: 12px;
          border-radius: 2px;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 5px;
        }
        .action-btn {
          background: #d4af37;
          color: #000;
          border: none;
          padding: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 2px;
          text-align: center;
          width: 100%;
        }
        .action-btn:hover:not(:disabled) {
          background: #f3d060;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
          transform: translateY(-1px);
        }
        .action-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-btn.checkout-pay {
          margin-top: 5px;
        }

        /* Right Column - Summary Styling */
        .summary-column {
          position: sticky;
          top: 115px;
        }
        .summary-card h2 {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 12px;
          margin-bottom: 18px;
        }
        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
          max-height: 340px;
          overflow-y: auto;
          padding-right: 5px;
        }
        .summary-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .summary-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .item-thumbnail {
          width: 45px;
          height: 55px;
          border-radius: 2px;
          background: #111;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .item-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .item-info h3 {
          font-size: 0.8rem;
          font-family: var(--font-sans);
          font-weight: 500;
          letter-spacing: 0.02em;
          margin: 0;
          color: #fff;
          text-transform: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        .item-meta {
          font-size: 0.62rem;
          color: rgba(255, 255, 255, 0.45);
          margin: 2px 0 6px 0;
        }
        .item-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 2px;
          height: 22px;
          width: fit-content;
        }
        .qty-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          width: 20px;
          height: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .qty-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .qty-value {
          font-size: 0.7rem;
          color: #fff;
          padding: 0 6px;
          min-width: 12px;
          text-align: center;
        }
        .item-price {
          font-size: 0.8rem;
          font-family: var(--font-serif);
          color: #fff;
          font-weight: 300;
        }
        .item-remove-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          padding: 2px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-remove-btn:hover {
          color: #ef4444;
          transform: scale(1.05);
        }
        .promo-box {
          display: flex;
          gap: 8px;
          margin-top: 15px;
          margin-bottom: 8px;
        }
        .promo-box input {
          flex: 1;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
          padding: 8px 10px;
          font-size: 0.72rem;
          border-radius: 2px;
          text-transform: uppercase;
        }
        .promo-box input:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.3);
        }
        .promo-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px 12px;
          font-size: 0.68rem;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
        }
        .promo-btn:hover:not(:disabled) {
          background: #fff;
          color: #000;
          border-color: #fff;
        }
        .promo-btn.remove {
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }
        .promo-btn.remove:hover {
          background: rgba(239, 68, 68, 0.05);
        }
        .promo-error {
          font-size: 0.68rem;
          color: #ef4444;
          margin-bottom: 10px;
        }
        .promo-success {
          font-size: 0.68rem;
          color: #d4af37;
          margin-bottom: 10px;
          letter-spacing: 0.05em;
        }
        .price-breakdown {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .breakdown-row.discount {
          color: #d4af37;
        }
        .breakdown-row .shipping-text {
          color: rgba(255, 255, 255, 0.85);
          font-style: italic;
        }
        .breakdown-row.total {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 12px;
          margin-top: 4px;
          font-size: 0.82rem;
          color: #fff;
          font-weight: 500;
        }
        .total-price {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: #d4af37;
          font-weight: 300;
        }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .summary-column {
            position: static;
          }
          .checkout-container {
            padding-top: 105px;
          }
        }
        @media (max-width: 600px) {
          .row-group {
            flex-direction: column;
            gap: 15px;
          }
          h1 {
            font-size: 1.5rem;
          }
          .auth-card, .shipping-card, .summary-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading secure checkout...</p>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
            color: #fff;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-top: 2px solid #d4af37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
