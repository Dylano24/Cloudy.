import Link from 'next/link';
import { ArrowRight, Shield, ShieldCheck, Users2, Zap, Target } from 'lucide-react';
import styles from './home.module.css';
import { GameCarousel } from '@/components/home/game-carousel';
import { MobilePanelSync } from '@/components/home/mobile-panel-sync';
import { SiApplepay, SiGooglepay, SiPaypal } from 'react-icons/si';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const DISCORD_URL = 'https://discord.gg/EGDVMmmSzF';

export default function HomePage() {
  return (
    <>
    <div className={`cloudy-classic-home ${styles.home}`}>
      <MobilePanelSync />
      <div className="cloudy-classic-smoke" aria-hidden="true" />

      <section className="cloudy-classic-hero">
        <div className="cloudy-classic-logo-shell">
          <img src={CLOUDY_LOGO_URL} alt="Cloudy" />

        </div>
        <p className="cloudy-classic-tagline">Perfected through detail. <strong>Designed for excellence.</strong></p>
      </section>

      <div className="cloudy-classic-wrap">
        <section className="cloudy-classic-intro">
          <p>
            Cloudy creates and operates dedicated gaming experiences, bringing together immersive servers, active communities and in game services.
          </p>
        </section>


        <section id="games" className="cloudy-classic-section">
          <div className="cloudy-classic-heading">
            <h2>Inside <span className={styles.titleGlow}>Cloudy</span></h2>
            <p>Discover the games, servers and experiences created and operated by Cloudy.</p>
          </div>

          <GameCarousel>
            <Link
              href="/shop?game=rust"
              className="cloudy-classic-game-card"
              style={{
                backgroundImage: "url('/images/cloudy-rust-premium-4k.avif')",
                backgroundSize: 'cover',
                backgroundPosition: 'center 42%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div
                className="cloudy-classic-game-image"
                aria-hidden="true"
                style={{
                  backgroundImage: "url('/images/cloudy-rust-premium-4k.avif')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <div className="cloudy-classic-game-copy">
                <h3>Rust</h3>
                <b>View servers &amp; store <ArrowRight size={15} aria-hidden="true" /></b>
              </div>
            </Link>

            <article className="cloudy-classic-coming">
              <div>
                <strong>Coming soon</strong>
                <p>New projects are on the way</p>
              </div>
            </article>
          </GameCarousel>
        </section>
        <section className={`cloudy-classic-feature ${styles.featureBackdrop} ${styles.studioFeature}`} aria-labelledby="cloudy-studio-title">
          <div><span className="cloudy-classic-eyebrow">Cloudy Studio</span><h2 id="cloudy-studio-title">Web <span className={styles.titleGlow}>development</span></h2><p>Bring your website to life. Explore our website packages for a clear, responsive online presence.</p></div>
          <div className={`${styles.featureVisual} ${styles.studioVisual}`} aria-hidden="true">
            <div className={styles.browserChrome}><i /><i /><i /></div>
            <div className={styles.codePane}>
              <span className={styles.codeLineLong} />
              <span className={styles.codeLineMid} />
              <span className={styles.codeLineShort} />
              <span className={styles.codeLineLong} />
              <span className={styles.codeLineMid} />
            </div>
          </div>
          <Link href="/service" className="cloudy-classic-button">Visit the website <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
        <section className={`cloudy-classic-feature ${styles.featureBackdrop} ${styles.experienceFeature}`}>
          <div><h2>Enhance your <span className={styles.titleGlow}>experience</span></h2><p>From in-game kits to exclusive features, Cloudy offers additional ways to personalize and enhance your gaming experience.</p></div>
          <div className={`${styles.featureVisual} ${styles.storeVisual}`} aria-hidden="true">
            <div className={styles.gameWindow}>
              <span className={styles.gameBadge}>LIVE</span>
              <div className={styles.gameUiLines}><i /><i /><i /></div>
            </div>
          </div>
          <Link href="/shop" className="cloudy-classic-button">Visit the store <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
        <section className="cloudy-restored-payments" aria-label="Secure payments">
          <div className="cloudy-classic-heading">
            <h2>Secure <span className={styles.titleGlow}>payments</span></h2>
            <p>Simple, secure and reliable checkout.</p>
            <div className="cloudy-restored-payment-brands" aria-label="Payment methods">
              <span className="cloudy-payment-visa" aria-label="Visa"><strong className="cloudy-payment-visa-wordmark" aria-hidden="true">VISA</strong></span>
              <span><svg className="cloudy-payment-mastercard" viewBox="0 0 34 22" aria-hidden="true"><circle cx="12" cy="11" r="10" fill="#fff" /><circle cx="22" cy="11" r="10" fill="#fff" fillOpacity=".5" /></svg>Mastercard</span>
              <span><SiPaypal className="cloudy-payment-paypal" aria-hidden="true" />PayPal</span>
              <span className="cloudy-payment-apple" aria-label="Apple Pay"><SiApplepay aria-hidden="true" /></span>
              <span aria-label="Google Pay"><span className="cloudy-payment-google-mark"><SiGooglepay aria-hidden="true" /></span></span>
            </div>
          </div>
          <div className="cloudy-restored-pay-grid">
            <article><span className="cloudy-restored-pay-icon">✓</span><h3>Secure Checkout</h3><p>Protected payment processing.</p></article>
            <article><span className="cloudy-restored-pay-icon"><Zap size={27} strokeWidth={2.4} /></span><h3>Instant Delivery</h3><p>Receive your digital purchases quickly.</p></article>
            <article><span className="cloudy-restored-pay-icon"><Shield size={27} strokeWidth={2.2} /></span><h3>Trusted Payments</h3><p>Payments handled by secure, established providers.</p></article>
          </div>
        </section>

        <section className={`cloudy-classic-feature cloudy-classic-community ${styles.featureBackdrop} ${styles.communityFeature}`}>
          <div>
            <h2>Join the <span className={styles.titleGlow}>community</span></h2>
            <p>Connect with other players, stay up to date with Cloudy, get support and discover what’s coming next.</p>
          </div>
          <div className={`${styles.featureVisual} ${styles.communityVisual}`} aria-hidden="true">
            <div className={styles.discordWindow}>
              <div className={styles.discordRail}><SiDiscord /><i /><i /><i /></div>
              <div className={styles.discordChannels}><span /><span /><span /><span /></div>
              <div className={styles.discordChat}><i /><i /><i /><i /></div>
            </div>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-classic-button">Join our Discord <ArrowRight size={15} aria-hidden="true" /></a>
        </section>

        <section className="cloudy-classic-why">
          <div className="cloudy-classic-heading">
            <h2>Why <span className={styles.titleGlow}>Cloudy</span>?</h2>
            <p>Made with purpose.</p>
          </div>
          <div className="cloudy-classic-why-grid">
            <article><ShieldCheck size={27} aria-hidden="true" /><strong>Quality</strong><p>Stable, polished and enjoyable gaming experiences.</p></article>
            <article><Users2 size={27} aria-hidden="true" /><strong>Community</strong><p>Every detail is designed to enhance the player experience.</p></article>
            <article><Zap size={27} aria-hidden="true" /><strong>Innovation</strong><p>New ideas, features and better ways to play.</p></article>
            <article><Target size={27} aria-hidden="true" /><strong>Precision</strong><p>Carefully considered decisions across every Cloudy project.</p></article>
          </div>
        </section>

        <section className="cloudy-classic-future">
          <span className="cloudy-classic-eyebrow">What&apos;s next?</span>
          <h2>The future of <span className={styles.titleGlow}>Cloudy</span></h2>
          <p>
            We aim to expand Cloudy across new games and experiences while carrying the same attention to detail
            and commitment to quality into everything we create.
          </p>
        </section>
        <p className={styles.statement}>Built for players. Created with purpose.</p>
      </div>
    </div>
    </>
  );
}
