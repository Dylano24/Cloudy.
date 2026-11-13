import type { Plan } from './bot-api';

// Cloudy Bot Premium. Cloudy itself enforces the plan; this only shows it.
export const PLAN_PRICE_EUR = 13;
export const PLAN_TRIAL_DAYS = 7;
export const PLAN_NAME = 'Cloudy Bot Premium';
export const PLAN_ORDER_URL = 'https://discord.gg/EGDVMmmSzF';

export const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
export const PRICE_LABEL = `${euro.format(PLAN_PRICE_EUR)} / month`;

export const PLAN_FEATURES = [
  'Every Cloudy module in one dashboard',
  'Changes apply in Discord right away',
  'Live overviews: moderation, giveaways, economy, music and more',
  'Every change checked against Discord permissions and logged',
];

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });

export function daysLeft(until: string | null, now = Date.now()) {
  const end = until ? Date.parse(until) : NaN;
  return Number.isFinite(end) ? Math.max(0, Math.ceil((end - now) / 86_400_000)) : 0;
}

export function formatPlanDate(until: string | null) {
  const end = until ? Date.parse(until) : NaN;
  return Number.isFinite(end) ? dateFormat.format(end) : '';
}

/** Short, user-facing description of a server's plan. */
export function describePlan(plan: Plan, now = Date.now()) {
  const days = daysLeft(plan.until, now);
  switch (plan.status) {
    case 'owner':
      return { label: 'Owner access', tone: 'good' as const, text: 'You own Cloudy, so every setting is unlocked on all your servers.' };
    case 'premium':
      return { label: 'Premium', tone: 'good' as const, text: `Premium is active until ${formatPlanDate(plan.until)}.` };
    case 'trial':
      return { label: `Free trial · ${days} ${days === 1 ? 'day' : 'days'} left`, tone: 'neutral' as const, text: `Everything works during your free trial, until ${formatPlanDate(plan.until)}. After that Premium is ${PRICE_LABEL}.` };
    case 'expired':
      return { label: 'Premium needed to save', tone: 'warn' as const, text: `You can still view and try every setting. Saving needs ${PLAN_NAME}, ${PRICE_LABEL}.` };
    default:
      return { label: `${PLAN_TRIAL_DAYS}-day free trial`, tone: 'neutral' as const, text: `Your free trial starts with your first saved change. After ${PLAN_TRIAL_DAYS} days Premium is ${PRICE_LABEL}.` };
  }
}

/**
 * Direct checkout on Cloudy Store (Tip4Serv) for Premium. Server-side
 * configuration; when it is missing the plan page keeps ordering via Discord.
 *   CLOUDY_PREMIUM_CHECKOUT {"product": "123", "guildFieldId": "45", "subscription": true}
 * The product needs a text custom field (marker "guild_id") for the server ID.
 */
export type PremiumCheckout = { product: string; guildFieldId: string; subscription: boolean; manageUrl: string | null };

export function premiumCheckoutConfig(env: Record<string, string | undefined> = process.env): PremiumCheckout | null {
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(env.CLOUDY_PREMIUM_CHECKOUT || ''); } catch { return null; }
  if (!raw || typeof raw !== 'object') return null;
  const product = String(raw.product ?? '');
  const guildFieldId = String(raw.guildFieldId ?? '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(product) || !/^\d{1,12}$/.test(guildFieldId)) return null;
  let manageUrl: string | null = null;
  if (typeof raw.manageUrl === 'string') {
    try { const url = new URL(raw.manageUrl); if (url.protocol === 'https:') manageUrl = url.toString(); } catch { manageUrl = null; }
  }
  return { product, guildFieldId, subscription: raw.subscription !== false, manageUrl };
}
