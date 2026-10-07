import Link from 'next/link';
import { ArrowRight, Headphones, ShieldCheck, Users2 } from 'lucide-react';

const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export default function HomePage() {
  return (
    <div className="cloudy-classic-home">
      <div className="cloudy-classic-smoke" aria-hidden="true" />

      <section className="cloudy-classic-hero">
        <div className="cloudy-classic-logo-shell">
          <img src={CLOUDY_LOGO_URL} alt="Cloudy" />
        </div>
        <h1>CLOUDY</h1>
        <p className="cloudy-classic-tagline">Perfected through detail. <strong>Designed for excellence.</strong></p>
        <p className="cloudy-classic-hero-copy">
          Cloudy creates and operates dedicated gaming experiences, bringing together immersive servers,
          active communities and in-game services.
        </p>
      </section>

      <main className="cloudy-classic-wrap">
        <section className="cloudy-classic-intro">
          <p>
            Cloudy is the parent gaming company. Rust is our first project, supported by digital services,
            a dedicated website and a community that brings the Cloudy platform together.
          </p>
        </section>

        <section className="cloudy-classic-benefits" aria-label="Cloudy benefits">
          <article>
            <Headphones size={27} strokeWidth={1.6} />
            <div><strong>FAST SUPPORT</strong><span>We&apos;re here when you need us</span></div>
          </article>
          <article>
            <ShieldCheck size={27} strokeWidth={1.6} />
            <div><strong>SECURE PURCHASES</strong><span>Safe &amp; trusted</span></div>
          </article>
          <article>
            <Users2 size={27} strokeWidth={1.6} />
            <div><strong>COMMUNITY DRIVEN</strong><span>Built around players</span></div>
          </article>
        </section>

        <section id="games" className="cloudy-classic-section">
          <div className="cloudy-classic-heading">
            <span>INSIDE CLOUDY</span>
            <h2>CHOOSE YOUR GAME</h2>
            <p>Discover the games, servers and experiences created and operated by Cloudy.</p>
          </div>

          <div className="cloudy-classic-game-grid">
            <Link
              href="/shop"
              className="cloudy-classic-game-card"
              style={{
                backgroundImage: "url('/images/rust-user-background.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center 42%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <span className="cloudy-classic-game-badge">RUST</span>
              <div className="cloudy-classic-game-copy">
                <span>CLOUDY PROJECT</span>
                <h3>RUST</h3>
                <b>View servers &amp; kits <ArrowRight size={15} /></b>
              </div>
            </Link>

            <article className="cloudy-classic-coming">
              <span>02</span>
              <div>
                <strong>COMING SOON</strong>
                <p>Future Cloudy projects will appear here when they are ready.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="cloudy-classic-feature cloudy-classic-community">
          <div>
            <span className="cloudy-classic-eyebrow">THE CLOUDY COMMUNITY</span>
            <h2>One community.</h2>
            <p>Join Cloudy on Discord for server updates, community news and support.</p>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-classic-button">Join Discord <ArrowRight size={15} /></a>
        </section>

        <section className="cloudy-classic-why">
          <div className="cloudy-classic-heading">
            <span>WHY CLOUDY</span>
            <h2>Built around quality.</h2>
          </div>
          <div className="cloudy-classic-why-grid">
            <article><strong>Quality</strong><p>Stable, polished and enjoyable gaming experiences.</p></article>
            <article><strong>Community</strong><p>Every detail is designed to enhance the player experience.</p></article>
            <article><strong>Innovation</strong><p>New ideas, features and better ways to play.</p></article>
            <article><strong>Precision</strong><p>Carefully considered decisions across every Cloudy project.</p></article>
          </div>
        </section>

        <section className="cloudy-classic-future">
          <span className="cloudy-classic-eyebrow">BUILT TO GROW</span>
          <h2>The future of Cloudy.</h2>
          <p>
            We aim to expand Cloudy across new games and experiences while carrying the same attention to detail
            and commitment to quality into everything we create.
          </p>
        </section>
      </main>
    </div>
  );
}
