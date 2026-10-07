import Link from 'next/link';
import { ArrowRight, Headphones, Layers3, Server, ShieldCheck, Users2 } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

const ecosystem = [
  { title: 'Games', detail: 'Projects created and operated by Cloudy', icon: Layers3 },
  { title: 'Servers', detail: 'Gaming infrastructure operated by Cloudy', icon: Server },
  { title: 'Community', detail: 'The Cloudy community and Discord', icon: Users2 },
  { title: 'Support', detail: 'Help when you need it', icon: Headphones },
] as const;

export default function HomePage() {
  return (
    <div className="cloudy-new-home">
      <section className="cloudy-new-shell cloudy-new-hero">
        <div>
          <p className="cloudy-new-eyebrow">CLOUDY INC. · GAMING COMPANY</p>
          <h1 className="cloudy-new-title">WHERE GAMES<br />MEET <span>QUALITY.</span></h1>
          <p className="cloudy-new-lede">Perfected through detail. Designed for excellence.</p>
          <p className="cloudy-new-description">
            Cloudy is a gaming company focused on developing and operating within the gaming industry.
            Rust is our first project, supported by digital services, a dedicated website and a community
            that brings the Cloudy platform together.
          </p>
          <div className="cloudy-new-actions">
            <a href="#games" className="cloudy-cta-primary">Explore Cloudy Rust <ArrowRight size={16} /></a>
            <Link href="/shop" className="cloudy-cta-secondary">Visit the store</Link>
          </div>
        </div>

        <div className="cloudy-new-logo-panel">
          <img src="/images/cloudy-c.svg" alt="Cloudy C logo" />
          <span className="cloudy-new-logo-caption">CLOUDY INC.</span>
          <span className="cloudy-new-logo-index">01 / COMPANY</span>
        </div>
      </section>

      <section className="cloudy-new-shell cloudy-new-strip">
        <div>
          <p className="cloudy-new-eyebrow">THE CLOUDY COMMUNITY</p>
          <h2 className="cloudy-new-section-title">Join the community</h2>
          <p className="cloudy-new-sidecopy" style={{ marginTop: 12 }}>Discord is part of the Cloudy experience.</p>
        </div>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-cta-secondary">
          Discord · Join us <ArrowRight size={15} />
        </a>
      </section>

      <section id="games" className="cloudy-new-shell cloudy-new-section">
        <div className="cloudy-new-section-heading">
          <div>
            <p className="cloudy-new-eyebrow">CLOUDY PROJECTS</p>
            <h2 className="cloudy-new-section-title">CHOOSE YOUR GAME</h2>
          </div>
          <p className="cloudy-new-sidecopy">Explore our games, servers and exclusive content.</p>
        </div>

        <Link href="/shop" className="cloudy-new-project" aria-label="View Cloudy Rust servers and kits">
          <div className="cloudy-new-project-art" />
          <div className="cloudy-new-project-copy">
            <p className="cloudy-new-eyebrow">CLOUDY PROJECT</p>
            <h3 className="cloudy-new-project-title">CLOUDY <span>RUST</span></h3>
            <p className="cloudy-new-project-tagline">BUILD. COMPETE. DOMINATE.</p>
            <span className="cloudy-new-project-action">View servers &amp; kits <ArrowRight size={16} /></span>
          </div>
          <span className="cloudy-new-project-number">01</span>
        </Link>
      </section>

      <section className="cloudy-new-shell cloudy-new-section">
        <div className="cloudy-new-section-heading">
          <div>
            <p className="cloudy-new-eyebrow">THE CLOUDY ECOSYSTEM</p>
            <h2 className="cloudy-new-section-title">Inside Cloudy</h2>
          </div>
          <p className="cloudy-new-sidecopy">Discover the games, servers and experiences created and operated by Cloudy.</p>
        </div>

        <div className="cloudy-new-ecosystem">
          {ecosystem.map(({ title, detail, icon: Icon }, index) => (
            <article key={title}>
              <span className="cloudy-new-ecosystem-index">{String(index + 1).padStart(2, '0')}</span>
              <Icon size={20} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cloudy-new-shell cloudy-new-section cloudy-new-future">
        <div>
          <p className="cloudy-new-eyebrow">BUILT TO GROW</p>
          <h2 className="cloudy-new-section-title">The future of Cloudy</h2>
        </div>
        <p className="cloudy-new-sidecopy">
          Cloudy is designed to grow beyond its first project. Future projects will be shared here when they are confirmed.
        </p>
        <p className="cloudy-new-signoff">QUALITY. INNOVATION. PERFORMANCE.</p>
      </section>
    </div>
  );
}
