import Link from 'next/link';
import { StoreFireworks } from '@/components/shop/store-fireworks';
import styles from './shop.module.css';
import { GameCarousel } from '@/components/home/game-carousel';
import { StorePanelSync } from '@/components/shop/store-panel-sync';
import RustKitPreview from '@/components/shop/rust-kit-preview';

type ShopPageProps = { searchParams: Promise<{ game?: string; view?: string }> };

const games = [
  {
    name: 'Rust',
    href: '/shop?game=rust',
    image: '/images/cloudy-rust-premium-4k.avif',
    status: 'Live',
    description: 'Open the Rust store to browse kits and servers made for the Rust experience.',
    tags: ['Kits', 'Servers'],
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

function StatusCount({ label, count, online }: { label: string; count: number | null; online: boolean }) {
  const status = online ? styles.statusOnline : styles.statusOffline;
  return <div className={`${styles.statMetric} ${styles.liveMetric}`}>
    <strong className={styles.statNumber}>{count ?? '—'}</strong>
    <div className={styles.statStatus}><i className={`${styles.statusDot} ${status}`} aria-hidden="true" /><span>Online {label}</span></div>
  </div>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { game } = await searchParams;
  if (game === 'rust') return <RustKitPreview />;

  return (
    <main className={`${styles.page} cloudy-store-page`}>
      <StorePanelSync />
      <StoreFireworks />
      <section className={styles.hero}>
        <h1>Cloudy store</h1>
        <p>Every game has its own store, future products stay organised as the platform grows.</p>

        <div className={styles.stats}>
          <div data-cloudy-store-sheen className={`${styles.statsPanel} cloudy-traced-panel cloudy-store-traced-panel`} aria-label="Cloudy store and server status">
            <div className={styles.statMetric}><strong className={styles.statNumber}>1</strong><span className={styles.statLabel}>Games</span></div>
            <div className={styles.statMetric}><strong className={styles.statNumber}>0</strong><span className={styles.statLabel}>Purchases</span></div>
            <StatusCount label="Players" count={0} online={false} />
            <StatusCount label="Servers" count={1} online />
          </div>
        </div>
      </section>

      <section className={styles.browser} aria-labelledby="game-store-title">
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="game-store-title">Select a game</h2>
          </div>
        </header>

        <GameCarousel trackClassName={styles.gameGrid} labels={games.map((item, index) => item.live ? item.name : `Coming soon ${index}`)} ariaLabel="Cloudy store games">
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
                  <span className={styles.cardIndexNumber}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3>{item.name}</h3>
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
              <Link key={`${item.name}-${index}`} href={item.href} className={`${styles.gameCard} cloudy-traced-panel cloudy-store-traced-panel`}>
                {card}
              </Link>
            ) : (
              <article
                key={`${item.name}-${index}`}
                data-cloudy-store-sheen
                className={`${styles.comingCard} cloudy-traced-panel cloudy-store-traced-panel`}
              >
                <div>
                  <strong>Coming soon</strong>
                  <p>New projects are on the way</p>
                </div>
              </article>
            );
          })}
        </GameCarousel>
      </section>

    </main>
  );
}
