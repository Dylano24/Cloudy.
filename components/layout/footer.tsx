'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/hooks/use-api';
import type { Store } from '@/lib/schemas';

interface FooterProps {
  initialStore?: Store | null;
}

export function Footer({ initialStore }: FooterProps) {
  const { data: fetchedStore } = useStore();
  const store = fetchedStore || initialStore;
  const discord = store?.social_medias?.discord || 'https://discord.gg/QnWNz2dKCE';

  return (
    <footer className="cloudy-footer">
      <div className="cloudy-footer-inner">
        <div className="cloudy-footer-grid">
          <div>
            <div className="cloudy-footer-brand">
              <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={45} height={45} />
              <div>
                <strong>CLOUDY RUST</strong>
                <small>Survive Build Dominate</small>
              </div>
            </div>
            <p className="cloudy-footer-copy">
              Survive Build Dominate. Rust combat, raids, defense and a custom storefront powered by Tip4Serv.
            </p>
          </div>

          <div>
            <div className="cloudy-footer-title">Navigation</div>
            <div className="cloudy-footer-links">
              <Link href="/">Home</Link>
              <Link href="/#server">Server</Link>
              <Link href="/shop">Store</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </div>

          <div>
            <div className="cloudy-footer-title">Community</div>
            <div className="cloudy-footer-links">
              <a href={discord} target="_blank" rel="noreferrer">Discord</a>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="cloudy-footer-bottom">
          <span>© {new Date().getFullYear()} Cloudy Rust. All rights reserved.</span>
          <span>Survive Build Dominate</span>
        </div>
      </div>
    </footer>
  );
}
