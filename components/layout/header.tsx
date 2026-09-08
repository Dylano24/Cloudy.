'use client';

import Link from 'next/link';
import { LogIn, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const CLOUDY_LOGO_URL = 'https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif';
const BASKET_KEY = 'cloudy-basket-v1';

function HomeBasketIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7h14l1 14H4L5 7Z M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [basketCount, setBasketCount] = useState(0);

  const navLabelStyle = { textTransform: 'none' as const };

  useEffect(() => {
    const readBasketCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(BASKET_KEY) || '[]');
        setBasketCount(Array.isArray(saved) ? new Set(saved).size : 0);
      } catch {
        setBasketCount(0);
      }
    };

    readBasketCount();
    window.addEventListener('storage', readBasketCount);
    window.addEventListener('focus', readBasketCount);
    return () => {
      window.removeEventListener('storage', readBasketCount);
      window.removeEventListener('focus', readBasketCount);
    };
  }, []);

  return (
    <header className="cloudy-header">
      <style>{`
        .cloudy-shared-basket {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 42px;
          padding: 8px 12px;
          border: 1px solid #3f3f3f;
          border-radius: 6px;
          background: #212121;
          color: #f1f1f1;
          font-size: 14px;
          transition: border-color .2s, background .2s;
          overflow: visible;
        }
        .cloudy-shared-basket:hover {
          border-color: #aeaeae;
          background: #262626;
        }
        .cloudy-shared-basket-count {
          min-width: 21px;
          padding: 0 6px;
          border-radius: 4px;
          background: #ededed;
          color: #111;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.6;
          text-align: center;
        }
        @media (max-width: 760px) {
          .cloudy-shared-basket {
            min-width: 42px;
            width: 42px;
            height: 42px;
            min-height: 42px;
            padding: 0;
            justify-content: center;
          }
          .cloudy-shared-basket-label {
            display: none;
          }
        }
      `}</style>

      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand" aria-label="Cloudy Rust home">
          <span className="cloudy-logo-orbit">
            <img src={CLOUDY_LOGO_URL} alt="Cloudy" width={48} height={48} style={{ transform: 'translateY(-2px)' }} />
          </span>
          <span className="cloudy-brand-copy">
            <strong>CLOUDY</strong>
            <small>Survive Build Dominate</small>
          </span>
        </Link>

        <nav className="cloudy-header-nav" aria-label="Main navigation">
          <Link href="/" className={pathname === '/' ? 'active' : ''} style={navLabelStyle}>HOME</Link>
          <Link href="/#server" style={navLabelStyle}>SERVER</Link>
          <Link href="/appeal" className={pathname.startsWith('/appeal') ? 'active' : ''} style={navLabelStyle}>APPEAL FORM</Link>
        </nav>

        <div className="cloudy-header-actions">
          <Link
            href="/?open=basket"
            className="cloudy-shared-basket"
            aria-label={`Open basket, ${basketCount} saved ${basketCount === 1 ? 'product' : 'products'}`}
          >
            <HomeBasketIcon />
            <span className="cloudy-shared-basket-label">Basket</span>
            <span className="cloudy-shared-basket-count">{basketCount}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="cloudy-mobile-button"
            aria-label="Menu"
            aria-expanded={open}
            style={{ display: 'grid', placeItems: 'center' }}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="cloudy-mobile-menu"
          aria-label="Account menu"
          style={{
            display: 'block',
            position: 'absolute',
            top: '78px',
            right: '18px',
            minWidth: '180px',
            zIndex: 120,
            border: '1px solid rgba(255,255,255,.10)',
            borderRadius: '10px',
          }}
        >
          <Link href="/?open=account" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <LogIn size={17} /> LOGIN
          </Link>
        </nav>
      )}
    </header>
  );
}
