'use client';

import Link from 'next/link';
import { Cloud, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '@/hooks/use-api';
import { FaDiscord, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import type { Store } from '@/lib/schemas';

interface FooterProps { initialStore?: Store | null }

export function Footer({ initialStore }: FooterProps) {
  const { data: fetchedStore } = useStore();
  const store = fetchedStore || initialStore;
  const socials = store?.social_medias;

  return (
    <footer className="mt-24 border-t border-cyan-400/15 bg-[#020817]/85">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-xl text-[#020817]"><Cloud /></div>
              <div><div className="font-black tracking-[.18em]">CLOUDY</div><div className="text-xs uppercase tracking-widest text-cyan-300">Rust Store</div></div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted">Premium Rust ranks, kits and perks built for the Cloudy community.</p>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-white">Quick links</h3>
            <div className="grid gap-3 text-sm text-muted">
              <Link href="/" className="hover:text-cyan-300">Home</Link>
              <Link href="/shop" className="hover:text-cyan-300">Store</Link>
              <Link href="/cart" className="hover:text-cyan-300">Cart</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-white">Why Cloudy?</h3>
            <div className="space-y-3 text-sm text-muted">
              <p className="flex items-center gap-2"><Zap className="h-4 w-4 text-cyan-300" /> Instant delivery</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Secure checkout</p>
            </div>
            <div className="mt-5 flex gap-4 text-xl text-muted">
              {socials?.discord && <a href={socials.discord} target="_blank" rel="noreferrer" className="hover:text-cyan-300"><FaDiscord /></a>}
              {socials?.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="hover:text-cyan-300"><FaInstagram /></a>}
              {socials?.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" className="hover:text-cyan-300"><FaYoutube /></a>}
              {socials?.tiktok && <a href={socials.tiktok} target="_blank" rel="noreferrer" className="hover:text-cyan-300"><FaTiktok /></a>}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cloudy. All rights reserved.</p>
          <p>Powered securely by Tip4Serv</p>
        </div>
      </div>
    </footer>
  );
}
