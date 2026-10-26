'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { DEFAULT_CATEGORIES } from '@/lib/types';

const ANNOUNCEMENTS = [
  'COMPLIMENTARY SHIPPING GLOBALLY ON ALL ORDERS',
  'SILENCE IS LUXURY • DISCOVER THE ALCHEMY COLLECTION',
  'EXPERIENCE TAILORED BESPOKE PERFUMERY'
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const { setIsCartOpen, cartCount, appliedCoupon, applyCoupon } = useCart();
  const { customer, isLoggedIn, openAuthModal, logout } = useCustomerAuth();
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const close = () => {
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
  };

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAutoApply = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    applyCoupon(code);
    setApplySuccessMsg(`Coupon ${code} applied! Discount will reflect at checkout.`);
    setTimeout(() => setApplySuccessMsg(null), 3500);
  };

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isSearchOpen]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const tickerContent = (
    <>
      <span className="ticker-item">
        <span className="ticker-sparkle">✦</span>
        <span>EXCLUSIVE OFFER:</span>
        <span className="ticker-coupon-pill" onClick={(e) => handleCopyCoupon('NEW50', e)} title="Click to copy NEW50">
          <strong>NEW50</strong>
          <span className="ticker-badge-action">{copiedCode === 'NEW50' ? '✓ COPIED' : 'COPY'}</span>
        </span>
        <span className="ticker-highlight">50% OFF ENTIRE ORDER</span>
        <button
          className={`ticker-apply-btn ${appliedCoupon === 'NEW50' ? 'applied' : ''}`}
          onClick={(e) => handleAutoApply('NEW50', e)}
        >
          {appliedCoupon === 'NEW50' ? '✓ APPLIED' : 'APPLY NOW'}
        </button>
      </span>
      <span className="ticker-dot">•</span>
      <span className="ticker-item">
        <span className="ticker-icon">🚚</span>
        <span>COMPLIMENTARY GLOBAL EXPRESS SHIPPING ON ALL ORDERS</span>
      </span>
      <span className="ticker-dot">•</span>
      <span className="ticker-item">
        <span className="ticker-sparkle">✦</span>
        <span>EXPERIENCE TAILORED BESPOKE LUXURY PERFUMERY</span>
      </span>
      <span className="ticker-dot">•</span>
    </>
  );

  return (
    <>
      {/* Toast Notification when coupon is applied */}
      {applySuccessMsg && (
        <div className="coupon-toast">
          <span className="toast-icon">✨</span>
          <span>{applySuccessMsg}</span>
        </div>
      )}

      <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        {/* Continuous Luxury Marquee Bar */}
        <div className="announcement-bar marquee-wrapper">
          <div className="marquee-track">
            <div className="marquee-group">{tickerContent}</div>
            <div className="marquee-group" aria-hidden="true">{tickerContent}</div>
          </div>
        </div>

        <nav className="navbar">
          {/* Hamburger Icon on Mobile/Tablet */}
          <button
            className="nav-hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>

          <div className="nav-links">
            <Link href="/shop" className="nav-link">Shop</Link>
            <Link href="/alchemy" className="nav-link">The Alchemy</Link>
          </div>

          <Link href="/" className="nav-logo" onClick={close}>
            ETERNYX
          </Link>

          <div className="nav-icons">
            <Link href="/story" className="nav-link desktop-only">Our Story</Link>
            <Link href="/bespoke" className="nav-link desktop-only">Bespoke</Link>
            <button aria-label="Search" onClick={() => setIsSearchOpen(true)} className="nav-icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Account Icon & Dropdown */}
            <div className="nav-account-container" onMouseLeave={() => setIsAccountDropdownOpen(false)}>
              <button
                aria-label="Account"
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuthModal('login');
                  } else {
                    setIsAccountDropdownOpen(!isAccountDropdownOpen);
                  }
                }}
                className={`nav-icon-btn ${isLoggedIn ? 'logged-in' : ''}`}
                title={isLoggedIn ? (customer?.name || 'Account') : 'Sign In'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {isLoggedIn && <span className="nav-user-dot" />}
              </button>

              {isLoggedIn && isAccountDropdownOpen && (
                <div className="account-dropdown-menu">
                  <div className="dropdown-user-header">
                    <p className="dropdown-user-name">{customer?.name || 'Valued Client'}</p>
                    <p className="dropdown-user-email">{customer?.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link href="/account" className="dropdown-link" onClick={() => setIsAccountDropdownOpen(false)}>
                    <span className="dropdown-bullet">✦</span>
                    <span>My Account &amp; Orders</span>
                  </Link>
                  <Link href="/track" className="dropdown-link" onClick={() => setIsAccountDropdownOpen(false)}>
                    <span className="dropdown-bullet">✦</span>
                    <span>Track Delivery</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-link logout"
                    onClick={async () => {
                      setIsAccountDropdownOpen(false);
                      await logout();
                    }}
                  >
                    <span className="dropdown-bullet">✕</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {pathname !== '/checkout' && (
              <button aria-label="Cart" onClick={() => setIsCartOpen(true)} className="cart-trigger-btn nav-icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Immersive Search Modal Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'active' : ''}`}>
        <div className="search-container">
          <button
            className="search-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="search-form-wrapper">
            <form action="/shop" method="GET" className="search-form">
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ETERNYX..."
                className="search-input"
                autoComplete="off"
                autoFocus={isSearchOpen}
              />
            </form>
            <div className="search-suggestions">
              <p className="suggestions-title">SUGGESTED SEARCHES</p>
              <div className="suggestions-list">
                <Link href="/shop?q=alchemy" onClick={() => setIsSearchOpen(false)}>The Alchemy Collection</Link>
                <Link href="/shop?q=bespoke" onClick={() => setIsSearchOpen(false)}>Bespoke Perfumery</Link>
                <Link href="/shop?q=oud" onClick={() => setIsSearchOpen(false)}>Oud & Gold</Link>
                <Link href="/shop?q=gift" onClick={() => setIsSearchOpen(false)}>Curated Gift Sets</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
        {/* Header row inside overlay: logo + close button */}
        <div className="mobile-menu-header">
          <Link href="/" className="mobile-menu-logo" onClick={close}>
            ETERNYX
          </Link>
          <button
            className="mobile-menu-close"
            onClick={close}
            aria-label="Close Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gold divider */}
        <div className="mobile-menu-divider" />

        {/* Mobile Account Profile Card */}
        <div className="mobile-account-bar">
          {isLoggedIn ? (
            <div className="mobile-account-logged">
              <div className="mobile-account-avatar">
                {(customer?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="mobile-account-meta">
                <span className="mobile-account-name">{customer?.name}</span>
                <Link href="/account" onClick={close} className="mobile-account-sublink">
                  My Orders &amp; Profile →
                </Link>
              </div>
              <button
                className="mobile-account-logout-btn"
                onClick={async () => {
                  close();
                  await logout();
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="mobile-account-signin-btn"
              onClick={() => {
                close();
                openAuthModal('login');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="mobile-menu-links">
          {/* 01 Shop Collection + Categories Submenu */}
          <div className="mobile-menu-group">
            <div className="mobile-menu-row">
              <Link
                href="/shop"
                onClick={close}
                className="mobile-menu-link has-sub"
                style={{ '--link-index': 0 } as React.CSSProperties}
              >
                <span className="mobile-menu-link-num">01</span>
                <span>Shop Collection</span>
              </Link>
              <button
                type="button"
                className={`mobile-cat-toggle-btn ${isCategoriesOpen ? 'open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoriesOpen(!isCategoriesOpen);
                }}
                aria-label="Toggle fragrance categories"
              >
                <span className="toggle-text">Categories</span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="toggle-chevron"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Category Submenu Accordion */}
            <div className={`mobile-category-subpanel ${isCategoriesOpen ? 'expanded' : ''}`}>
              <div className="mobile-category-list">
                <Link
                  href="/shop"
                  onClick={close}
                  className="mobile-category-item all-item"
                >
                  <span className="cat-bullet">✦</span>
                  <span className="cat-name">All Fragrances</span>
                  <span className="cat-arrow">→</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    onClick={close}
                    className="mobile-category-item"
                  >
                    <span className="cat-bullet">·</span>
                    <span className="cat-name">{cat}</span>
                    <span className="cat-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {[
            { href: '/alchemy', label: 'The Alchemy' },
            { href: '/story', label: 'Our Story' },
            { href: '/bespoke', label: 'Bespoke' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="mobile-menu-link"
              style={{ '--link-index': i + 1 } as React.CSSProperties}
            >
              <span className="mobile-menu-link-num">0{i + 2}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mobile-menu-footer">
          <div className="mobile-menu-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
          </div>
          <p>© 2026 ETERNYX LUXURY. All Rights Reserved.</p>
        </div>
      </div>
    </>
  );
}
