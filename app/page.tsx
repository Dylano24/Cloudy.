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
import { StoreShowcase } from '@/components/home/store-showcase';
import { WipeCountdown } from '@/components/home/wipe-countdown';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';

const features = [
  [Zap, 'Fast delivery', 'Packages are prepared for automatic Tip4Serv delivery.'],
  [ShieldCheck, 'Secure checkout', 'Payments and product delivery stay handled by Tip4Serv.'],
  [Gamepad2, 'Made for Rust', 'Combat, raid and defense upgrades designed around Cloudy.'],
] as const;

export default function HomePage() {
  return (
    <div className="cloudy-home-v2">
      <section className="cloudy-landing-hero">
        <div
          className="cloudy-landing-scene"
          style={{ backgroundImage: "url('/images/rust-user-background.jpg')" }}
          aria-hidden="true"
        />
        <div className="cloudy-landing-tint" aria-hidden="true" />
        <div className="cloudy-landing-noise" aria-hidden="true" />

        <div className="cloudy-landing-inner">
          <div className="cloudy-landing-badge">
            <Sparkles size={14} />
            Survive Build Dominate
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
            Survive Build Dominate on a Rust server built around combat, raids, defense
            and a clean progression experience.
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
            <p>Primary Cloudy Rust server</p>
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
            <h3>Survive Build Dominate</h3>
            <p>Clean progression, high-value combat upgrades and a storefront connected to your Tip4Serv products.</p>
            <ul className="cloudy-server-list">
              <li><CheckCircle2 size={17} /> Combat and raid focused upgrades</li>
              <li><CheckCircle2 size={17} /> Tip4Serv checkout ready</li>
              <li><CheckCircle2 size={17} /> Server integration ready</li>
            </ul>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-server-link">
              Join the community <ArrowRight size={17} />
            </a>
          </article>
        </div>
      </section>

      <section className="cloudy-content-section cloudy-feature-zone">
        <div className="cloudy-section-heading">
          <span>Survive Build Dominate</span>
          <h2>BUILT TO FEEL PREMIUM</h2>
          <p>Cloudy keeps the dark Rust atmosphere and pushes it through a clean blue visual identity.</p>
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

      <StoreShowcase />

      <section className="cloudy-content-section cloudy-community-zone">
        <div className="cloudy-community-card">
          <div className="cloudy-community-logo">
            <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={92} height={92} />
          </div>
          <span>Survive Build Dominate</span>
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
