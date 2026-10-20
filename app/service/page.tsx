'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { cloudyWebsiteProducts, type CloudyWebsitePackageKey } from '@/lib/cloudy-service-products';
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

type WebsiteOrder = {
  kind: 'website';
  packageKey: CloudyWebsitePackageKey;
  pages: number;
  price: number;
};

type OrderSelection = WebsiteOrder;

export default function ServicePage() {
  const cart = useCart();
  const router = useRouter();

  const [selection, setSelection] = useState<OrderSelection | null>(null);
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');
  const [copied, setCopied] = useState('');

  const openWebsiteOrder = (item: Package) => {
    setSelection({ kind: 'website', packageKey: item.key, pages: item.pages, price: item.price });
    setStep('form');
    setCopied('');
  };

  const closeOrder = () => {
    setSelection(null);
    setStep('form');
    setCopied('');
  };

  const orderName = selection ? `Cloudy Studio — ${selection.packageKey}` : '';

  const orderSummary = selection
    ? [
        'Cloudy Studio — Order',
        `Selection: ${orderName}`,
        `Pages: ${selection.pages}`,
        `Price: €${selection.price.toLocaleString('en-GB')}`,
        `Name: ${fullName || 'Not entered'}`,
        `Email: ${email || 'Not entered'}`,
        `Project: ${project || 'Not specified'}`,
      ].join('\n')
    : '';

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderSummary);
      setCopied('Order details copied.');
    } catch {
      setCopied('Copy is unavailable in this browser.');
    }
  };

  const addWebsiteToBasket = () => {
    if (!selection) return;

    const product = cloudyWebsiteProducts[selection.packageKey];
    cart.addItem(product, 1, {
      customer_name: fullName,
      customer_email: email,
      project_description: project,
    });

    try {
      const current = JSON.parse(localStorage.getItem('checkout_form_data') || '{}');
      localStorage.setItem('checkout_form_data', JSON.stringify({ ...current, email }));
    } catch {
      localStorage.setItem('checkout_form_data', JSON.stringify({ email }));
    }

    closeOrder();
    router.push('/cart');
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.eyebrow}>Cloudy Studio</div>
          <h1>Your next website.<br /><em>Made to stand out.</em></h1>
          <p>
            Professional websites built around your brand. Choose a package and order directly.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#websites">View website packages</a>
            <a className={styles.secondaryButton} href="#process">How it works</a>
          </div>

          <div className={styles.highlights}>
            <div><strong>5–12 pages</strong><span>Included by package</span></div>
            <div><strong>Responsive</strong><span>Built for every screen</span></div>
            <div><strong>Cloudy quality</strong><span>Professional by design</span></div>
          </div>
        </div>
      </section>

      <section id="websites" className={styles.section}>
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
                className={`${styles.packageCard} ${item.featured ? styles.featured : ''}`}
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
                  <button
                    type="button"
                    className={styles.buyButton}
                    onClick={() => openWebsiteOrder(item)}
                  >
                    Buy
                  </button>
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

      <section id="process" className={styles.section}>
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <div className={styles.eyebrow}>Simple process</div>
            <h2>From package to launch.</h2>
            <p>A straightforward path with no required consultation before buying a website package.</p>
          </header>

          <div className={styles.steps}>
            <article>
              <strong>Choose your package</strong>
              <p>Compare the pages and features and choose the website that fits your needs.</p>
            </article>
            <article>
              <strong>Tell us about your project</strong>
              <p>Enter your name, email and a short explanation of what you want the website to do.</p>
            </article>
            <article>
              <strong>Continue through Cloudy checkout</strong>
              <p>Your website order is added to the normal Cloudy basket and checkout flow.</p>
            </article>
          </div>
        </div>
      </section>

      {selection && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="order-title" onMouseDown={event => {
          if (event.target === event.currentTarget) closeOrder();
        }}>
          <div className={styles.dialog}>
            <button className={styles.close} type="button" onClick={closeOrder} aria-label="Close">×</button>
            <h2 id="order-title">{step === 'form' ? 'Start your order' : 'Review your order'}</h2>
            <p>Review your package and enter the details needed to start.</p>

            <div className={styles.orderInfo}>
              <strong>{orderName}</strong>
              <span>{selection.pages} pages · €{selection.price.toLocaleString('en-GB')}</span>
            </div>

            {step === 'form' ? (
              <form onSubmit={event => {
                event.preventDefault();
                setStep('review');
              }}>
                <label htmlFor="service-order-name">Full name</label>
                <input
                  id="service-order-name"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />

                <label htmlFor="service-order-email">Email address</label>
                <input
                  id="service-order-email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                <label htmlFor="service-order-project">Tell us about your project</label>
                <textarea
                  id="service-order-project"
                  value={project}
                  onChange={event => setProject(event.target.value)}
                  required
                  placeholder="What would you like us to build?"
                />

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={closeOrder}>Cancel</button>
                  <button type="submit" className={styles.primaryButton}>Review order</button>
                </div>
              </form>
            ) : (
              <div>
                <pre className={styles.reviewText}>{orderSummary}</pre>
                <div className={styles.previewNotice}>
                  Preview mode: website packages can continue through the Cloudy basket and checkout,
                  but the final payment action stays disabled until you approve this preview.
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setStep('form')}>Back</button>
                  <button type="button" className={styles.secondaryButton} onClick={copyOrder}>Copy order details</button>
                  <button type="button" className={styles.primaryButton} onClick={addWebsiteToBasket}>
                    Continue to basket
                  </button>
                </div>
                {copied && <p className={styles.copied} role="status">{copied}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
