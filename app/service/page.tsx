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
    description: 'A complete, professional website for individuals, creators and growing ideas.',
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
    details: 'A strong foundation for a professional online presence. Example pages can include Home, About, Services, FAQ and Contact. The website is designed for phones, tablets and computers. Domain, hosting and ongoing maintenance are separate.',
  },
  {
    key: 'Business',
    label: 'Most popular',
    description: 'A more complete website for businesses that need additional pages, presentation and interaction.',
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
    details: 'Designed for growing businesses that need more space to explain services, present work and guide visitors clearly. Example pages can include Home, About, Services, Service Details, Portfolio, Testimonials, FAQ and Contact.',
    featured: true,
  },
  {
    key: 'Premium',
    label: 'Advanced',
    description: 'A larger, highly refined website for established brands and more ambitious projects.',
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
    details: 'Built for larger websites with multiple services, campaigns or more detailed content. The package provides greater design flexibility, more complete pages and additional refinement. Ecommerce, custom dashboards and paid third-party services are not automatically included unless added separately.',
  },
];

const processSteps = [
  {
    title: 'Choose your package',
    text: 'Choose your preferred package and add any optional features or services that are relevant to your project.',
  },
  {
    title: 'Share your vision',
    text: 'Tell us about your ideas, goals, preferences and vision. The more we understand your expectations, the more precisely we can shape the final result around them.',
  },
  {
    title: 'Place your order',
    text: 'Complete your order and submit your project details. We will contact you within one business day to review your requirements, finalise the project plan and confirm the next steps.',
  },
  {
    title: 'Delivery & timeline',
    text: 'Most projects take around 2–3 weeks. Your estimated delivery timeframe is confirmed once the project plan is established. Simpler projects may be completed sooner, while more complex work can require additional time. Expedited delivery is available on request for an additional 20% of the total project cost, subject to availability and project complexity.',
  },
] as const;

const faqs = [
  {
    question: 'How long does a website project usually take?',
    answer: 'Most projects take around 2–3 weeks. The expected delivery timeframe is confirmed after your requirements have been reviewed and the project plan has been established.',
  },
  {
    question: 'Can I request faster delivery?',
    answer: 'Yes. Expedited delivery can be requested for an additional 20% of the total project cost. Availability depends on the project scope, complexity and current workload.',
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
          <h2>Websites designed for your ambitions.</h2>
          <p>
            Explore our website creation packages and discover a range of additional features,
            services and ongoing support options.
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
            <div className={styles.eyebrow}>Built around your project</div>
            <h2>Crafted around your needs</h2>
            <p>
              Every project is different. That is why we offer flexible website development
              packages tailored to your needs, goals and vision.
            </p>
            <p>
              Whether you are looking for a simple, professional website or a more advanced,
              fully customised solution, explore the possibilities and choose the features that
              best suit your project.
            </p>
          </div>
        </div>
      </section>

      <section id="packages" className={`${styles.section} ${styles.websitesSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>Website packages</div>
            <h2>Choose the right foundation.</h2>
            <p>
              Start with the package that best matches your project. Each option can be reviewed
              in detail before you order.
            </p>
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
                  <WebsiteOrderPopover packageKey={item.key} pages={item.pages} price={item.price} />
                </div>
              </article>
            ))}
          </div>

          <p className={styles.note}>
            Anything outside the selected package is discussed and approved before additional work
            or costs are added.
          </p>
        </div>
      </section>

      <section id="process" className={`${styles.section} ${styles.processSection}`}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>How it works</div>
            <h2>Your project, made simple.</h2>
            <p>From choosing your package to bringing your vision to life.</p>
          </header>

          <div className={styles.processGrid}>
            {processSteps.map(step => (
              <article key={step.title} className={`${styles.processCard} cloudy-traced-panel cloudy-studio-sheen-panel`}>
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
            <div className={styles.eyebrow}>Support</div>
            <h2>Frequently asked questions</h2>
            <p>Clear answers to the most common questions before starting your project.</p>
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
