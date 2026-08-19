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

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#server', label: 'Server' },
    { href: '/terms', label: 'Rules' },
    { href: '/shop', label: 'Store' },
  ];

  return (
    <header className="cloudy-header">
      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand" aria-label="Cloudy Rust home">
          <span className="cloudy-logo-orbit">
            <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={48} height={48} priority />
          </span>
          <span className="cloudy-brand-copy">
            <strong>CLOUDY RUST</strong>
            <small>Premium Rust Network</small>
          </span>
        </Link>

        <nav className="cloudy-header-nav" aria-label="Main navigation">
          {links.map(link => {
            const baseHref = link.href.split('#')[0];
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(baseHref);
            return (
              <Link key={link.href} href={link.href} className={active ? 'active' : ''}>
                {link.label}
              </Link>
            );
          })}
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
          {links.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord</a>
        </nav>
      )}
    </header>
  );
}
