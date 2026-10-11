'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './header.module.css';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
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
    ['Home', '/'],
    ['Store', '/shop'],
    ['Appeal', '/appeal'],
    ['Support', '/support'],
  ] as const;

  return (
    <header className={`cloudy-header ${styles.header}`}>
      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand" aria-label="Cloudy Inc. home">
          <span className="cloudy-logo-orbit">
            <img src={CLOUDY_LOGO_URL} alt="Cloudy" width={48} height={48} />
          </span>
          <span className="cloudy-brand-copy">
            <strong>CLOUDY INC.</strong>
            <small>QUALITY. INNOVATION. PERFORMANCE.</small>
          </span>
        </Link>

        <nav className="cloudy-header-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={pathname === href || (href === '/appeal' && pathname.startsWith('/appeal')) ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="cloudy-header-actions">
          <Link href="/cart" className="cloudy-shared-basket" aria-label={`Open basket, ${basketCount} saved products`}>
            <BasketIcon />
            <span className="cloudy-shared-basket-count">{basketCount}</span>
          </Link>
          <Link href="/?open=account" className={styles.login}>
            <LogIn size={17} /> Login
          </Link>
        </div>
      </div>

    </header>
  );
}
