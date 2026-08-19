import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';
import styles from './store-showcase-v2.module.css';

const packages = [
  {
    title: 'BASIC',
    subtitle: 'Essential combat starter',
    badge: 'Starter Rank',
    featured: false,
    features: [
      'Queue Skip priority',
      'Semi-Automatic Rifle loadout',
      'Thompson loadout',
      '1x C4',
      '4x Satchel Charges',
      '1,000 HQM',
      '15,000 Basic Building Materials',
      'Medical combat supplies',
      '24h claim cooldown',
    ],
  },
  {
    title: 'VIP',
    subtitle: 'High-value raid rank',
    badge: 'Raid Rank',
    featured: true,
    features: [
      'Everything included in BASIC',
      'Higher Queue Skip priority',
      'Assault Rifle (AK) loadout',
      'MP5 loadout',
      '4x C4',
      '8x Rockets',
      '2,500 HQM',
      '1x Auto Turret',
      '25,000 Basic Building Materials',
      'Medical combat supplies',
      '24h claim cooldown',
    ],
  },
  {
    title: 'ULTIMATE',
    subtitle: 'Maximum raid & defense power',
    badge: 'Ultimate Rank',
    featured: false,
    features: [
      'Everything included in VIP',
      'Highest Queue Skip priority',
      'Assault Rifle (AK) loadout',
      'MP5 loadout',
      '6x C4',
      '12x Rockets',
      '4,000 HQM',
      '2x Auto Turrets',
      '4x Shotgun Traps',
      '2x Armored Doors',
      '4x Garage Doors',
      '30,000 Basic Building Materials',
      'Turret ammo & electrical parts',
      'Medical combat supplies',
      '24h claim cooldown',
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
          poster="/images/rust-user-background.jpg"
        >
          <source src="/videos/cloudy-rust-bg.mp4" type="video/mp4" />
          <source src="/videos/cloudy-rust-bg.webm" type="video/webm" />
        </video>

        <div
          className={styles.fallback}
          style={{ backgroundImage: "url('/images/rust-user-background.jpg')" }}
          aria-hidden="true"
        />
        <div className={styles.blue} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grid} aria-hidden="true" />

        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Survive Build Dominate</span>
          <h2>
            DOMINATE THE <span>BATTLEFIELD</span>
          </h2>
          <p>
            Every player already gets the free kit and blueprints. Cloudy upgrades focus on
            high-value weapons, explosives, HQM, turrets and serious raid or defense power.
            Every package can be claimed once every 24 hours.
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
          <span>Survive Build Dominate</span>
          <h3>CHOOSE YOUR LOADOUT</h3>
          <p>
            Free kit and blueprints are already standard. These packages focus on combat, boom,
            HQM, resources and base defense, with a 24-hour claim cooldown on every package.
          </p>
        </div>

        <div className={styles.rankGrid}>
          {packages.map(({ title, subtitle, badge, features, featured }) => (
            <article key={title} className={`${styles.rankCard}${featured ? ` ${styles.featured}` : ''}`}>
              {featured && <div className={styles.ribbon}>Cloudy Recommended</div>}

              <div className={styles.topline}>
                <span>{badge}</span>
                <b>SURVIVE BUILD DOMINATE</b>
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
            <span>Survive Build Dominate</span>
            <h3>ALL CLOUDY PACKAGES</h3>
            <p>Your actual Tip4Serv products stay connected below these showcase cards.</p>
          </div>
          <ProductsGrid />
        </div>
      </div>
    </section>
  );
}
