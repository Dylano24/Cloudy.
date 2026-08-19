'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useStore } from '@/hooks/use-api';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Store } from '@/lib/schemas';

interface HeaderProps { initialStore?: Store | null }

export function Header({ initialStore }: HeaderProps) {
  const { data: fetchedStore } = useStore();
  const store = fetchedStore || initialStore;
  const cart = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Store' },
  ];

  return (
    <header className="cloudy-header">
      <div className="cloudy-header-inner">
        <Link href="/" className="cloudy-header-brand">
          <div className="cloudy-header-c"><span>C</span></div>
          <div>
            <span className="cloudy-header-name">CLOUDY</span>
            <span className="cloudy-header-sub">Rust Store</span>
          </div>
        </Link>

        <nav className="cloudy-header-nav">
          {links.map(link => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={active ? 'active' : ''}>
                {link.label}
              </Link>
            );
          })}

          {store?.menu_links?.map((item, index) => (
            <a key={index} href={item.link.trim()} target="_blank" rel="noreferrer">
              {item.title}
            </a>
          ))}

          <Link href="/cart" className="cloudy-header-cart">
            <ShoppingCart size={18} />
            Cart
            {mounted && cart.getItemCount() > 0 && <b>{cart.getItemCount()}</b>}
          </Link>
        </nav>

        <button type="button" onClick={() => setOpen(!open)} className="cloudy-mobile-button" aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="cloudy-mobile-menu">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/shop" onClick={() => setOpen(false)}>Store</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
          {store?.menu_links?.map((item, index) => <a key={index} href={item.link.trim()}>{item.title}</a>)}
        </nav>
      )}
    </header>
  );
}
