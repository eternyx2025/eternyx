'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart
  } = useCart();

  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Prevent SSR/hydration Styled-JSX mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Promo states
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; type: string; value: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [isPromoExpanded, setIsPromoExpanded] = useState(false);

  // Toggle scroll locks whenever cart drawer is opened
  useEffect(() => {
    const lenis = (window as any).lenis;
    if (isCartOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      const isProductModalOpen = document.querySelector('.pm-overlay');
      if (!isProductModalOpen) {
        lenis?.start();
        document.body.style.overflow = '';
      }
    }
    return () => {
      const isProductModalOpen = document.querySelector('.pm-overlay');
      if (!isProductModalOpen) {
        lenis?.start();
        document.body.style.overflow = '';
      }
    };
  }, [isCartOpen]);

  // Reset promo when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0) {
      setAppliedDiscount(null);
      setPromoCode('');
      setPromoError('');
    }
  }, [cartItems]);

  // Auto-apply active promotional code when drawer opens
  useEffect(() => {
    if (isCartOpen && !appliedDiscount && cartItems.length > 0) {
      fetch('/api/discounts/auto-apply')
        .then((res) => res.json())
        .then((data) => {
          if (data.discount && data.discount.code) {
            setAppliedDiscount(data.discount);
          }
        })
        .catch(() => {});
    }
  }, [isCartOpen, appliedDiscount, cartItems.length]);

  // Close cart drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

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

  const FREE_SHIPPING_THRESHOLD = 999;
  const amountRemainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const freeShippingProgress = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`/api/discounts/${cleanCode}`);
      const data = await res.json();

      if (res.ok) {
        setAppliedDiscount(data);
        setPromoCode('');
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (err) {
      console.error('Apply promo code error:', err);
      setPromoError('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoError('');
  };

  if (!mounted) return null;

  return (
    <>
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)} 
      />
      <div 
        ref={drawerRef}
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
      >
        <div className="cart-header">
          <h2>Shopping Bag</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close Drawer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {cartItems.length > 0 && (
          <div className="shipping-bar-container">
            <div className="shipping-bar-text">
              {amountRemainingForFreeShipping === 0 ? (
                <span>🎉 You&apos;ve unlocked <strong>FREE Express Shipping</strong>!</span>
              ) : (
                <span>Add <strong>₹{amountRemainingForFreeShipping}</strong> more for <strong>FREE Express Shipping</strong></span>
              )}
            </div>
            <div className="shipping-bar-track">
              <div className="shipping-bar-fill" style={{ width: `${freeShippingProgress}%` }} />
            </div>
          </div>
        )}

        <div className="cart-content" data-lenis-prevent>
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p>Your bag is empty.</p>
              <button className="shop-btn" onClick={() => setIsCartOpen(false)}>Shop Scent Collection</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="product-card-placeholder" style={{ minHeight: '100%', padding: '6px' }}>
                        <span className="placeholder-brand" style={{ fontSize: '0.65rem' }}>ETX</span>
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-header-row">
                      <div className="item-titles">
                        <h3>{item.name}</h3>
                        <p className="item-category">{item.category} • {item.size}</p>
                      </div>
                      <button 
                        className="item-remove-link" 
                        onClick={() => removeFromCart(item.name, item.size)}
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="item-footer-row">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.name, item.size, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.name, item.size, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <p className="item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Promo Code Accordion */}
            <div className="promo-accordion">
              <button 
                type="button" 
                className="promo-toggle-btn"
                onClick={() => setIsPromoExpanded(!isPromoExpanded)}
              >
                <span>{appliedDiscount ? 'Promo Code Applied' : 'Have a Promo Code?'}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  style={{ 
                    transform: isPromoExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`promo-collapse-content ${isPromoExpanded || appliedDiscount ? 'expanded' : ''}`}>
                <form onSubmit={handleApplyPromo} className="promo-form">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    disabled={promoLoading || !!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <button type="button" onClick={handleRemovePromo} className="promo-btn remove">
                      Remove
                    </button>
                  ) : (
                    <button type="submit" disabled={promoLoading || !promoCode.trim()} className="promo-btn">
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  )}
                </form>
                {promoError && <p className="promo-error">{promoError}</p>}
                {appliedDiscount && (
                  <p className="promo-success">
                    Code <strong>{appliedDiscount.code}</strong> applied (
                    {appliedDiscount.type === 'Percentage'
                      ? `${appliedDiscount.value}% off`
                      : appliedDiscount.type === 'Fixed Amount'
                      ? `₹${appliedDiscount.value} off`
                      : 'Free Shipping'}
                    )
                  </p>
                )}
              </div>
            </div>

            <div className="cart-summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {appliedDiscount && (
                <div className="summary-row discount-row">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span className="discount-amount">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-price">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <p className="tax-shipping-info">
              {appliedDiscount?.type === 'Free Shipping' 
                ? 'Free shipping applied. Taxes calculated at checkout.' 
                : 'Shipping and taxes calculated at checkout.'}
            </p>
            <button 
              className="checkout-btn" 
              onClick={() => {
                setIsCartOpen(false);
                router.push(appliedDiscount ? `/checkout?promo=${appliedDiscount.code}` : '/checkout');
              }}
            >
              <span>Proceed to Checkout</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Bag
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(26, 22, 23, 0.55);
          backdrop-filter: blur(6px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          z-index: 100001;
        }

        .cart-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 440px;
          height: 100%;
          background: #FAF6F4;
          border-left: 1px solid #EDE1DC;
          box-shadow: -12px 0 50px rgba(26, 22, 23, 0.12);
          display: flex;
          flex-direction: column;
          z-index: 100002;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cart-drawer.open {
          transform: translateX(0);
        }

        @media (max-width: 440px) {
          .cart-drawer {
            right: 0;
            max-width: 100%;
            transform: translateX(100%);
          }
          .cart-drawer.open {
            transform: translateX(0);
          }
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: #FFFFFF;
          border-bottom: 1px solid #EDE1DC;
          flex-shrink: 0;
        }

        .cart-header h2 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #1A1617;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .shipping-bar-container {
          background: #FFFFFF;
          border-bottom: 1px solid #EDE1DC;
          padding: 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shipping-bar-text {
          font-size: 0.72rem;
          color: #1A1617;
          text-align: center;
          font-weight: 500;
        }

        .shipping-bar-track {
          width: 100%;
          height: 5px;
          background: #EDE1DC;
          border-radius: 999px;
          overflow: hidden;
        }

        .shipping-bar-fill {
          height: 100%;
          background: #D99458;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .close-btn {
          background: none;
          border: none;
          color: #7A6E6A;
          cursor: pointer;
          transition: color 0.2s;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #1A1617;
        }

        .cart-content, .checkout-content, .success-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px;
        }

        .empty-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          color: #7A6E6A;
        }

        .empty-cart p {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.15rem;
          color: #1A1617;
          margin: 0;
        }

        .shop-btn {
          background: #1A1617;
          border: 1px solid #1A1617;
          color: #FAF6F4;
          padding: 12px 24px;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .shop-btn:hover {
          background: #D99458;
          border-color: #D99458;
          color: #1A1617;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-item {
          display: flex;
          flex-direction: row;
          gap: 14px;
          padding: 14px;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 2px 8px rgba(26, 22, 23, 0.02);
        }

        .item-image {
          width: 76px;
          height: 96px;
          background: #FAF6F4;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          border: 1px solid #EDE1DC;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .item-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .item-titles {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .item-header-row h3 {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          color: #1A1617;
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }

        .item-category {
          font-size: 0.68rem;
          color: #7A6E6A;
          margin: 0;
          font-weight: 500;
        }

        .item-remove-link {
          background: none;
          border: none;
          color: #8F8480;
          font-size: 0.7rem;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .item-remove-link:hover {
          color: #ef4444;
        }

        .item-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          background: #FAF6F4;
          height: 26px;
        }

        .quantity-controls button {
          background: none;
          border: none;
          color: #1A1617;
          width: 24px;
          height: 100%;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .quantity-controls button:hover {
          color: #D99458;
          background: #EDE1DC;
        }

        .quantity-controls span {
          width: 20px;
          text-align: center;
          font-size: 0.75rem;
          color: #1A1617;
          font-weight: 600;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-price {
          font-size: 0.95rem;
          color: #1A1617;
          font-family: var(--font-serif);
          font-weight: 600;
          margin: 0;
        }

        /* Cart Footer Styles */
        .cart-footer {
          padding: 16px 20px 20px 20px;
          border-top: 1px solid #EDE1DC;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
          box-shadow: 0 -4px 16px rgba(26, 22, 23, 0.03);
        }

        .promo-accordion {
          display: flex;
          flex-direction: column;
          width: 100%;
          border-bottom: 1px solid #EDE1DC;
          padding-bottom: 8px;
          margin-bottom: 2px;
        }

        .promo-toggle-btn {
          background: none;
          border: none;
          color: #7A6E6A;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          font-weight: 600;
          transition: color 0.2s;
        }

        .promo-toggle-btn:hover {
          color: #D99458;
        }

        .promo-collapse-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          opacity: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .promo-collapse-content.expanded {
          max-height: 80px;
          opacity: 1;
          padding-top: 6px;
        }

        .promo-form {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .promo-form input {
          flex: 1;
          width: 100%;
          box-sizing: border-box;
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          color: #1A1617;
          padding: 8px 12px;
          font-size: 0.72rem;
          border-radius: 6px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: inherit;
          font-weight: 600;
        }

        .promo-form input:focus {
          outline: none;
          border-color: #D99458;
        }

        .promo-btn {
          background: #1A1617;
          border: 1px solid #1A1617;
          color: #FAF6F4;
          padding: 8px 16px;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
        }

        .promo-btn:hover:not(:disabled) {
          background: #D99458;
          color: #1A1617;
          border-color: #D99458;
        }

        .promo-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .promo-btn.remove {
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
          background: #FFFFFF;
        }

        .promo-btn.remove:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .promo-error {
          font-size: 0.7rem;
          color: #dc2626;
          margin: 0;
          text-align: left;
        }

        .promo-success {
          font-size: 0.72rem;
          color: #047857;
          margin: 0;
          text-align: left;
          letter-spacing: 0.02em;
          font-weight: 600;
        }

        .cart-summary-totals {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 4px 0 6px 0;
          border-top: 1px solid #EDE1DC;
          padding-top: 10px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #7A6E6A;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .summary-row span:last-child {
          color: #1A1617;
          font-weight: 600;
        }

        .discount-row {
          color: #047857;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .discount-amount {
          font-family: var(--font-serif);
        }

        .total-row {
          border-top: 1px solid #EDE1DC;
          padding-top: 8px;
          margin-top: 4px;
        }

        .total-row span:first-child {
          font-weight: 700;
          color: #1A1617;
          font-size: 0.9rem;
        }

        .total-price {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: #1A1617;
          font-weight: 700;
        }

        .tax-shipping-info {
          font-size: 0.65rem;
          color: #7A6E6A;
          margin: 0;
          text-align: center;
          letter-spacing: 0.02em;
        }

        .checkout-btn {
          background: #1A1617;
          color: #FAF6F4;
          border: 1px solid #1A1617;
          padding: 14px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .checkout-btn:hover:not(:disabled) {
          background: #2D2527;
          border-color: #D99458;
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.15);
        }

        .checkout-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-cart-btn {
          background: transparent;
          border: none;
          color: #8F8480;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: center;
          padding: 2px;
          margin-top: 4px;
        }

        .clear-cart-btn:hover {
          color: #ef4444;
        }
      `}</style>
    </>
  );
}
