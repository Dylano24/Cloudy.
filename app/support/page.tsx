const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <main className="min-h-[70vh] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-muted">CLOUDY SUPPORT</p>
        <h1 className="font-[var(--font-display)] text-5xl uppercase leading-none text-white sm:text-7xl">Cloudy support</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="cloud-panel rounded-2xl border p-7 sm:p-10">
          <h2 className="text-xl font-bold text-white">Need help? Contact us here</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Join the official Cloudy Discord to contact the community and support team.
          </p>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-cta-primary mt-7">Discord · Join us</a>
        </section>
        <section className="cloud-panel rounded-2xl border p-7 sm:p-10">
          <h2 className="text-xl font-bold text-white">Appeal</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Use the appeal form to submit an appeal for a Discord or Rust moderation action.</p>
          <Link href="/appeal" className="cloudy-cta-primary mt-7">Appeal</Link>
        </section>
        </div>
      </div>
    </main>
  );
}
