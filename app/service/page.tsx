import {
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import styles from './service.module.css';

const services = [
  {
    key: 'vpn',
    kicker: 'Privacy',
    title: 'Cloudy VPN',
    description: 'A privacy-focused VPN experience built around speed, simplicity and control.',
    status: 'Coming soon',
    href: null,
    icon: ShieldCheck,
    features: ['Private connection', 'Fast routing', 'Simple setup'],
  },
  {
    key: 'ai',
    kicker: 'Cloudy artificial intelligence',
    title: 'Dylano AI',
    description: 'Cloudy’s AI experience for focused conversations, tools and everyday work — built as part of the Cloudy ecosystem.',
    status: 'Explore',
    href: 'https://dylano-ai.vercel.app',
    icon: BrainCircuit,
    features: ['Cloudy ecosystem', 'Focused interface', 'Built to grow'],
  },
  {
    key: 'web',
    kicker: 'Cloudy web development',
    title: 'Cloudy Studio',
    description: 'Custom Cloudy-built websites for businesses, brands and ideas — designed, developed and delivered with the same Cloudy standard.',
    status: 'View studio',
    href: 'https://dylano-webstudio-ltv564dze-cloudystore.vercel.app',
    icon: Code2,
    features: ['Cloudy design', 'Responsive build', 'From idea to launch'],
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
          Privacy, artificial intelligence and web development — brought together in one place
          with the same focus on quality, precision and experience.
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
            <span>What we build</span>
            <h2 id="services-title">Choose a service</h2>
          </div>
          <p>Three focused service areas. One Cloudy standard.</p>
        </header>

        <div className={styles.grid}>
          {services.map((service, index) => {
            const Icon = service.icon;
            const content = (
              <>
                <div className={styles.cardTop}>
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={service.href ? styles.available : styles.soon}>
                    {service.status}
                  </span>
                </div>

                <div className={styles.iconShell}>
                  <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
                </div>

                <div className={styles.cardCopy}>
                  <span className={styles.kicker}>{service.kicker}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                <div className={styles.features}>
                  {service.features.map(feature => <span key={feature}>{feature}</span>)}
                </div>

                <div className={styles.cardFoot}>
                  <span>{service.href ? 'Open service' : 'In development'}</span>
                  {service.href && <ArrowUpRight size={18} aria-hidden="true" />}
                </div>
              </>
            );

            return service.href ? (
              <a
                key={service.key}
                href={service.href}
                target="_blank"
                rel="noreferrer"
                className={`${styles.card} cloudy-traced-panel`}
              >
                {content}
              </a>
            ) : (
              <article
                key={service.key}
                className={`${styles.card} ${styles.disabled} cloudy-traced-panel`}
              >
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.statement}>
        <div className={`${styles.statementPanel} cloudy-traced-panel`}>
          <div>
            <span>Cloudy standard</span>
            <h2>Clean. Focused. Built with purpose.</h2>
          </div>
          <p>
            Every service keeps the same direction: a polished experience, clear design and
            technology that feels simple to use.
          </p>
        </div>
      </section>
    </main>
  );
}
