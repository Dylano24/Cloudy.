'use client';

import Link from 'next/link';
import { LogIn, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';
const BASKET_KEY = 'cloudy-basket-v1';

function BasketIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h14l1 14H4L5 7Z M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [basketCount, setBasketCount] = useState(0);

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

  const nav = [
    ['HOME', '/'],
    ['SERVER', '/#games'],
    ['STORE', '/shop'],
    ['APPEAL FORM', '/appeal'],
  ] as const;

  return (
    <header className="cloudy-header">
      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand" aria-label="Cloudy Inc. home">
          <span className="cloudy-logo-orbit">
            <img src="/images/cloudy-c.svg" alt="" width={48} height={48} />
          </span>
          <span className="cloudy-brand-copy">
            <strong>CLOUDY INC.</strong>
            <small>Quality. Innovation. Performance.</small>
          </span>
        </Link>

        <nav className="cloudy-header-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={pathname === href || (href === '/appeal' && pathname.startsWith('/appeal')) ? 'active' : ''}>
              {label}
            </Link>
          ))}
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">DISCORD</a>
        </nav>

        <div className="cloudy-header-actions">
          <a href="/#basket" className="cloudy-shared-basket" aria-label={`Open basket, ${basketCount} saved products`}>
            <BasketIcon />
            <span className="cloudy-shared-basket-label">Basket</span>
            <span className="cloudy-shared-basket-count">{basketCount}</span>
          </a>
          <button type="button" onClick={() => setOpen(!open)} className="cloudy-mobile-button" aria-label="Menu" aria-expanded={open} style={{ display: 'grid', placeItems: 'center' }}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="cloudy-mobile-menu" aria-label="Mobile navigation" style={{ display: 'block' }}>
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>DISCORD</a>
          <Link href="/?open=account" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogIn size={17} /> LOGIN
          </Link>
        </nav>
      )}
    </header>
  );
}
