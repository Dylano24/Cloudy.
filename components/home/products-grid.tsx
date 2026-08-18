'use client';

import Link from 'next/link';
import { ArrowRight, Package, TrendingUp } from 'lucide-react';
import { useProducts } from '@/hooks/use-api';
import { ProductCard } from '@/components/product/product-card';

export function ProductsGrid() {
  const { data: products, isLoading } = useProducts({ maxPage: 12, onlyEnabled: true });
  const featured = products?.products.filter(product => product.featured) || [];
  const all = products?.products || [];
  const shown = featured.length > 0 ? featured.slice(0, 4) : all.slice(0, 8);

  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-300">
              {featured.length > 0 ? <TrendingUp className="h-4 w-4" /> : <Package className="h-4 w-4" />} Featured selection
            </div>
            <h3 className="text-3xl font-black text-white">Popular upgrades</h3>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 font-bold text-cyan-300 hover:text-cyan-200 sm:flex">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-border bg-card" />)}
          </div>
        ) : shown.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map(product => <ProductCard key={product.id} product={product} hideFeaturedBadge />)}
          </div>
        ) : (
          <div className="cloud-panel rounded-2xl py-16 text-center text-muted">Products will appear here when they are available.</div>
        )}
      </div>
    </section>
  );
}
