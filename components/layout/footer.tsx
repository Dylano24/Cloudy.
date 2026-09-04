'use client';

import Link from 'next/link';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';
const CLOUDY_LOGO_URL = 'https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif';

export function Footer() {
  return (
    <footer className="cloudy-footer">
      <div className="cloudy-footer-inner">
        <div className="cloudy-footer-grid">
          <div>
            <div className="cloudy-footer-brand">
              <img src={CLOUDY_LOGO_URL} alt="Cloudy" width={45} height={45} />
              <div>
                <strong>CLOUDY INC.</strong>
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
          <span>© {new Date().getFullYear()} Cloudy Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
