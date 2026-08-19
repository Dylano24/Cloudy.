import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Crosshair,
  Gamepad2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';

const advantages = [
  [Zap, 'Instant delivery', 'Fast delivery through the Cloudy store system.'],
  [ShieldCheck, 'Secure checkout', 'Tip4Serv-powered checkout and account linking.'],
  [Gamepad2, 'Built for Rust', 'Ranks, kits and perks made for Cloudy players.'],
] as const;

export default function HomePage() {
  return (
    <div className="cloudy-home">
      <section className="cloudy-hero">
        <div className="cloudy-hero-media" />
        <div className="cloudy-hero-blue" />
        <div className="cloudy-hero-vignette" />
        <div className="cloudy-scanlines" />

        <div className="cloudy-shell cloudy-hero-grid">
          <div className="cloudy-hero-copy">
            <div className="cloudy-eyebrow">
              <Crosshair size={15} />
              Official Cloudy Rust Server
            </div>

            <div className="cloudy-hero-logo-row">
              <div className="cloudy-big-c"><span>C</span></div>
              <div className="cloudy-logo-lines">
                <span>Premium Rust</span>
                <span>Store Experience</span>
              </div>
            </div>

            <h1 className="cloudy-main-title">
              <span>Welcome to</span>
              <strong>Cloudy</strong>
            </h1>

            <p className="cloudy-hero-text">
              Enter the battlefield. Upgrade your Rust experience with exclusive ranks,
              kits and premium perks built for the Cloudy community.
            </p>

            <div className="cloudy-actions">
              <Link href="/shop" className="cloudy-button cloudy-primary">
                Explore store <ArrowRight size={19} />
              </Link>
              <a href="https://discord.gg/QnWNz2dKCE" className="cloudy-button cloudy-secondary">
                Join Discord
              </a>
            </div>

            <div className="cloudy-mini-stats">
              <div><strong>RUST</strong><span>Game server</span></div>
              <div><strong>FAST</strong><span>Delivery</span></div>
              <div><strong>SECURE</strong><span>Checkout</span></div>
              <div><strong>PREMIUM</strong><span>Experience</span></div>
            </div>
          </div>

          <aside className="cloudy-command-card">
            <div className="cloudy-command-top">
              <div>
                <span>Cloudy Network</span>
                <h2>Battlefield Store</h2>
              </div>
              <div className="cloudy-live"><i /> ACTIVE</div>
            </div>

            <div className="cloudy-command-logo">C</div>

            <div className="cloudy-command-data">
              <div><span>SERVER</span><strong>Cloudy Main</strong></div>
              <div><span>REGION</span><strong>Europe</strong></div>
              <div><span>GAME</span><strong>Rust</strong></div>
            </div>

            <div className="cloudy-command-feature">
              <LockKeyhole size={18} />
              <div>
                <strong>Protected purchases</strong>
                <span>Secure Cloudy store checkout</span>
              </div>
            </div>

            <Link href="/shop" className="cloudy-command-button">
              Open Cloudy Store <ArrowRight size={18} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="cloudy-section">
        <div className="cloudy-shell cloudy-intro">
          <div>
            <span className="cloudy-section-label"><Sparkles size={15} /> Cloudy Experience</span>
            <h2>Built for players.<br /><span>Designed to stand out.</span></h2>
          </div>

          <div className="cloudy-intro-copy">
            <p>
              Cloudy combines a premium Rust server experience with a clean,
              fast and professionally designed store.
            </p>
            <div className="cloudy-checks">
              {['Premium ranks and kits', 'Fast package delivery', 'Secure checkout flow', 'Exclusive Cloudy perks'].map(item => (
                <div key={item}><span><Check size={14} /></span>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cloudy-section cloudy-feature-section">
        <div className="cloudy-shell cloudy-feature-grid">
          {advantages.map(([Icon, title, text], index) => (
            <article className="cloudy-feature-card" key={title}>
              <b>0{index + 1}</b>
              <div className="cloudy-feature-icon"><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="products" className="cloudy-store-section">
        <div className="cloudy-store-glow" />
        <div className="cloudy-shell">
          <div className="cloudy-store-heading">
            <span>Cloudy Store</span>
            <h2>Choose your <strong>upgrade</strong></h2>
            <p>Select your rank, kit or upgrade and take your Cloudy experience to the next level.</p>
          </div>
        </div>
        <ProductsGrid />
      </section>

      <section className="cloudy-section">
        <div className="cloudy-shell cloudy-premium-grid">
          <div className="cloudy-premium-image">
            <div className="cloudy-premium-overlay" />
            <div className="cloudy-premium-crosshair"><Crosshair size={54} /></div>
          </div>

          <div className="cloudy-premium-content">
            <span className="cloudy-section-label"><Crosshair size={15} /> Dominate the battlefield</span>
            <h2>More than<br />just a store.</h2>
            <p>
              Your Cloudy rank is part of your full Rust experience. Unlock perks,
              support the server and stand out from the rest of the battlefield.
            </p>

            <div className="cloudy-premium-points">
              {[
                ['01', 'Exclusive rewards', 'Access perks available only to Cloudy supporters.'],
                ['02', 'Fast delivery', 'Purchases are processed through the store system.'],
                ['03', 'Community focused', 'Every purchase helps support the Cloudy server.'],
              ].map(([n, title, text]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div><strong>{title}</strong><p>{text}</p></div>
                </div>
              ))}
            </div>

            <Link href="/shop" className="cloudy-button cloudy-primary">
              View all packages <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

      <section className="cloudy-section cloudy-faq-section">
        <div className="cloudy-shell">
          <div className="cloudy-store-heading">
            <span>Support</span>
            <h2>Frequently asked <strong>questions</strong></h2>
          </div>

          <div className="cloudy-faq">
            <details open>
              <summary>When do I receive my purchase?</summary>
              <p>Purchases are normally delivered after successful payment and correct account identification.</p>
            </details>
            <details>
              <summary>What if I bought the wrong package?</summary>
              <p>Purchases are your responsibility. Select the correct package and link the correct account before checkout.</p>
            </details>
            <details>
              <summary>What if my purchase does not arrive?</summary>
              <p>Open a ticket in the Cloudy Discord with your order information so support can investigate it.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="cloudy-final">
        <div className="cloudy-final-bg" />
        <div className="cloudy-shell cloudy-final-content">
          <div className="cloudy-final-c">C</div>
          <span>Ready for Cloudy?</span>
          <h2>Enter the battlefield.</h2>
          <p>Choose your upgrade and become part of the Cloudy Rust community.</p>
          <div className="cloudy-actions cloudy-final-actions">
            <Link href="/shop" className="cloudy-button cloudy-primary">
              Open store <ArrowRight size={19} />
            </Link>
            <a href="https://discord.gg/QnWNz2dKCE" className="cloudy-button cloudy-secondary">
              Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
