'use client';

import Image from 'next/image';
import Link from 'next/link';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';

export function Footer() {
  return (
    <footer className="cloudy-footer">
      <div className="cloudy-footer-inner">
        <div className="cloudy-footer-grid">
          <div>
            <div className="cloudy-footer-brand">
              <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={45} height={45} />
              <div>
                <strong>CLOUDY RUST</strong>
              </div>
            </div>
          </div>

          <div>
            <div className="cloudy-footer-title">Navigation</div>
            <div className="cloudy-footer-links">
              <Link href="/">Home</Link>
              <Link href="/#server">Server</Link>
              <Link href="/shop">Store</Link>
            </div>
          </div>

          <div>
            <div className="cloudy-footer-title">Community</div>
            <div className="cloudy-footer-links">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="cloudy-footer-bottom">
          <span>© {new Date().getFullYear()} Cloudy Rust. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
