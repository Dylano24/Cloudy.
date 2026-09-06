import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';
import styles from './store-showcase-v2.module.css';

const packages = [
  {
    title: 'STARTER',
    subtitle: 'Fast start. Clean pressure.',
    badge: 'Starter',
    featured: false,
    sceneClass: styles.sceneOne,
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
    subtitle: 'High-value raid pressure.',
    badge: 'VIP',
    featured: true,
    sceneClass: styles.sceneTwo,
    features: [
      'Everything included in Starter',
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
    title: 'ELITE',
    subtitle: 'Maximum offensive power.',
    badge: 'Elite',
    featured: false,
    sceneClass: styles.sceneThree,
    features: [
      'Everything included in VIP',
      'Highest Queue Skip priority',
      'Assault Rifle (AK) loadout',
      'MP5 loadout',
      '6x C4',
      '12x Rockets',
      '4,000 HQM',
      '2x Auto Turrets',
      '30,000 Basic Building Materials',
      'Medical combat supplies',
      '24h claim cooldown',
    ],
  },
  {
    title: 'BASE DEFENDER',
    subtitle: 'Built to hold the line.',
    badge: 'Defense',
    featured: false,
    sceneClass: styles.sceneFour,
    features: [
      'Defense-focused loadout',
      'High Queue Skip priority',
      '2x Auto Turrets',
      '4x Shotgun Traps',
      '2x Armored Doors',
      '4x Garage Doors',
      '3,000 HQM',
      'Turret ammo & electrical parts',
      '25,000 Basic Building Materials',
      'Medical combat supplies',
      '24h claim cooldown',
    ],
  },
] as const;

export function StoreShowcase() {
  return (
    <section className={styles.showcase} id="store">
      <div className={styles.hero}>
        <div
          className={styles.fallback}
          style={{ backgroundImage: "url('/images/rust-user-background.jpg')" }}
          aria-hidden="true"
        />
        <div className={styles.heroMotion} aria-hidden="true" />
        <div className={styles.blue} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grid} aria-hidden="true" />

        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Survive Build Dominate</span>
          <h2>
            DOMINATE THE <span>BATTLEFIELD</span>
          </h2>
          <p>
            Cloudy upgrades are built around real raid pressure, fast recovery and stronger defense.
            Pick the loadout that matches the way you play and take it into the next fight.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className="cloudy-cta-primary">
              Open Store <ArrowRight size={18} />
            </Link>
            <a href="#cloudy-vip" className="cloudy-cta-secondary">
              View Kits
            </a>
          </div>
        </div>
      </div>

      <div className={styles.shell} id="cloudy-vip">
        <div className={styles.rankHeading}>
          <span>Cloudy Kits</span>
          <h3>CHOOSE YOUR LOADOUT</h3>
          <p>
            Four clear paths: start fast, raid harder, push elite fights or lock your base down.
          </p>
        </div>

        <div className={styles.rankGrid}>
          {packages.map(({ title, subtitle, badge, features, featured, sceneClass }) => (
            <article key={title} className={`${styles.rankCard}${featured ? ` ${styles.featured}` : ''}`}>
              {featured && <div className={styles.ribbon}>Cloudy Recommended</div>}

              <div className={`${styles.cardScene} ${sceneClass}`} aria-hidden="true">
                <div className={styles.cardSceneImage} />
                <div className={styles.cardSceneGray} />
                <div className={styles.cardSceneShade} />
                <div className={styles.cardScan} />
              </div>

              <div className={styles.cardContent}>
                <div className={styles.topline}>
                  <span>{badge}</span>
                  <b>LIVE LOADOUT</b>
                </div>

                <div className={styles.sceneSpacer} />

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
                  View kit <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.products}>
          <div className={styles.productsHeading}>
            <span>Survive Build Dominate</span>
            <h3>ALL CLOUDY PACKAGES</h3>
            <p>The full Cloudy catalog is shown below.</p>
          </div>
          <ProductsGrid />
        </div>
      </div>
    </section>
  );
}
