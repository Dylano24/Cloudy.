import Link from 'next/link';
import RustStore from '@/components/shop/rust-store';
import styles from './shop.module.css';
import { GameCarousel } from '@/components/home/game-carousel';
import { StoreFireworks } from '@/components/shop/store-fireworks';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game } = await searchParams;
  if (game === 'rust') return <RustStore />;

  return <div className={styles.page}>
    <StoreFireworks />
    <div className={styles.wrap}>
      <header className={styles.heading}>
        <h1>Cloudy store</h1>
        <p>Select a game to visit its store.</p>
      </header>
      <GameCarousel>
        <Link href="/shop?game=rust" className={styles.game}>
          <img src="/images/cloudy-rust-premium-4k.avif" alt="" />
          <div><h2>Rust</h2><span>Visit the Rust store →</span></div>
        </Link>
        <article className={styles.coming}>
          <h2>Coming soon</h2><p>More games and stores are on the way.</p>
        </article>
      </GameCarousel>
    </div>
  </div>;
}
