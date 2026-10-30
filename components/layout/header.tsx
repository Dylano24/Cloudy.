'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import styles from './header.module.css';
import { BasketIcon } from '@/components/ui/basket-icon';
import { useAccount } from '@/hooks/use-account';
import { useCart } from '@/hooks/use-cart';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';

let cloudyLogoBlobPromise: Promise<Blob> | null = null;
function loadCloudyLogoBlob() {
  if (!cloudyLogoBlobPromise) {
    cloudyLogoBlobPromise = fetch(CLOUDY_LOGO_URL, { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error('Unable to load Cloudy logo');
        return response.blob();
      })
      .catch(error => {
        cloudyLogoBlobPromise = null;
        throw error;
      });
  }
  return cloudyLogoBlobPromise;
}

const subscribeCartHydration = (listener: () => void) => useCart.persist.onFinishHydration(listener);
const cartHasHydrated = () => useCart.persist.hasHydrated();
const serverCartHasHydrated = () => false;

export function Header() {
  const pathname = usePathname();
  const { user, pending, logout, loggingOut } = useAccount();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const items = useCart(state => state.items);
  const cartReady = useSyncExternalStore(subscribeCartHydration, cartHasHydrated, serverCartHasHydrated);
  const basketCount = cartReady ? items.reduce((total, item) => total + item.quantity, 0) : 0;
  const [menuOffset, setMenuOffset] = useState<number>();
  const [headerLogoSrc, setHeaderLogoSrc] = useState(CLOUDY_LOGO_URL);
  const logoObjectUrlRef = useRef<string | null>(null);
  const logoRestartRef = useRef(0);
  const initialPathRef = useRef<string | null>(null);

  // Safari can occasionally leave an animated GIF frozen after a client-side
  // route transition. Keep the already-loaded logo visible, then restart the
  // same GIF from an in-memory Blob whenever the pathname changes.
  useEffect(() => {
    let cancelled = false;

    if (initialPathRef.current === null) {
      initialPathRef.current = pathname;
      void loadCloudyLogoBlob().catch(() => undefined);
      return;
    }

    initialPathRef.current = pathname;

    const restartLogo = async () => {
      try {
        const blob = await loadCloudyLogoBlob();
        if (cancelled) return;

        const nextObjectUrl = URL.createObjectURL(blob);
        const previousObjectUrl = logoObjectUrlRef.current;
        logoObjectUrlRef.current = nextObjectUrl;
        setHeaderLogoSrc(nextObjectUrl);

        if (previousObjectUrl) {
          requestAnimationFrame(() => URL.revokeObjectURL(previousObjectUrl));
        }
      } catch {
        if (cancelled) return;

        // Fallback: use a unique CDN URL so Safari treats it as a fresh
        // animated image resource without ever hiding the current logo first.
        const nextSrc = `${CLOUDY_LOGO_URL}?restart=${++logoRestartRef.current}`;
        const preloader = new Image();
        preloader.onload = () => {
          if (!cancelled) setHeaderLogoSrc(nextSrc);
        };
        preloader.src = nextSrc;
      }
    };

    void restartLogo();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => () => {
    if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current);
  }, []);

  useEffect(() => {
    if (!accountOpen || !accountRef.current) return;
    const account = accountRef.current;
    const header = account.closest('header');
    if (!header) return;
    const align = () => setMenuOffset(header.getBoundingClientRect().bottom - account.getBoundingClientRect().top);
    align();
    const observer = new ResizeObserver(align);
    observer.observe(header);
    return () => observer.disconnect();
  }, [accountOpen]);

  // Dismiss the phone account menu when the visitor taps anywhere outside it.
  // Desktop behaviour remains unchanged.
  useEffect(() => {
    if (!accountOpen) return;
    const phone = window.matchMedia('(max-width: 900px)');
    const dismissOutside = (event: PointerEvent) => {
      if (phone.matches && accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [accountOpen]);

  const nav = [
    ['Home', '/'],
    ['Store', '/shop'],
    ['Web solutions', '/service'],
    ['VPN', '/vpn'],
    ['Bot', '/bot'],
  ] as const;

  return (
    <header className={`cloudy-header ${styles.header}`}>
      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand" aria-label="Cloudy Inc. home">
          <span className="cloudy-logo-orbit">
            <img src={headerLogoSrc} alt="Cloudy" width={48} height={48} />
          </span>
          <span className="cloudy-brand-copy">
            <strong>CLOUDY INC.</strong>
            <small>QUALITY. INNOVATION. PERFORMANCE.</small>
          </span>
        </Link>

        <nav className="cloudy-header-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} {...(href.startsWith('https://') ? { target: '_blank', rel: 'noreferrer' } : {})} className={[pathname === href || (href === '/bot' && pathname.startsWith('/bot/')) ? 'active' : '', href === '/bot' ? styles.navBot : ''].filter(Boolean).join(' ')}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="cloudy-header-actions">
          <div ref={accountRef} className={styles.account} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false);
          }} onKeyDown={(event) => {
            if (event.key === 'Escape') setAccountOpen(false);
          }}>
            <button type="button" className={styles.login} aria-label="Account" aria-expanded={accountOpen} aria-controls="cloudy-account-menu" onClick={() => setAccountOpen(!accountOpen)}>
              <UserRound size={20} aria-hidden="true" />
            </button>
            {accountOpen && (
              <nav id="cloudy-account-menu" className={styles.accountMenu} style={{ top: menuOffset }} aria-label="Account menu">
                {user && ([['My account', '/account'], ['My orders', '/account/orders'], ['Favorites', '/account/favorites'], ['Fidelity', '/account/fidelity'], ['My information', '/account/information']] as const).map(([label, href]) => (
                  <Link key={href} href={href} onClick={() => setAccountOpen(false)}>{label}</Link>
                ))}
                {user ? <button type="button" className={`${styles.authAction} ${styles.logOff}`} disabled={loggingOut} onClick={() => { void logout().then(() => setAccountOpen(false)).catch(() => window.alert('Unable to sign out. Please try again.')); }}>Log off</button> : !pending && <><Link href="/account" className={styles.authAction} onClick={() => setAccountOpen(false)}>Login</Link><Link href="/account/create" onClick={() => setAccountOpen(false)}>Create account</Link></>}
                <Link href="/bot" className={styles.menuBot} onClick={() => setAccountOpen(false)}>Bot dashboard</Link>
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
