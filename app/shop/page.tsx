import Link from 'next/link';
import RustStore from '@/components/shop/rust-store';
import { StoreFireworks } from '@/components/shop/store-fireworks';
import styles from './shop.module.css';

type ShopPageProps = { searchParams: Promise<{ game?: string }> };

const games = [
  {
    name: 'Rust',
    href: '/shop?game=rust',
    image: '/images/cloudy-rust-premium-4k.avif',
    status: 'Live',
    description: 'Open the Rust store to browse kits, ranks and extras made for the Cloudy Rust experience.',
    tags: ['Kits', 'Ranks', 'Extras'],
    live: true,
  },
  {
    name: 'Coming soon',
    image: '',
    status: 'Coming soon',
    description: 'New projects are on the way',
    tags: [],
    live: false,
  },
  {
    name: 'Coming soon',
    image: '',
    status: 'Coming soon',
    description: 'New projects are on the way',
    tags: [],
    live: false,
  },
] as const;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { game } = await searchParams;
  if (game === 'rust') return <RustStore />;

  return (
    <main className={styles.page}>
      <StoreFireworks />
      <section className={styles.hero}>
        <h1>Cloudy game store</h1>
        <p>Select a game first. Every Cloudy game has its own store, future products stay organised as the platform grows.</p>

        <div className={styles.stats}>
          <div><strong>01</strong><span>Live game</span></div>
          <div><strong>More</strong><span>Games incoming</span></div>
        </div>
      </section>

      <section className={styles.browser} aria-labelledby="game-store-title">
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="game-store-title">Select a game</h2>
          </div>
        </header>

        <div className={styles.gameGrid}>
          {games.map((item, index) => {
            const card = (
              <>
                {item.image ? (
                  <img className={styles.art} src={item.image} alt="" aria-hidden="true" />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true">
                    <b>{String(index + 1).padStart(2, '0')}</b>
                  </div>
                )}
                <div className={styles.shade} aria-hidden="true" />
                <div className={styles.cardTop}>
                  <span className={item.live ? styles.live : styles.soon}>{item.status}</span>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3>{item.name}</h3>
                    {item.live && <span className={styles.arrow}>↗</span>}
                  </div>
                  <p>{item.description}</p>
                  <div className={styles.tags}>
                    {item.tags.map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                  <div className={styles.cardFoot}>
                    <span>{item.live ? 'Open game store' : 'Not available yet'}</span>
                    {item.live && <strong>Explore →</strong>}
                  </div>
                </div>
              </>
            );

            return item.live ? (
              <Link key={`${item.name}-${index}`} href={item.href} className={styles.gameCard}>
                {card}
              </Link>
            ) : (
              <article
                key={`${item.name}-${index}`}
                className={`${styles.comingCard} cloudy-classic-coming`}
              >
                <div>
                  <strong>Coming soon</strong>
                  <p>New projects are on the way</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.flow} aria-label="How the Cloudy store works">
        <div>
          <span>STORE FLOW</span>
          <h2>Game first. Products second.</h2>
        </div>
        <div className={styles.steps}>
          <article><b>01</b><h3>Choose a game</h3><p>Select the Cloudy experience you play.</p></article>
          <article><b>02</b><h3>Pick what you need</h3><p>Browse the game's kits & servers.</p></article>
          <article><b>03</b><h3>Checkout</h3><p>Your basket stays connected to the correct game.</p></article>
        </div>
      </section>
    </main>
  );
}
