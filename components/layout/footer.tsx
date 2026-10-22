import Link from 'next/link';
import styles from './footer.module.css';

const DISCORD_URL = 'https://discord.gg/EGDVMmmSzF';

export function Footer() {
  return (
    <footer className={`cloudy-footer ${styles.footer}`}>
      <div className="cloudy-footer-inner">
        <div className="cloudy-footer-grid">
          <div className={styles.navigation}>
            <div className="cloudy-footer-title">Social</div>
            <div className="cloudy-footer-links">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>
              <span>TikTok</span>
              <span>YouTube</span>
              <span>Facebook</span>
            </div>
          </div>

          <div className={styles.community}>
            <div className="cloudy-footer-title">Contact us</div>
            <div className="cloudy-footer-links">
              <Link href="/support">Support</Link>
              <span>Email</span>
              <Link href="/appeal">Appeal form</Link>
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
