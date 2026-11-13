'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { formatMoney, ORDER_STATUS_LABEL, type CustomerOrder } from '@/lib/order-format';
import { formatOrderDate, orderTitle, STATUS_TONE } from './account-orders';
import styles from './orders.module.css';

const PAYMENT_LABEL: Record<string, string> = { sale: 'Payment', refund: 'Refund', failed: 'Failed payment', subscription: 'Subscription update', expense: 'Expense' };

async function loadReceipt(id: string) {
  const response = await fetch(`/api/account/orders/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({})) as { order?: CustomerOrder; customer?: { name: string }; error?: string };
  if (!response.ok || !data.order) throw Object.assign(new Error(data.error || 'This receipt could not be loaded.'), { status: response.status });
  return data as { order: CustomerOrder; customer: { name: string } };
}

export function OrderReceipt({ id }: { id: string }) {
  const { data, isPending, error } = useQuery({ queryKey: ['account', 'receipt', id], queryFn: () => loadReceipt(id), retry: false });

  return (
    <main className={styles.receipt}>
      <Link href="/account/orders" className={styles.back}><ArrowLeft size={14} aria-hidden="true" /> My orders</Link>
      {isPending ? <div className={styles.skeleton} style={{ height: 420 }} aria-busy="true" aria-label="Loading receipt" /> : error || !data ? (
        <section className={styles.sheet} role="alert">
          <h1 className="cloudy-card-title">Receipt not available</h1>
          <p className="cloudy-copy">{(error as { status?: number } | null)?.status === 401 ? 'Sign in with the account you used for this purchase to see its receipt.' : error?.message || 'This receipt could not be loaded.'}</p>
          <div className={styles.actions}>
            <Link href="/account" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }}>Sign in</Link>
            <Link href="/support" className="cloudy-classic-button">Contact support</Link>
          </div>
        </section>
      ) : <ReceiptSheet order={data.order} customer={data.customer} />}
    </main>
  );
}

function ReceiptSheet({ order, customer }: { order: CustomerOrder; customer: { name: string } }) {
  const lineTotal = order.lines.reduce((sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity, 0);
  return (
    <article className={styles.sheet} aria-labelledby="receipt-title">
      <header className={styles.sheetHead}>
        <div>
          <span className="cloudy-label">Receipt</span>
          <h1 id="receipt-title" className="cloudy-title">{orderTitle(order)}</h1>
        </div>
        <div className={styles.seller}>
          <strong>Cloudy Inc.</strong>
          <span>Cloudy Store</span>
        </div>
      </header>

      <dl className={styles.facts}>
        <div><dt>Order</dt><dd>{order.reference}</dd></div>
        <div><dt>Date</dt><dd>{formatOrderDate(order.date)}</dd></div>
        <div><dt>Customer</dt><dd>{customer.name}</dd></div>
        <div><dt>Status</dt><dd><span className={styles.pill} data-tone={STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</span>{order.mode === 'test' ? <> <span className={styles.pill} data-tone="test">Test payment</span></> : null}</dd></div>
      </dl>

      {order.lines.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">Purchased items</caption>
            <thead><tr><th scope="col">Item</th><th scope="col" className={styles.num}>Quantity</th><th scope="col" className={styles.num}>Unit price</th><th scope="col" className={styles.num}>Amount</th></tr></thead>
            <tbody>
              {order.lines.map((line, index) => (
                <tr key={`${line.name}-${index}`}>
                  <td>{line.name}</td>
                  <td className={styles.num}>{line.quantity}</td>
                  <td className={styles.num}>{formatMoney(Math.round(line.unitPrice * 100), order.currency)}</td>
                  <td className={styles.num}>{formatMoney(Math.round(line.unitPrice * 100) * line.quantity, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <dl className={styles.totals}>
        {lineTotal && lineTotal !== order.paidMinor ? <div><dt>Items</dt><dd>{formatMoney(lineTotal, order.currency)}</dd></div> : null}
        <div><dt>Paid</dt><dd>{formatMoney(order.paidMinor, order.currency)}</dd></div>
        {order.refundedMinor ? <div><dt>Refunded</dt><dd>−{formatMoney(order.refundedMinor, order.currency)}</dd></div> : null}
        <div className={styles.grand}><dt>Total</dt><dd>{formatMoney(order.paidMinor - order.refundedMinor, order.currency)}</dd></div>
      </dl>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="sr-only">Payment history</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Event</th><th scope="col">Transaction</th><th scope="col" className={styles.num}>Amount</th></tr></thead>
          <tbody>
            {order.payments.map((payment, index) => (
              <tr key={`${payment.date}-${index}`}>
                <td>{formatOrderDate(payment.date)}</td>
                <td>{PAYMENT_LABEL[payment.kind] || payment.kind}</td>
                <td style={{ overflowWrap: 'anywhere' }}>{payment.transactionId || '—'}</td>
                <td className={styles.num}>{payment.kind === 'subscription' ? '—' : !payment.confirmed ? 'To be confirmed' : `${payment.kind === 'refund' ? '−' : ''}${formatMoney(payment.amountMinor, payment.currency)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.note}>Amounts include any taxes or fees charged at checkout. Keep this receipt for your records. For questions, contact Cloudy support with order {order.reference}.</p>
      <div className={styles.actions}>
        <button type="button" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }} onClick={() => window.print()}><Printer size={14} aria-hidden="true" /> Print receipt</button>
        <Link href="/support" className="cloudy-classic-button">Contact support</Link>
      </div>
    </article>
  );
}
