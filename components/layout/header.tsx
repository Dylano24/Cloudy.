'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Cloud, Menu, ShoppingCart, X } from 'lucide-react';
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
    { href: '/cart', label: 'Cart' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-400/15 bg-[#020817]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-3">
          {store?.logo ? (
            <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-cyan-300/30 bg-blue-500/10 shadow-lg shadow-blue-500/20">
              <Image src={store.logo} alt="Cloudy" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-xl text-[#020817] shadow-lg shadow-cyan-500/25">
              <Cloud className="h-6 w-6" />
            </div>
          )}
          <div>
            <span className="block text-xl font-black tracking-[.18em] text-white">CLOUDY</span>
            <span className="block text-[10px] font-bold uppercase tracking-[.25em] text-cyan-300">Rust Store</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.slice(0, 2).map(link => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={"rounded-xl px-5 py-2.5 text-sm font-bold transition " + (active ? "bg-blue-500/15 text-cyan-300" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
                {link.label}
              </Link>
            );
          })}
          {store?.menu_links?.map((item, index) => (
            <a key={index} href={item.link.trim()} target="_blank" rel="noreferrer" className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white">
              {item.title}
            </a>
          ))}
          <Link href="/cart" className="relative ml-2 flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-blue-500/10 px-4 py-2.5 font-bold text-cyan-200 transition hover:border-cyan-300/60 hover:bg-blue-500/20">
            <ShoppingCart className="h-5 w-5" /> Cart
            {mounted && cart.getItemCount() > 0 && <span className="gradient-primary absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-black text-[#020817]">{cart.getItemCount()}</span>}
          </Link>
        </nav>

        <button onClick={() => setOpen(!open)} className="rounded-xl border border-white/10 p-2.5 md:hidden" aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#020817]/95 px-4 py-4 md:hidden">
          {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-bold text-slate-200 hover:bg-blue-500/10">{link.label}</Link>)}
          {store?.menu_links?.map((item, index) => <a key={index} href={item.link.trim()} className="block rounded-xl px-4 py-3 font-bold text-slate-200">{item.title}</a>)}
        </nav>
      )}
    </header>
  );
}
