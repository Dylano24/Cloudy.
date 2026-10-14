import Link from 'next/link';
import { ArrowRight, Shield, ShieldCheck, Users2, Zap, Target } from 'lucide-react';
import styles from './home.module.css';
import { CloudyHelp } from '@/components/help/cloudy-help';
import { GameCarousel } from '@/components/home/game-carousel';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const DISCORD_URL = 'https://discord.gg/EGDVMmmSzF';

export default function HomePage() {
  return (
    <>
    <div className={`cloudy-classic-home ${styles.home}`}>
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
              href="/shop"
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
        <section className="cloudy-classic-feature">
          <div><h2>Enhance your <span className={styles.titleGlow}>experience</span></h2><p>From in-game kits to exclusive features, Cloudy offers additional ways to personalize and enhance your gaming experience.</p></div>
          <Link href="/shop" className="cloudy-classic-button">Visit the store <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
        <section className="cloudy-restored-payments" aria-label="Secure payments">
          <div className="cloudy-classic-heading">
            <h2>Secure <span className={styles.titleGlow}>payments</span></h2>
            <p>Simple, secure and reliable checkout.</p>
            <div className="cloudy-restored-payment-brands" aria-label="Payment methods">
              <span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span><span>Google Pay</span>
            </div>
          </div>
          <div className="cloudy-restored-pay-grid">
            <article><span className="cloudy-restored-pay-icon">✓</span><h3>Secure Checkout</h3><p>Protected payment processing.</p></article>
            <article><span className="cloudy-restored-pay-icon"><Zap size={27} strokeWidth={2.4} /></span><h3>Instant Delivery</h3><p>Receive your digital purchases quickly.</p></article>
            <article><span className="cloudy-restored-pay-icon"><Shield size={27} strokeWidth={2.2} /></span><h3>Trusted Payments</h3><p>Payments handled by secure, established providers.</p></article>
          </div>
        </section>

        <section className="cloudy-classic-feature cloudy-classic-community">
          <div>
            <h2>Join the <span className={styles.titleGlow}>community</span></h2>
            <p>Connect with other players, stay up to date with Cloudy, get support and discover what’s coming next.</p>
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
        <p className={styles.statement}>Quality. Precision. Experience.</p>
      </div>
    </div>
    <CloudyHelp />
    </>
  );
}
