import Link from 'next/link';
import { ArrowRight, Check, Crown, Shield, Star } from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';

const packages = [
  {
    title: 'VIP',
    subtitle: 'Starter access',
    icon: Star,
    badge: 'Entry',
    features: ['Starter kit access', 'Queue priority', 'Cloudy supporter tag', 'Exclusive starter perks'],
  },
  {
    title: 'ELITE',
    subtitle: 'The popular choice',
    icon: Shield,
    badge: 'Most Popular',
    featured: true,
    features: ['Elite kit access', 'Higher queue priority', 'Exclusive Cloudy perks', 'Extra in-game rewards'],
  },
  {
    title: 'LEGEND',
    subtitle: 'Top tier status',
    icon: Crown,
    badge: 'Top Tier',
    features: ['Legend kit access', 'Highest queue priority', 'Premium server perks', 'Maximum Cloudy status'],
  },
] as const;

export function StoreShowcase() {
  return (
    <section className="cloudy-store-showcase" id="store">
      <div className="cloudy-store-video-hero">
        <video
          className="cloudy-store-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/cloudy-battlefield.svg"
        >
          <source src="/videos/cloudy-rust-bg.mp4" type="video/mp4" />
          <source src="/videos/cloudy-rust-bg.webm" type="video/webm" />
        </video>

        <div className="cloudy-store-video-fallback" aria-hidden="true" />
        <div className="cloudy-store-video-blue" aria-hidden="true" />
        <div className="cloudy-store-video-vignette" aria-hidden="true" />
        <div className="cloudy-store-video-grid" aria-hidden="true" />

        <div className="cloudy-store-video-content">
          <span className="cloudy-store-eyebrow">Cloudy premium store</span>
          <h2>
            DOMINATE THE <span>BATTLEFIELD</span>
          </h2>
          <p>
            Upgrade your Cloudy experience with premium ranks, kits and perks. Built with a cinematic Rust look and the blue Cloudy identity.
          </p>
          <div className="cloudy-store-video-actions">
            <Link href="/shop" className="cloudy-cta-primary">
              Browse Store <ArrowRight size={18} />
            </Link>
            <a href="#cloudy-vip" className="cloudy-cta-secondary">
              View Ranks
            </a>
          </div>
        </div>
      </div>

      <div className="cloudy-store-shell" id="cloudy-vip">
        <div className="cloudy-rank-heading">
          <span>Cloudy ranks</span>
          <h3>CHOOSE YOUR STATUS</h3>
          <p>Renegade-inspired presentation, rebuilt as a unique Cloudy blue store experience.</p>
        </div>

        <div className="cloudy-rank-grid">
          {packages.map(({ title, subtitle, icon: Icon, badge, features, featured }) => (
            <article key={title} className={`cloudy-rank-card${featured ? ' is-featured' : ''}`}>
              {featured && <div className="cloudy-rank-ribbon">Recommended</div>}
              <div className="cloudy-rank-topline">
                <span>{badge}</span>
                <b>CLOUDY</b>
              </div>
              <div className="cloudy-rank-emblem">
                <span className="cloudy-rank-c">C</span>
                <Icon size={30} />
              </div>
              <h4>{title}</h4>
              <p>{subtitle}</p>
              <div className="cloudy-rank-divider" />
              <ul>
                {features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/shop" className="cloudy-rank-button">
                View Package <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <div className="cloudy-real-products">
          <div className="cloudy-real-products-heading">
            <span>Live catalogue</span>
            <h3>ALL CLOUDY PACKAGES</h3>
            <p>Your actual Tip4Serv products stay connected below these showcase cards.</p>
          </div>
          <ProductsGrid />
        </div>
      </div>
    </section>
  );
}
