'use client';

import { PackageCheck, Lightbulb, ClipboardCheck, Timer } from 'lucide-react';
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
    label: 'Minimum 5 pages',
    description: 'Minimum 5 pages',
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
    details: 'Includes a custom responsive website with five complete pages, contact form setup, basic SEO setup and social media links. The design is tailored to your project. Domain, hosting, ongoing maintenance and features outside this package are not included unless added separately.',
  },
  {
    key: 'Business',
    label: 'Minimum 8 pages',
    description: 'Minimum 8 pages',
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
    details: 'Includes everything in Starter, expanded to eight complete pages with enhanced animations and interactions, a portfolio or gallery, additional forms and improved page structure. Domain, hosting, ongoing maintenance and features outside this package are not included unless added separately.',
    featured: true,
  },
  {
    key: 'Premium',
    label: 'Minimum 12 pages',
    description: 'Minimum 12 pages',
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
    details: 'Includes everything in Business, expanded to twelve complete pages with advanced visual interactions, expanded landing pages, additional customization and priority design refinements. Ecommerce, custom dashboards, paid third-party services, domain, hosting and ongoing maintenance are not included unless added separately.',
  },
];

const processSteps = [
  {
    title: 'Choose your package',
    icon: PackageCheck,
    text: 'Choose your preferred package and add any optional features or services to customise your order.',
  },
  {
    title: 'Share your vision',
    icon: Lightbulb,
    text: 'Tell us about your ideas, goals, preferences, and vision for your project. The more we understand your expectations, the better we can tailor the final result to your vision.',
  },
  {
    title: 'Place your order',
    icon: ClipboardCheck,
    text: "Complete your order and submit your project details. We'll contact you within one business day to discuss your requirements, finalise the project plan, and agree on the next steps.",
  },
  {
    title: 'Delivery & Timeline',
    icon: Timer,
    text: 'Most projects take around 2–3 weeks, with the estimated delivery timeframe confirmed once your project plan is established. Simpler projects may be completed sooner, while complex projects may require more time. Expedited delivery is available upon request for an additional 20% of the total project cost, subject to availability and project complexity.',
  },
] as const;

const faqs = [
  {
    question: 'How long does a website project usually take?',
    answer: 'Most projects take around 2–3 weeks. The expected delivery timeframe is confirmed after your requirements have been reviewed and the project plan has been established.',
  },
  {
    question: 'Can I request faster delivery?',
    answer: 'Yes. Expedited delivery can be requested for an additional 20% of the total project cost.',
  },
  {
    question: 'Can I add features outside the standard package?',
    answer: 'Yes. Optional features and additional services can be discussed and added where suitable. Any extra cost is agreed before the additional work is started.',
  },
  {
    question: 'What happens after I place my order?',
    answer: 'After you submit your order and project details, we will contact you within one business day to review your requirements, finalise the project plan and confirm the next steps.',
  },
  {
    question: 'What information should I provide?',
    answer: 'Share your goals, preferred style, important features, content requirements and any examples or references that help explain your vision. Clear information helps us tailor the website more closely to your expectations.',
  },
  {
    question: 'Are domain, hosting and ongoing maintenance included?',
    answer: 'Domain registration, hosting and ongoing maintenance are separate from the standard website development packages unless they are specifically included as an additional service.',
  },
] as const;

export default function ServicePage() {
  const scrollToSection = (id: 'packages' | 'process') => {
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
          <h1>Web development</h1>
          <h2>Websites designed for your ambitions</h2>
          <p>
            Explore our website creation packages and discover a range of additional features, services, and ongoing support options.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} type="button" onClick={() => scrollToSection('packages')}>
              Explore packages
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => scrollToSection('process')}>
              How it works
            </button>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.introSection}`}>
        <div className={styles.wrap}>
          <div className={`${styles.introPanel} cloudy-traced-panel cloudy-studio-sheen-panel`}>
            <h2>Crafted around your needs</h2>
            <p>
              Every project is different. That’s why we offer flexible website development packages tailored to your needs, goals, and vision.
            </p>
            <p>
              Whether you’re looking for a simple, professional website or a more advanced, fully customized solution, explore the possibilities and find the features that best suit your project.
            </p>
          </div>
        </div>
      </section>

      <section id="packages" className={`${styles.section} ${styles.websitesSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>Website packages</div>
          </header>

          <div className={styles.packageGrid}>
            {packages.map(item => (
              <article
                key={item.key}
                className={`${styles.packageCard} ${item.featured ? styles.featured : ''} cloudy-traced-panel cloudy-studio-sheen-panel`}
              >
                <h3 className={`${styles.pill} ${styles.packageTitle}`}>{item.key}</h3>
                <div className={styles.price}>€{item.price.toLocaleString('en-GB')}</div>
                <div className={styles.priceNote}>Website development</div>

                <div className={styles.features}>
                  {[item.features[0], item.label, ...item.features.slice(1, -1)].map(feature => (
                    <div className={styles.feature} key={feature}>
                      <span className={styles.check}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <details className={styles.packageDetails}>
                  <summary>View package details</summary>
                  <p>{item.details}</p>
                </details>

                <div className={styles.cardBottom}>
                  <WebsiteOrderPopover packageKey={item.key} pages={item.pages} price={item.price} />
                </div>
              </article>
            ))}
          </div>

          <p className={styles.note}>
            Optional features or services can be added separately where available.
          </p>
        </div>
      </section>

      <section id="process" className={`${styles.section} ${styles.processSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>HOW IT WORKS</div>
            <h2>Your project, Made simple.</h2>
            <p>From choosing your package to bringing your vision to life.</p>
          </header>

          <div className={`${styles.processGrid} cloudy-classic-why-grid cloudy-traced-panel cloudy-studio-sheen-panel`}>
            {processSteps.map(step => (
              <article key={step.title} className={styles.processCard}>
                <step.icon size={27} aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faqSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <h2>Frequently asked questions.</h2>
          </header>

          <div className={styles.faqList}>
            {faqs.map(item => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
