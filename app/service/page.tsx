'use client';

import { type CloudyWebsitePackageKey } from '@/lib/cloudy-service-products';
import { StudioMobilePanelSync } from '@/components/service/studio-mobile-panel-sync';
import { WebsiteOrderPopover } from '@/components/service/website-order-popover';
import styles from './service.module.css';

type Package = {
  key: CloudyWebsitePackageKey;
  label: string;
  description: string;
  pages: number;
  price: number;
  features: string[];
  details: string;
  featured?: boolean;
};

const packages: Package[] = [
  {
    key: 'Starter',
    label: 'Get started',
    description: 'A complete, polished online presence for individuals, creators and new businesses.',
    pages: 5,
    price: 750,
    features: [
      'Custom website design',
      'Responsive layout',
      'Contact form setup',
      'Basic SEO setup',
      'Social media links',
      'Five complete pages',
    ],
    details: 'Example pages: Home, About, Services, FAQ and Contact. Your website is designed to work on phones, tablets and computers. The basic SEO setup gives search engines clear page titles, descriptions and structure. Domain, hosting and ongoing maintenance are separate.',
  },
  {
    key: 'Business',
    label: 'Most popular',
    description: 'A stronger digital presence for growing businesses that need more room to showcase their work.',
    pages: 8,
    price: 1500,
    features: [
      'Everything in Starter',
      'Enhanced animations and interactions',
      'Portfolio or gallery',
      'Additional forms',
      'Improved page structure',
      'Eight complete pages',
    ],
    details: 'Example pages: Home, About, Services, Service Details, Portfolio, Testimonials, FAQ and Contact. You receive more room for content, smoother interactions and clearer ways for visitors to contact or buy from your business.',
    featured: true,
  },
  {
    key: 'Premium',
    label: 'Advanced',
    description: 'An expansive, highly refined website for established brands and ambitious projects.',
    pages: 12,
    price: 2500,
    features: [
      'Everything in Business',
      'Advanced visual interactions',
      'Expanded landing pages',
      'Additional customization',
      'Priority design refinements',
      'Twelve complete pages',
    ],
    details: 'Built for larger websites with multiple services, campaigns or detailed content. The package gives more design freedom and more complete pages. Ecommerce, custom dashboards and paid third-party services are not automatically included unless they are added separately.',
  },
];

export default function ServicePage() {
  const scrollToSection = (id: 'websites' | 'process') => {
    const target = document.getElementById(id);
    if (!target) return;

    const header = document.querySelector<HTMLElement>('.cloudy-header');
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 14;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    });
  };





  return (
    <main className={`${styles.page} cloudy-studio-page`}>
      <StudioMobilePanelSync />
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.eyebrow}>Cloudy Studio</div>
          <h1>A website<br /><em>built for you.</em></h1>
          <p>
            Professional websites built around your brand. Choose a package and order directly.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} type="button" onClick={() => scrollToSection('websites')}>
              View website packages
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => scrollToSection('process')}>
              How it works
            </button>
          </div>
        </div>
      </section>

      <section id="websites" className={`${styles.section} ${styles.websitesSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>Website development</div>
            <h2>Choose what fits your vision.</h2>
            <p>Choose your package, see what is included and buy directly.</p>
          </header>

          <div className={styles.packageGrid}>
            {packages.map(item => (
              <article
                key={item.key}
                className={`${styles.packageCard} ${item.featured ? styles.featured : ''} cloudy-traced-panel cloudy-studio-sheen-panel`}
              >
                <span className={styles.pill}>{item.label}</span>
                <h3>{item.key}</h3>
                <p className={styles.packageDescription}>{item.description}</p>
                <div className={styles.price}>€{item.price.toLocaleString('en-GB')}</div>
                <div className={styles.priceNote}>One-time website development</div>

                <div className={styles.features}>
                  {item.features.map(feature => (
                    <div className={styles.feature} key={feature}>
                      <span className={styles.check}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <details className={styles.packageDetails}>
                  <summary>See everything included</summary>
                  <p>{item.details}</p>
                </details>

                <div className={styles.cardBottom}>
                  <WebsiteOrderPopover
                    packageKey={item.key}
                    pages={item.pages}
                    price={item.price}
                  />
                </div>
              </article>
            ))}
          </div>

          <p className={styles.note}>
            The package price is fixed for the features listed above. Anything outside the package
            is never added automatically and would require separate approval.
          </p>
        </div>
      </section>

      <section id="process" className={`${styles.section} ${styles.processSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>Simple process</div>
            <h2>From package to launch.</h2>
            <p>A straightforward path with no required consultation before buying a website package.</p>
          </header>

          <div className={styles.steps}>
            <article className="cloudy-traced-panel cloudy-studio-sheen-panel">
              <strong>Choose your package</strong>
              <p>Compare the pages and features and choose the website that fits your needs.</p>
            </article>
            <article className="cloudy-traced-panel cloudy-studio-sheen-panel">
              <strong>Tell us about your project</strong>
              <p>Enter your name, email and a short explanation of what you want the website to do.</p>
            </article>
            <article className="cloudy-traced-panel cloudy-studio-sheen-panel">
              <strong>Continue through Cloudy checkout</strong>
              <p>Your website order is added to the normal Cloudy basket and checkout flow.</p>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
}
