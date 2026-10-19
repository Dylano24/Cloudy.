import {
  BrainCircuit,
  Code2,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import styles from './service.module.css';

const studioUrl = 'https://dylano-webstudio-h81p3t0g7-cloudystore.vercel.app';

const services = [
  {
    key: 'vpn',
    kicker: 'Privacy',
    title: 'Cloudy VPN',
    description: 'A private internet connection designed to be simple to use. Cloudy VPN is still being built.',
    status: 'Coming soon',
    viewHref: null,
    buyHref: null,
    viewLabel: null,
    icon: ShieldCheck,
    features: ['Private connection', 'Simple setup', 'Cloudy experience'],
  },
  {
    key: 'ai',
    kicker: 'Artificial intelligence',
    title: 'Dylano AI',
    description: 'Cloudy’s AI product for conversations, tools and everyday tasks in one focused interface.',
    status: 'Available',
    viewHref: 'https://dylano-ai.vercel.app',
    buyHref: null,
    viewLabel: 'View Dylano AI',
    icon: BrainCircuit,
    features: ['AI workspace', 'Simple interface', 'Part of Cloudy'],
  },
  {
    key: 'web',
    kicker: 'Websites',
    title: 'Cloudy Studio',
    description: 'Choose a website package, see exactly what is included and buy it directly. No call or discussion is required first.',
    status: 'Available',
    viewHref: studioUrl,
    buyHref: `${studioUrl}#prijzen`,
    viewLabel: 'View website',
    icon: Code2,
    features: ['Clear packages', 'View before buying', 'Direct checkout'],
  },
] as const;

export default function ServicePage() {
  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Cloudy services
        </div>

        <h1>
          Built beyond
          <span> the game.</span>
        </h1>

        <p>
          Cloudy products and services in one place. Each option explains what it does in plain
          language, so you know what you are opening or buying.
        </p>

        <div className={styles.heroMeta} aria-label="Cloudy service areas">
          <span><LockKeyhole size={15} /> VPN</span>
          <span><Sparkles size={15} /> AI</span>
          <span><Globe2 size={15} /> Websites</span>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="services-title">
        <header className={styles.sectionHeader}>
          <div>
            <span>What Cloudy offers</span>
            <h2 id="services-title">Choose what you need</h2>
          </div>
          <p>Open a service to learn more. Website packages can be bought directly.</p>
        </header>

        <div className={styles.grid}>
          {services.map(service => {
            const Icon = service.icon;
            return (
              <article
                key={service.key}
                className={`${styles.card} ${!service.viewHref ? styles.disabled : ''} cloudy-traced-panel`}
              >
                <div className={styles.cardTop}>
                  <span className={service.viewHref ? styles.available : styles.soon}>
                    {service.status}
                  </span>
                </div>

                <div className={styles.iconShell}>
                  <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                </div>

                <div className={styles.cardCopy}>
                  <span className={styles.kicker}>{service.kicker}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                <div className={styles.features}>
                  {service.features.map(feature => <span key={feature}>{feature}</span>)}
                </div>

                <div className={styles.cardActions}>
                  {service.viewHref ? (
                    <a
                      href={service.viewHref}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.viewButton}
                    >
                      {service.viewLabel}
                    </a>
                  ) : (
                    <span className={styles.unavailable}>Not available yet</span>
                  )}

                  {service.buyHref && (
                    <a
                      href={service.buyHref}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.buyButton}
                    >
                      Buy website
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.statement}>
        <div className={`${styles.statementPanel} cloudy-traced-panel`}>
          <div>
            <span>Cloudy standard</span>
            <h2>Clear first. Professional second.</h2>
          </div>
          <p>
            No unexplained labels or unnecessary steps. Each service should tell you what it is,
            what you get and what the next button will do.
          </p>
        </div>
      </section>
    </main>
  );
}
