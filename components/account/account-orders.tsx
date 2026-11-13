'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { formatMoney, ORDER_STATUS_LABEL, type CustomerOrder, type OrderStatus } from '@/lib/order-format';
import styles from './orders.module.css';

type OrderRow = Omit<CustomerOrder, 'payments'> & { payments: number };

export const STATUS_TONE: Record<OrderStatus, 'good' | 'warn' | 'bad'> = {
  paid: 'good', subscription_active: 'good', partially_refunded: 'warn', subscription_ended: 'warn', refunded: 'bad', failed: 'bad',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });
export const formatOrderDate = (value: string) => { const ms = Date.parse(value); return Number.isFinite(ms) ? dateFormat.format(ms) : ''; };

export function orderTitle(order: Pick<CustomerOrder, 'lines'>) {
  if (!order.lines.length) return 'Cloudy purchase';
  const [first, ...rest] = order.lines;
  return `${first.name}${first.quantity > 1 ? ` × ${first.quantity}` : ''}${rest.length ? ` + ${rest.length} more` : ''}`;
}

async function loadOrders(): Promise<OrderRow[]> {
  const response = await fetch('/api/account/orders', { cache: 'no-store' });
  const data = await response.json().catch(() => ({})) as { orders?: OrderRow[]; error?: string };
  if (!response.ok || !Array.isArray(data.orders)) throw new Error(data.error || 'Your orders could not be loaded.');
  return data.orders;
}

export function AccountOrders() {
  const { data: orders, isPending, error, refetch, isFetching } = useQuery({ queryKey: ['account', 'orders'], queryFn: loadOrders, staleTime: 30_000 });

  if (isPending) return <div className={styles.list} aria-busy="true" aria-label="Loading your orders"><div className={styles.skeleton} /><div className={styles.skeleton} /></div>;
  if (error) {
    return (
      <div className={styles.empty} role="alert">
        <p className="cloudy-copy">{error.message}</p>
        <button type="button" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }} onClick={() => void refetch()} disabled={isFetching}>Try again</button>
      </div>
    );
  }
  if (!orders.length) {
    return (
      <div className={styles.empty}>
        <p className="cloudy-copy">No orders yet. Purchases made while you are signed in, or with a Discord or Steam account linked to this account, appear here.</p>
        <div className={styles.actions}>
          <Link href="/shop" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }}>Visit the store</Link>
          <Link href="/support" className="cloudy-classic-button">Contact support</Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <ul className={styles.list} aria-label="Your orders">
        {orders.map(order => (
          <li key={order.id} className={styles.order}>
            <div className={styles.meta}>
              <h3 className="cloudy-subheading">{orderTitle(order)}</h3>
              <p>{formatOrderDate(order.date)} · Order {order.reference}</p>
            </div>
            <div className={styles.side}>
              <span className={styles.total}>{formatMoney(order.paidMinor, order.currency)}</span>
              <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'inherit' }}>
                {order.mode === 'test' ? <span className={styles.pill} data-tone="test">Test payment</span> : null}
                <span className={styles.pill} data-tone={STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</span>
              </span>
              <Link className={styles.link} href={`/account/receipt/${order.id}` as Route}>View receipt <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="cloudy-copy" style={{ marginTop: 18 }}>Questions about a purchase? <Link className="text-white underline" href="/support">Contact Cloudy support</Link> with the order number.</p>
    </>
  );
}
