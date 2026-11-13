import type { NextRequest } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE, type AccountUser } from './account-session';
import { isFinanceAdmin } from './finance';

// Staff screen for Rust Console kit deliveries. Two locks: the website lets
// in an allow-listed Cloudy account that has a Discord ID, and Cloudy (the
// bot) checks again that this Discord user is its owner before it shows or
// changes anything.

export const DELIVERY_STATUSES = ['awaiting_verification', 'queued', 'delivering', 'delivered', 'failed', 'needs_review', 'cancelled', 'refunded_after_delivery'] as const;
export type DeliveryStatus = typeof DELIVERY_STATUSES[number];
export const DELIVERY_ACTIONS = ['retry', 'cancel', 'mark-delivered'] as const;
export type DeliveryAction = typeof DELIVERY_ACTIONS[number];

export type Delivery = {
  id: string; orderRef: string; paymentMode: 'live' | 'test'; server: string; platform: 'xbox' | 'playstation'; gamertag: string;
  kit: string; label: string; status: DeliveryStatus; attempts: number; lastError?: string | null; createdAt: string; updatedAt?: string;
  deliveredAt?: string; confirmation?: string; waitingForPlayer?: boolean; history?: { at: string; status: string; note?: string }[];
};
export type DeliveryOverview = { mode: 'off' | 'mock' | 'live'; servers: string[]; requireVerification: boolean; counts: Partial<Record<DeliveryStatus, number>>; deliveries: Delivery[] };

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  awaiting_verification: 'Waiting for gamertag check',
  queued: 'Queued',
  delivering: 'Sending',
  delivered: 'Delivered',
  failed: 'Failed',
  needs_review: 'Needs review',
  cancelled: 'Cancelled',
  refunded_after_delivery: 'Refunded after delivery',
};

/** Which actions staff can take on a delivery in this status (the bot enforces the same rules). */
export function actionsFor(status: DeliveryStatus): DeliveryAction[] {
  if (status === 'needs_review') return ['mark-delivered', 'retry', 'cancel'];
  if (status === 'failed') return ['retry', 'cancel'];
  if (status === 'queued' || status === 'awaiting_verification') return ['cancel'];
  return [];
}

export type StaffCheck = { ok: true; user: AccountUser; discordId: string } | { ok: false; status: 401 | 403; error: string };

/**
 * The signed-in staff member and the Discord ID Cloudy will check. `linkedDiscord`
 * is the Discord account linked through OAuth, for staff who sign in otherwise.
 */
export function staffFromSession(user: AccountUser | null, linkedDiscord: string | undefined, allowlist = process.env.CLOUDY_STAFF_ADMINS || process.env.CLOUDY_FINANCE_ADMINS || ''): StaffCheck {
  if (!user) return { ok: false, status: 401, error: 'Sign in with an authorized Cloudy account.' };
  if (!isFinanceAdmin(user, allowlist)) return { ok: false, status: 403, error: 'This account is not allowed to manage deliveries.' };
  const discordId = user.provider === 'discord' || !user.provider ? user.id : linkedDiscord;
  if (!discordId || !/^\d{17,20}$/.test(discordId)) return { ok: false, status: 403, error: 'Link your Discord account first: Cloudy checks staff by Discord.' };
  return { ok: true, user, discordId };
}

export function sessionFrom(request: NextRequest) {
  return decodeSession(request.cookies.get(SESSION_COOKIE)?.value, accountSigningSecret());
}
