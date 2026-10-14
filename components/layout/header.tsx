'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './header.module.css';
import { BasketIcon } from '@/components/ui/basket-icon';
import { useAccount } from '@/hooks/use-account';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const BASKET_KEY = 'cloudy-basket-v1';

export function Header() {
  const pathname = usePathname();
  const { user, pending, logout, loggingOut } = useAccount();
  const [accountOpen, setAccountOpen] = useState(false);
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
    ['Discord', 'https://discord.gg/EGDVMmmSzF'],
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
            <Link key={href} href={href} {...(href.startsWith('https://') ? { target: '_blank', rel: 'noreferrer' } : {})} className={pathname === href ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="cloudy-header-actions">
          <div className={styles.account} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false);
          }} onKeyDown={(event) => {
            if (event.key === 'Escape') setAccountOpen(false);
          }}>
            <button type="button" className={styles.login} aria-label="Account" aria-expanded={accountOpen} aria-controls="cloudy-account-menu" onClick={() => setAccountOpen(!accountOpen)}>
              <UserRound size={20} aria-hidden="true" />
            </button>
            {accountOpen && (
              <nav id="cloudy-account-menu" className={styles.accountMenu} aria-label="Account menu">
                {user && ([['My account', '/account'], ['My orders', '/account/orders'], ['Favorites', '/account/favorites'], ['Fidelity', '/account/fidelity'], ['My information', '/account/information']] as const).map(([label, href]) => (
                  <Link key={href} href={href} onClick={() => setAccountOpen(false)}>{label}</Link>
                ))}
                {user ? <button type="button" className={styles.authAction} disabled={loggingOut} onClick={() => { void logout().then(() => setAccountOpen(false)).catch(() => window.alert('Unable to sign out. Please try again.')); }}>Log off</button> : !pending && <><Link href="/account" className={styles.authAction} onClick={() => setAccountOpen(false)}>Login</Link><Link href="/account/create" onClick={() => setAccountOpen(false)}>Create account</Link></>}
              </nav>
            )}
          </div>
          <Link href="/cart" className="cloudy-shared-basket" aria-label={`Open basket, ${basketCount} saved products`}>
            <BasketIcon />
            <span className="cloudy-shared-basket-count">{basketCount}</span>
          </Link>
        </div>
      </div>

    </header>
  );
}
