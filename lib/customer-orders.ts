import { createHash } from 'node:crypto';
import type { FinanceRecord } from './finance';
import type { CustomerIdentity, CustomerOrder, OrderStatus } from './order-format';

export type { CustomerIdentity, CustomerOrder, OrderLine, OrderPayment, OrderStatus } from './order-format';
export { formatMoney, ORDER_STATUS_LABEL } from './order-format';

// A customer's own purchases, built from the private payment ledger.
// A ledger entry belongs to a signed-in customer only through an identity they
// proved: the Cloudy account the webhook matched (cloudyId), their Discord
// login, or a Discord/Steam account linked through OAuth. An email address
// alone never opens an order: email registrations are not verified.

const SNOWFLAKE = /^\d{17,20}$/;
const STEAM = /^\d{17}$/;

/** Index keys under which a ledger entry is filed for its customers. */
export function recordIdentityKeys(record: Pick<FinanceRecord, 'cloudyId' | 'discordId' | 'steamId'>): string[] {
  const keys: string[] = [];
  if (/^[a-f0-9]{64}$/.test(record.cloudyId || '')) keys.push(`cloudy:${record.cloudyId}`);
  if (SNOWFLAKE.test(record.discordId || '')) keys.push(`discord:${record.discordId}`);
  if (STEAM.test(record.steamId || '')) keys.push(`steam:${record.steamId}`);
  return keys;
}

export function customerIdentityKeys(identity: CustomerIdentity): string[] {
  const keys = new Set<string>();
  if (/^[a-f0-9]{64}$/.test(identity.cloudyId)) keys.add(`cloudy:${identity.cloudyId}`);
  for (const id of identity.discordIds) if (SNOWFLAKE.test(id)) keys.add(`discord:${id}`);
  for (const id of identity.steamIds) if (STEAM.test(id)) keys.add(`steam:${id}`);
  return [...keys];
}

/** Hashed folder name for one identity key (no raw IDs in storage paths). */
export function identityFolder(key: string) {
  return createHash('sha256').update(key).digest('hex').slice(0, 40);
}

export function ownsRecord(record: FinanceRecord, identity: CustomerIdentity) {
  const mine = new Set(customerIdentityKeys(identity));
  return recordIdentityKeys(record).some(key => mine.has(key));
}

/** The payment a ledger entry belongs to: store, record type and Tip4Serv ID. */
export function orderGroupKey(record: FinanceRecord) {
  const [store = '', type = '', id = ''] = record.economicKey.split(':');
  return `${record.mode}:${store}:${type}:${id || record.paymentId}`;
}

export function orderId(groupKey: string) {
  return createHash('sha256').update(`order:${groupKey}`).digest('hex').slice(0, 24);
}

function statusOf(records: FinanceRecord[], paid: number, refunded: number): OrderStatus {
  const lifecycle = records.filter(row => row.kind === 'subscription').sort((a, b) => a.timestamp.localeCompare(b.timestamp)).at(-1);
  if (lifecycle) {
    if (refunded > 0 && refunded >= paid) return 'refunded';
    return /expired/i.test(lifecycle.description) ? 'subscription_ended' : 'subscription_active';
  }
  if (paid > 0 && refunded >= paid) return 'refunded';
  if (refunded > 0) return 'partially_refunded';
  if (paid > 0) return 'paid';
  return records.some(row => row.kind === 'failed') ? 'failed' : 'paid';
}

/** Groups a customer's ledger entries into orders, newest first. */
export function buildOrders(records: FinanceRecord[]): CustomerOrder[] {
  const groups = new Map<string, FinanceRecord[]>();
  const seen = new Set<string>();
  for (const record of records) {
    if (record.kind === 'expense' || seen.has(record.economicKey)) continue;
    seen.add(record.economicKey);
    const key = orderGroupKey(record);
    groups.set(key, [...(groups.get(key) || []), record]);
  }
  const orders: CustomerOrder[] = [];
  for (const [key, rows] of groups) {
    const sorted = [...rows].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const sales = sorted.filter(row => row.kind === 'sale');
    const first = sales[0] || sorted[0];
    const paid = sales.reduce((sum, row) => sum + row.amountMinor, 0);
    const refunded = sorted.filter(row => row.kind === 'refund' && row.amountConfirmed !== false).reduce((sum, row) => sum + row.amountMinor, 0);
    orders.push({
      id: orderId(key),
      reference: first.paymentId,
      date: first.timestamp,
      updated: sorted.at(-1)!.timestamp,
      status: statusOf(sorted, paid, refunded),
      currency: first.currency,
      paidMinor: paid,
      refundedMinor: Math.min(refunded, paid || refunded),
      lines: (first.items || []).map(item => ({ name: item.name, quantity: item.quantity, unitPrice: item.price })),
      payments: sorted.map(row => ({ date: row.timestamp, kind: row.kind, amountMinor: row.amountMinor, currency: row.currency, transactionId: row.transactionId, confirmed: row.amountConfirmed !== false, description: row.description })),
      subscription: sorted.some(row => row.kind === 'subscription') || key.split(':')[2] === '2',
      mode: first.mode,
    });
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date));
}
