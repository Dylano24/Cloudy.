'use client';

import Link from 'next/link';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';
const CLOUDY_LOGO_URL = 'https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link href="/#server">Server</Link>
          <Link href="/appeal" className={pathname.startsWith('/appeal') ? 'active' : ''}>Appeal Form</Link>
        </nav>

        <div className="cloudy-header-actions">
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
          <Link href="/appeal" onClick={() => setOpen(false)}>Appeal Form</Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord</a>
        </nav>
      )}
    </header>
  );
}
