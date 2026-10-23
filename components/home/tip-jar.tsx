'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useProduct } from '@/hooks/use-api';
import styles from '@/app/home.module.css';

export function TipJar({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const { data: product } = useProduct(productSlug, true, !!productSlug);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const ready = !!product?.donation && product.status && product.stock !== 0;
  const minimum = Math.max(1, product?.min_donation || 1);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!ready || !product) return;
    if (!Number.isFinite(value) || value < minimum || value > 10000 || !/^\d+(\.\d{1,2})?$/.test(amount)) {
      setError(`Enter an amount of at least $${minimum.toFixed(2)}.`);
      return;
    }
    const cart = useCart.getState();
    cart.addItem(product, 1, {});
    cart.updateDonationAmount(product.id, value, {});
    router.push('/checkout');
  }

  return <section className={styles.tipJar} aria-label="Tip jar">
    <div><h2>Tip jar</h2><p>Want to support Cloudy? Choose an amount to leave a tip.</p></div>
    <form onSubmit={submit} className={styles.tipForm} noValidate>
      <label htmlFor="cloudy-tip-amount">Your tip amount</label>
      <div className={styles.tipAmount}><span aria-hidden="true">$</span><input id="cloudy-tip-amount" type="number" inputMode="decimal" min={minimum} max="10000" step="0.01" placeholder="5.00" value={amount} onChange={event => { setAmount(event.target.value); setError(''); }} disabled={!ready} required /></div>
      <button type="submit" disabled={!ready}>Pay</button>
      {error && <p className={styles.tipError} role="alert">{error}</p>}
    </form>
  </section>;
}
