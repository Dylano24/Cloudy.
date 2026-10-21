import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { AccountUser } from './account-session';

export type FinanceRecord = {
  id: string; economicKey: string; timestamp: string; kind: 'sale' | 'refund' | 'failed' | 'expense';
  description: string; amountMinor: number; currency: string; paymentId: string; transactionId: string;
  cloudyId: string; discordId: string; googleId: string; email: string;
  steamId?: string; amountConfirmed?: boolean; ingameId: string; linkStatus: string; mode: 'live' | 'test';
  items: { id: string; name: string; quantity: number; price: number }[];
};

export function cloudyAccountId(user: AccountUser) {
  return createHash('sha256').update(`${user.provider || 'discord'}:${user.id}`).digest('hex');
}
export function isFinanceAdmin(user: AccountUser | null, allowlist = process.env.CLOUDY_FINANCE_ADMINS || '') {
  if (!user) return false;
  const identity = user.provider === 'email' ? `email:${user.email?.toLowerCase()}` : `${user.provider || 'discord'}:${user.id}`;
  return allowlist.split(',').map(value => value.trim()).filter(Boolean).includes(identity);
}
export function verifyFinanceAccess(supplied:string, expected=process.env.CLOUDY_FINANCE_ACCESS_KEY||'') {
  if(!supplied||!expected||supplied.length>256)return false;
  return timingSafeEqual(createHash('sha256').update(supplied).digest(),createHash('sha256').update(expected).digest());
}
export function verifyPaymentSignature(body: string, timestamp: string, signature: string, secret: string, now = Date.now() / 1000) {
  if (!secret || !/^\d{1,12}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 300 || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac('sha256', Buffer.from(secret, 'base64')).update(`${timestamp}.${body}`).digest('hex');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
const text = z.string().max(500);
const identifier = z.union([z.string().min(1).max(255), z.number().int().nonnegative()]).transform(String);
const amount = z.coerce.number().finite().nonnegative().max(10000000);
const eventSchema = z.object({
  event: z.enum(['payment.success', 'payment.failed', 'payment.refund']),
  created_at: z.string().datetime({ offset: true }), request_id: text.min(1), store_id: identifier,
  mode: z.enum(['live', 'test']),
  data: z.object({ id: identifier, type: z.coerce.number().int().min(1).max(2).default(1), transaction_id: text.optional(),
    amount: z.object({ total_paid: amount, currency: z.string().regex(/^[A-Z]{3}$/) }),
    user: z.object({ email: z.string().email().max(254).optional(), discord_id: text.optional(), steam_id: text.optional(), minecraft_uuid: text.optional(), fivem_citizen_id: text.optional(), eosid: text.optional(), ingame_username: text.optional() }).default({}),
    basket: z.array(z.object({ id: identifier, name: text, quantity: z.coerce.number().int().positive().max(100000), price: amount })).max(200).default([]),
  }),
});
export function paymentRecord(input: unknown, storeId: string, mode: 'live' | 'test'): FinanceRecord {
  const event = eventSchema.parse(input);
  if (!storeId || event.store_id !== storeId || event.mode !== mode) throw new Error('Payment environment or store does not match');
  const { data } = event;
  const ingameId = data.user.steam_id || data.user.minecraft_uuid || data.user.fivem_citizen_id || data.user.eosid || data.user.ingame_username || '';
  return {
    id: createHash('sha256').update(`${event.store_id}:${event.request_id}`).digest('hex'),
    // Retries and seller resends can have distinct request IDs; one payment is counted once.
    economicKey: `${event.store_id}:${data.type}:${data.id}:${data.transaction_id || ''}:${event.event}`,
    timestamp: event.created_at, kind: event.event === 'payment.success' ? 'sale' : event.event === 'payment.refund' ? 'refund' : 'failed',
    amountMinor: Math.round(data.amount.total_paid * 100), currency: data.amount.currency,
    paymentId: data.id, transactionId: data.transaction_id || '', mode: event.mode,
    description: data.basket.map(item => `${item.name} × ${item.quantity}`).join(', '),
    email: data.user.email || '', discordId: data.user.discord_id || '', googleId: '', cloudyId: '',
    steamId: data.user.steam_id || '', amountConfirmed: event.event !== 'payment.refund', ingameId, linkStatus: 'Not linked', items: data.basket,
  };
}
