import Link from 'next/link';

const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export function Footer() {
  return (
    <footer className="cloudy-footer">
      <div className="cloudy-footer-inner">
        <div className="cloudy-footer-grid">
          <div>
            <Link href="/" className="cloudy-footer-brand" aria-label="Cloudy Inc. home">
              <img src="/images/cloudy-c.svg" alt="" width={45} height={45} />
              <div><strong>CLOUDY INC.</strong></div>
            </Link>
            <p style={{ marginTop: 16, color: '#8f8f95', fontSize: 12 }}>Quality. Innovation. Performance.</p>
          </div>

          <div>
            <div className="cloudy-footer-title">Navigation</div>
            <div className="cloudy-footer-links">
              <Link href="/">Home</Link>
              <Link href="/#games">Server</Link>
              <Link href="/shop">Store</Link>
              <Link href="/appeal">Appeal form</Link>
            </div>
          </div>

          <div>
            <div className="cloudy-footer-title">Community</div>
            <div className="cloudy-footer-links">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>
            </div>

            <div className="cloudy-footer-title" style={{ marginTop: 18 }}>Information</div>
            <div className="cloudy-footer-links">
              <Link href="/legal#terms">Terms of service</Link>
              <Link href="/legal#sales">Terms of sale</Link>
            </div>
          </div>
        </div>

        <div className="cloudy-footer-bottom">
          <span>© {new Date().getFullYear()} Cloudy Inc. • Quality. Innovation. Performance.</span>
        </div>
      </div>
    </footer>
  );
}
