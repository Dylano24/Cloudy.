import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';
import styles from './store-showcase-v2.module.css';

const packages = [
  {
    title: 'VIP',
    subtitle: 'Starter Rust rank',
    badge: 'Monthly Rank',
    featured: false,
    features: [
      'Queue Skip priority',
      'VIP daily kit',
      '2 extra homes',
      'Furnace Splitter access',
      'Skinbox access',
      'Faster crafting queue',
    ],
  },
  {
    title: 'ELITE',
    subtitle: 'High-tier Rust rank',
    badge: 'Includes VIP',
    featured: true,
    features: [
      'Everything included in VIP',
      'Higher Queue Skip priority',
      'Elite PvP kit',
      '5 extra homes',
      '/remove building tool',
      'Quick Smelt access',
    ],
  },
  {
    title: 'BASE DEFENDER',
    subtitle: 'Raid defense loadout',
    badge: 'Utility Kit',
    featured: false,
    features: [
      'HQM and armored building supplies',
      'Garage doors and code locks',
      'Shotgun traps with ammunition',
      'Meds and combat supplies',
      'Raid defense utilities',
      '36h kit cooldown',
    ],
  },
] as const;

export function StoreShowcase() {
  return (
    <section className={styles.showcase} id="store">
      <div className={styles.hero}>
        <video
          className={styles.video}
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

        <div className={styles.fallback} aria-hidden="true" />
        <div className={styles.blue} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grid} aria-hidden="true" />

        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Cloudy premium store</span>
          <h2>
            DOMINATE THE <span>BATTLEFIELD</span>
          </h2>
          <p>
            Upgrade your Cloudy experience with Rust-focused ranks, queue priority,
            combat kits and quality-of-life perks built for the server.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className="cloudy-cta-primary">
              Browse Store <ArrowRight size={18} />
            </Link>
            <a href="#cloudy-vip" className="cloudy-cta-secondary">
              View Ranks
            </a>
          </div>
        </div>
      </div>

      <div className={styles.shell} id="cloudy-vip">
        <div className={styles.rankHeading}>
          <span>Cloudy Rust upgrades</span>
          <h3>CHOOSE YOUR LOADOUT</h3>
          <p>Rust-focused ranks and utility kits with a clean Cloudy blue presentation.</p>
        </div>

        <div className={styles.rankGrid}>
          {packages.map(({ title, subtitle, badge, features, featured }) => (
            <article key={title} className={`${styles.rankCard}${featured ? ` ${styles.featured}` : ''}`}>
              {featured && <div className={styles.ribbon}>Cloudy Recommended</div>}

              <div className={styles.topline}>
                <span>{badge}</span>
                <b>CLOUDY RUST</b>
              </div>

              <div className={styles.emblem}>
                <div className={styles.logoBadge}>
                  <Image
                    src="/images/cloudy-c.svg"
                    alt="Cloudy C"
                    width={82}
                    height={82}
                    className={styles.logoImage}
                  />
                </div>
              </div>

              <h4>{title}</h4>
              <p>{subtitle}</p>
              <div className={styles.divider} />

              <ul>
                {features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/shop" className={styles.rankButton}>
                View Package <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <div className={styles.products}>
          <div className={styles.productsHeading}>
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
