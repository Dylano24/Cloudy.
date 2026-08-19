import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  Gamepad2,
  MessageCircle,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';
import { WipeCountdown } from '@/components/home/wipe-countdown';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';

const features = [
  [Zap, 'Fast delivery', 'Packages are prepared for automatic Tip4Serv delivery.'],
  [ShieldCheck, 'Secure checkout', 'Payments and product delivery stay handled by Tip4Serv.'],
  [Gamepad2, 'Made for Rust', 'Ranks, kits and perks designed around the Cloudy server.'],
] as const;

export default function HomePage() {
  return (
    <div className="cloudy-home-v2">
      <section className="cloudy-landing-hero">
        <div className="cloudy-landing-scene" aria-hidden="true" />
        <div className="cloudy-landing-tint" aria-hidden="true" />
        <div className="cloudy-landing-noise" aria-hidden="true" />

        <div className="cloudy-landing-inner">
          <div className="cloudy-landing-badge">
            <Sparkles size={14} />
            Welcome to Cloudy Rust
          </div>

          <div className="cloudy-landing-logo">
            <span className="cloudy-logo-halo" />
            <Image src="/images/cloudy-c.svg" alt="Cloudy C logo" width={170} height={170} priority />
          </div>

          <h1>
            <span>CLOUDY</span>
            <strong>RUST</strong>
          </h1>

          <p className="cloudy-landing-subtitle">
            Premium Rust gameplay, custom progression and a community-first experience.
            Built to look clean, feel fast and grow with the server.
          </p>

          <div className="cloudy-landing-actions">
            <Link href="/shop" className="cloudy-cta-primary">
              Open Store <ArrowRight size={18} />
            </Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-cta-secondary">
              <MessageCircle size={18} /> Join Discord
            </a>
          </div>

          <div className="cloudy-scroll-hint">
            <span />
            Scroll to explore
          </div>
        </div>
      </section>

      <section className="cloudy-content-section cloudy-wipe-section" id="server">
        <div className="cloudy-section-heading">
          <span><Clock3 size={15} /> Next server wipe</span>
          <h2>COUNTDOWN TO THE NEXT WIPE</h2>
          <p>This countdown is temporary and can later be connected to your real Rust wipe schedule.</p>
        </div>

        <WipeCountdown />

        <div className="cloudy-server-grid">
          <article className="cloudy-server-card">
            <div className="cloudy-server-card-top">
              <span className="cloudy-server-icon"><Server size={23} /></span>
              <span className="cloudy-status-pill cloudy-status-pending">Setup</span>
            </div>
            <h3>Cloudy Main</h3>
            <p>Primary Cloudy Rust server. Live player data will appear here once the game server is connected.</p>
            <div className="cloudy-server-meta">
              <div><span>Region</span><strong>EU</strong></div>
              <div><span>Game</span><strong>Rust</strong></div>
              <div><span>Connection</span><strong>Coming soon</strong></div>
            </div>
            <button type="button" className="cloudy-copy-button" disabled>
              <Copy size={16} /> Server IP after integration
            </button>
          </article>

          <article className="cloudy-server-card cloudy-server-card-accent">
            <div className="cloudy-server-card-top">
              <span className="cloudy-server-icon"><ShieldCheck size={23} /></span>
              <span className="cloudy-status-pill">Cloudy</span>
            </div>
            <h3>Built for the community</h3>
            <p>Clean progression, premium perks and a storefront that stays connected to your Tip4Serv products.</p>
            <ul className="cloudy-server-list">
              <li><CheckCircle2 size={17} /> Custom store experience</li>
              <li><CheckCircle2 size={17} /> Tip4Serv checkout ready</li>
              <li><CheckCircle2 size={17} /> Nitrado/server integration ready</li>
            </ul>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-server-link">
              Join the community <ArrowRight size={17} />
            </a>
          </article>
        </div>
      </section>

      <section className="cloudy-content-section cloudy-feature-zone">
        <div className="cloudy-section-heading">
          <span>Why Cloudy</span>
          <h2>BUILT TO FEEL PREMIUM</h2>
          <p>The visual system is based on your own dark Rust design, rebuilt with Cloudy blue branding.</p>
        </div>

        <div className="cloudy-feature-grid-v2">
          {features.map(([Icon, title, text], index) => (
            <article key={title} className="cloudy-feature-v2">
              <span className="cloudy-feature-index">0{index + 1}</span>
              <div className="cloudy-feature-symbol"><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cloudy-store-zone" id="store">
        <div className="cloudy-store-ambient" aria-hidden="true" />
        <div className="cloudy-section-heading cloudy-store-title-v2">
          <span>Cloudy Store</span>
          <h2>CHOOSE YOUR UPGRADE</h2>
          <p>Your real Tip4Serv products remain the source of truth for the shop.</p>
        </div>
        <ProductsGrid />
      </section>

      <section className="cloudy-content-section cloudy-community-zone">
        <div className="cloudy-community-card">
          <div className="cloudy-community-logo">
            <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={92} height={92} />
          </div>
          <span>Cloudy Rust Community</span>
          <h2>READY TO JOIN?</h2>
          <p>Join Discord for announcements, wipe information, support and the latest Cloudy updates.</p>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-cta-primary">
            <MessageCircle size={18} /> Join Discord
          </a>
        </div>
      </section>
    </div>
  );
}
