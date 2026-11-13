import type { FinanceRecord } from './finance';

// Order types and display helpers, safe for the browser (no Node modules).

export type CustomerIdentity = { cloudyId: string; discordIds: string[]; steamIds: string[] };
export type OrderStatus = 'paid' | 'refunded' | 'partially_refunded' | 'failed' | 'subscription_active' | 'subscription_ended';
export type OrderPayment = { date: string; kind: FinanceRecord['kind']; amountMinor: number; currency: string; transactionId: string; confirmed: boolean; description: string };
export type OrderLine = { name: string; quantity: number; unitPrice: number };
export type CustomerOrder = {
  id: string;
  reference: string;
  date: string;
  updated: string;
  status: OrderStatus;
  currency: string;
  paidMinor: number;
  refundedMinor: number;
  lines: OrderLine[];
  payments: OrderPayment[];
  subscription: boolean;
  mode: 'live' | 'test';
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: 'Paid',
  refunded: 'Refunded',
  partially_refunded: 'Partly refunded',
  failed: 'Payment failed',
  subscription_active: 'Subscription active',
  subscription_ended: 'Subscription ended',
};

export function formatMoney(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}
