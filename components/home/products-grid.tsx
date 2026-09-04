import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';

export function ProductsGrid() {
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-300">
              <Package className="h-4 w-4" /> Cloudy Store
            </div>
            <h3 className="text-3xl font-black text-white">Store setup in progress</h3>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 font-bold text-cyan-300 hover:text-cyan-200 sm:flex">
            Store status <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="cloud-panel rounded-2xl border border-border py-14 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-primary" />
          <p className="mx-auto max-w-xl text-muted">
            Packages and checkout will appear here after the official Cloudy store and server integration are ready.
          </p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:opacity-80">
            View store status <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
