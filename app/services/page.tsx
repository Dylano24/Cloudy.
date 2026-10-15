import Link from 'next/link';
import styles from './services.module.css';

const services = [
  {
    number: '01',
    title: 'Cloudy VPN',
    badge: 'In development',
    description: 'A privacy-first VPN experience built around speed, simplicity and a clean Cloudy client.',
    points: ['Fast infrastructure', 'Simple client experience', 'Cloudy ecosystem'],
  },
  {
    number: '02',
    title: 'Discord bots',
    badge: 'Available',
    description: 'Custom bots for moderation, tickets, logging, roles, automations and community workflows.',
    points: ['Custom commands', 'Moderation & logging', 'API integrations'],
  },
  {
    number: '03',
    title: 'Websites',
    badge: 'Available',
    description: 'Modern responsive websites with a strong identity, clear UX and production-ready delivery.',
    points: ['Custom design', 'Responsive build', 'Deployment support'],
  },
  {
    number: '04',
    title: 'Discord servers',
    badge: 'Available',
    description: 'Complete server setups with structure, permissions, moderation, onboarding and ticket systems.',
    points: ['Roles & permissions', 'Moderation structure', 'Onboarding & tickets'],
  },
  {
    number: '05',
    title: 'AI & automation',
    badge: 'Custom',
    description: 'AI assistants and automations for support, workflows, communities and repetitive tasks.',
    points: ['AI assistants', 'Workflow automation', 'Custom integrations'],
  },
] as const;

export default function ServicesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <section className={styles.hero}>
        <span className={styles.eyebrow}><i />Cloudy services</span>

        <div className={styles.heroGrid}>
          <h1>We build <em>digital systems.</em></h1>

          <div className={styles.heroCopy}>
            <p>
              From Discord infrastructure to websites, AI and our own VPN,
              Cloudy turns ideas into polished products and working systems.
            </p>
            <Link href="#services" className={styles.primary}>
              Explore services <span>↓</span>
            </Link>
          </div>
        </div>

        <div className={styles.signal} aria-label="Cloudy service process">
          <span>Design</span><i />
          <span>Build</span><i />
          <span>Automate</span><i />
          <span>Launch</span>
        </div>
      </section>

      <section id="services" className={styles.services} aria-labelledby="services-title">
        <header className={styles.sectionHeader}>
          <div>
            <span>WHAT CLOUDY BUILDS</span>
            <h2 id="services-title">Services with a purpose.</h2>
          </div>
          <p>No generic packages. Each build starts with what you actually need.</p>
        </header>

        <div className={styles.serviceGrid}>
          {services.map((service, index) => (
            <article key={service.title} className={`${styles.card} ${index === 0 ? styles.featured : ''}`}>
              <div className={styles.cardHead}>
                <span>{service.number}</span>
                <b>{service.badge}</b>
              </div>

              <div className={styles.mark} aria-hidden="true">
                <i /><i /><i />
              </div>

              <h3>{service.title}</h3>
              <p>{service.description}</p>

              <ul>
                {service.points.map(point => <li key={point}>{point}</li>)}
              </ul>

              <Link href="/support" className={styles.cardCta}>
                Request this service <span>↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <div>
          <span className={styles.kicker}>HOW IT WORKS</span>
          <h2 id="process-title">Clear from request to launch.</h2>
        </div>

        <div className={styles.timeline}>
          <article><b>01</b><div><h3>Tell us what you need</h3><p>Share the goal, problem or idea. We keep the first step simple.</p></div></article>
          <article><b>02</b><div><h3>Scope & proposal</h3><p>We define what gets built, what it includes and how delivery works.</p></div></article>
          <article><b>03</b><div><h3>Build & refine</h3><p>Cloudy builds the service and tightens the details before delivery.</p></div></article>
          <article><b>04</b><div><h3>Launch</h3><p>You get the finished result with the agreed handoff and support.</p></div></article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <span className={styles.kicker}>START A PROJECT</span>
          <h2>Have something specific in mind?</h2>
          <p>Tell Cloudy what you want to build. We&apos;ll take it from there.</p>
        </div>
        <Link href="/support" className={styles.bigCta}>
          Start a request <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
