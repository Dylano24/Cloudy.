export default function LinkAccountPage() {
  return (
    <main className="min-h-[70vh] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-muted">CLOUDY ACCOUNT</p>
        <h1 className="font-[var(--font-display)] text-5xl uppercase leading-none text-white sm:text-7xl">Link Your Account</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">Claim free kits, purchases &amp; alerts.</p>
        <section className="cloud-panel mt-10 rounded-2xl border p-7 sm:p-10">
          <p className="text-sm leading-7 text-muted">
            Account linking will be available here once the official Cloudy account-linking URL is connected.
          </p>
          <span className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Coming soon</span>
        </section>
      </div>
    </main>
  );
}
