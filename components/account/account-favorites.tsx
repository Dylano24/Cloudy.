'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';

export function AccountFavorites() {
  const { favorites, pending, error, toggle } = useFavorites();
  const [message, setMessage] = useState('');
  if (pending) return <p>Loading favorites…</p>;
  if (error) return <p role="alert">Could not load favorites. Please try again.</p>;
  if (!favorites.length) return <p className="text-muted">No favorites yet. Browse the <Link className="text-white underline" href="/shop">store</Link> and save products you like.</p>;
  return <div className="space-y-3">{favorites.map(item => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/15 p-4"><Link className="font-semibold hover:text-red-400" href={`/product/${encodeURIComponent(item.slug)}`}>{item.name}</Link><button type="button" className="text-sm text-red-400" onClick={() => { toggle(item).catch(() => setMessage('Could not remove favorite.')); }}>Remove</button></div>)}{message && <p role="alert" className="text-red-400">{message}</p>}</div>;
}
