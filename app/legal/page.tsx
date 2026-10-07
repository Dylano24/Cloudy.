import Link from 'next/link';

const legalItems = [
  {
    title: 'Terms of Service',
    description: 'The terms that govern use of the Cloudy community, Rust servers, website, store and related services.',
    href: '/terms',
    status: 'Available',
  },
  {
    title: 'Terms of Sale',
    description: 'Purchase and sales terms for Cloudy products and services.',
    href: '/terms-of-sale',
    status: 'Coming soon',
  },
] as const;

export default function LegalPage() {
  return (
    <main className="min-h-[70vh] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-muted">CLOUDY INC. · LEGAL</p>
        <h1 className="font-[var(--font-display)] text-5xl uppercase leading-none text-white sm:text-7xl">Legal information</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
          Official Cloudy legal documents are kept separate so each document can be updated clearly.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {legalItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cloud-panel group rounded-2xl border p-6 transition hover:-translate-y-1 hover:border-white/25"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-[var(--font-display)] text-2xl uppercase text-white">{item.title}</h2>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                  {item.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
