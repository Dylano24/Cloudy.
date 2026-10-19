import Link from 'next/link';
import styles from './footer.module.css';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const DISCORD_URL = 'https://discord.gg/EGDVMmmSzF';

export function Footer() {
  return (
    <footer className={`cloudy-footer ${styles.footer}`}>
      <div className="cloudy-footer-inner">
        <div className="cloudy-footer-grid">
          <div className={styles.brand}>
            <Link href="/" className="cloudy-footer-brand" aria-label="Cloudy Inc. home">
              <img src={CLOUDY_LOGO_URL} alt="Cloudy" width={50} height={50} />
              <div><strong>CLOUDY INC.</strong></div>
            </Link>
          </div>

          <div className={styles.navigation}>
            <div className="cloudy-footer-title">Navigation</div>
            <div className="cloudy-footer-links">
              <Link href="/">Home</Link>
              <Link href="/shop">Store</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>

          <div className={styles.community}>
            <div className="cloudy-footer-title">Community</div>
            <div className="cloudy-footer-links">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>
            </div>

          </div>

          <div className={styles.information}>
            <div className="cloudy-footer-title">Information</div>
            <div className="cloudy-footer-links">
              <Link href="/terms">Terms of service</Link>
              <Link href="/terms-of-sale">Terms of sale</Link>
              <Link href="/privacy">Privacy policy</Link>
            </div>
          </div>
        </div>

        <div className="cloudy-footer-bottom">
          <span>© {new Date().getFullYear()} Cloudy Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
