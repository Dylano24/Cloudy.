import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-[70vh] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-muted">CLOUDY INC. · LEGAL</p>
        <h1 className="font-[var(--font-display)] text-5xl uppercase leading-none text-white sm:text-7xl">Terms of sale</h1>
        <section className="cloud-panel mt-10 rounded-2xl border p-7 sm:p-10">
          <p className="max-w-2xl text-sm leading-7 text-muted">Cloudy’s official Terms of sale will be published here once the final sales terms are approved.</p>
          <span className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Coming soon</span>
        </section>
        <p className="mt-8 text-center text-[11px] font-medium tracking-[0.04em] text-muted">Last updated 07 October 2026 · 18:17</p>
        <Link href="/legal" className="cloudy-cta-secondary mt-8">Back to legal</Link>
      </div>
    </main>
  );
}
