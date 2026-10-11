import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users2, Zap, Target } from 'lucide-react';
import styles from './home.module.css';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export default function HomePage() {
  return (
    <div className={`cloudy-classic-home ${styles.home}`}>
      <div className="cloudy-classic-smoke" aria-hidden="true" />

      <section className="cloudy-classic-hero">
        <div className="cloudy-classic-logo-shell">
          <img src={CLOUDY_LOGO_URL} alt="Cloudy" />
        </div>
      </section>

      <div className="cloudy-classic-wrap">
        <section id="games" className="cloudy-classic-section">
          <div className="cloudy-classic-heading">
            <h2>Inside Cloudy</h2>
          </div>

          <div className="cloudy-classic-game-grid">
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
              </div>
            </Link>

            <article className="cloudy-classic-coming">
              <div>
                <strong>Coming soon</strong>
                <p>New projects are on the way</p>
              </div>
            </article>
          </div>
        </section>
        <section className="cloudy-classic-feature">
          <div><h2>Enhance your experience</h2></div>
          <Link href="/shop" className="cloudy-classic-button">Visit the store <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
        <section className="cloudy-restored-payments" aria-label="Secure payments">
          <div className="cloudy-classic-heading">
            <h2>Secure payments</h2>
            <p>Simple, secure and reliable checkout</p>
            <div className="cloudy-restored-payment-brands" aria-label="Payment methods">
              <span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span><span>Google Pay</span>
            </div>
          </div>
        </section>

        <section className="cloudy-classic-feature cloudy-classic-community">
          <div>
            <h2>Join the community</h2>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-classic-button">Join our Discord <ArrowRight size={15} aria-hidden="true" /></a>
        </section>

        <section className="cloudy-classic-why">
          <div className="cloudy-classic-heading">
            <h2>Why Cloudy?</h2>
            <p>Made with purpose.</p>
          </div>
          <div className="cloudy-classic-why-grid">
            <article><ShieldCheck size={27} aria-hidden="true" /><strong>Quality</strong></article>
            <article><Users2 size={27} aria-hidden="true" /><strong>Community</strong></article>
            <article><Zap size={27} aria-hidden="true" /><strong>Innovation</strong></article>
            <article><Target size={27} aria-hidden="true" /><strong>Precision</strong></article>
          </div>
        </section>

        <section className="cloudy-classic-future">
          <span className="cloudy-classic-eyebrow">What&apos;s next?</span>
          <h2>The future of Cloudy</h2>
        </section>
        <p className={styles.statement}>Quality. Precision. Experience.</p>
      </div>
    </div>
  );
}
