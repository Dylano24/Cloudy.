'use client';

import Link from 'next/link';
import { LogIn, Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const CLOUDY_LOGO_URL = 'https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLabelStyle = { textTransform: 'none' as const };

  return (
    <header className="cloudy-header">
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
          <Link href="/?open=basket" className="cloudy-header-cart" aria-label="Basket">
            <ShoppingBag size={20} />
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
          <Link href="/?open=basket" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <ShoppingBag size={17} /> BASKET
          </Link>
        </nav>
      )}
    </header>
  );
}
