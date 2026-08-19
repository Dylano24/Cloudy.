'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, MessageCircle, ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Store } from '@/lib/schemas';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';

interface HeaderProps {
  initialStore?: Store | null;
}

export function Header(_props: HeaderProps) {
  const cart = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="cloudy-header">
      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand" aria-label="Cloudy Rust home">
          <span className="cloudy-logo-orbit">
            <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={48} height={48} priority />
          </span>
          <span className="cloudy-brand-copy">
            <strong>CLOUDY RUST</strong>
            <small>Survive Build Dominate</small>
          </span>
        </Link>

        <nav className="cloudy-header-nav" aria-label="Main navigation">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link href="/#server">Server</Link>
          <Link href="/terms" className={pathname.startsWith('/terms') ? 'active' : ''}>Rules</Link>
          <Link href="/shop" className={pathname.startsWith('/shop') || pathname.startsWith('/product') ? 'active' : ''}>Store</Link>
        </nav>

        <div className="cloudy-header-actions">
          <Link href="/cart" className="cloudy-header-cart" aria-label="Shopping cart">
            <ShoppingCart size={18} />
            {mounted && cart.getItemCount() > 0 && <b>{cart.getItemCount()}</b>}
          </Link>

          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-discord-button">
            <MessageCircle size={18} />
            Join Discord
          </a>

          <button type="button" onClick={() => setOpen(!open)} className="cloudy-mobile-button" aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="cloudy-mobile-menu">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/#server" onClick={() => setOpen(false)}>Server</Link>
          <Link href="/terms" onClick={() => setOpen(false)}>Rules</Link>
          <Link href="/shop" onClick={() => setOpen(false)}>Store</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord</a>
        </nav>
      )}
    </header>
  );
}
