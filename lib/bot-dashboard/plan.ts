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
