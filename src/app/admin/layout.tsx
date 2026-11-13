'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Don't render the layout for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [{ href: '/admin', label: 'Dashboard' }]
    },
    {
      title: 'Content',
      items: [
        { href: '/admin/homepage', label: 'Homepage Builder' },
        { href: '/admin/products', label: 'Products' },
        { href: '/admin/banners', label: 'Hero Banners' },
        { href: '/admin/reels', label: 'Reels & Social' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { href: '/admin/inventory', label: 'Inventory' },
        { href: '/admin/orders', label: 'Orders' },
        { href: '/admin/bookings', label: 'Bookings' },
        { href: '/admin/inquiries', label: 'Inquiries' },
        { href: '/admin/customers', label: 'Customers' },
        { href: '/admin/reviews', label: 'Reviews' }
      ]
    },
    {
      title: 'Growth',
      items: [
        { href: '/admin/discounts', label: 'Discounts' },
        { href: '/admin/analytics', label: 'Analytics' }
      ]
    },
    {
      title: 'System',
      items: [
        { href: '/admin/settings', label: 'Settings' }
      ]
    }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="logo">
            ETERNYX
          </Link>
          <span className="badge">ADMIN</span>
          <button className="mobile-close" onClick={() => setIsMobileNavOpen(false)}>×</button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, idx) => (
            <div key={idx} className="nav-group">
              <h4>{group.title}</h4>
              <ul>
                {group.items.map(item => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={pathname === item.href ? 'active' : ''}
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <button className="mobile-menu-btn" onClick={() => setIsMobileNavOpen(true)}>
            ☰
          </button>
          <div className="header-right">
            <Link href="/" target="_blank" className="view-site">
              View Live Site ↗
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .admin-layout {
          display: flex;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background: #0a0a0a;
          color: rgba(255, 255, 255, 0.85);
          font-family: var(--font-sans);
        }

        /* Sidebar */
        .admin-sidebar {
          width: 260px;
          height: 100vh;
          max-height: 100vh;
          background: #0d0d0d;
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          z-index: 50;
          overflow: hidden;
        }

        .sidebar-header {
          height: 70px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          gap: 12px;
        }

        .sidebar-header .logo {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: #fff;
          text-decoration: none;
          letter-spacing: 0.15em;
        }

        .sidebar-header .badge {
          font-size: 0.55rem;
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          padding: 2px 6px;
          border-radius: 2px;
          letter-spacing: 0.1em;
        }

        .mobile-close {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          margin-left: auto;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 24px 0;
        }

        .nav-group {
          margin-bottom: 24px;
        }

        .nav-group h4 {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.3);
          padding: 0 24px;
          margin-bottom: 8px;
        }

        .nav-group ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-group a {
          display: block;
          padding: 10px 24px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .nav-group a:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.02);
        }

        .nav-group a.active {
          color: #d4af37;
          background: rgba(212, 175, 55, 0.05);
          border-right: 2px solid #d4af37;
        }

        .sidebar-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .logout-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        /* Main Content */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          min-width: 0; /* Important for preventing overflow */
        }

        .admin-header {
          height: 70px;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          padding: 0 32px;
          background: #0a0a0a;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          margin-right: 20px;
        }

        .header-right {
          margin-left: auto;
        }

        .view-site {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s ease;
        }

        .view-site:hover {
          color: #fff;
        }

        .admin-content {
          padding: 32px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
        }

        .admin-content::-webkit-scrollbar,
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        .admin-content::-webkit-scrollbar-track,
        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .admin-content::-webkit-scrollbar-thumb,
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.25);
          border-radius: 3px;
        }
        .admin-content::-webkit-scrollbar-thumb:hover,
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }

        /* Admin Page Common Styles */
        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .admin-page-title {
          font-family: var(--font-serif);
          font-weight: 300;
          font-size: 1.8rem;
          color: #fff;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            bottom: 0;
            transition: left 0.3s ease;
          }
          .admin-sidebar.open {
            left: 0;
          }
          .mobile-close {
            display: block;
          }
          .admin-header {
            padding: 0 20px;
          }
          .mobile-menu-btn {
            display: block;
          }
          .admin-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
