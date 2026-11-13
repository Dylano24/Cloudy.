import type { PaymentEvent } from './finance';

// What a verified Cloudy Store payment unlocks, per Tip4Serv product ID.
// Configured on the server only; empty means a payment only goes into the
// ledger (the behaviour before this existed).
//
//   CLOUDY_PREMIUM_PRODUCTS  {"123": {"months": 1}, "124": {"kind": "subscription"}}
//   CLOUDY_RUST_KIT_PRODUCTS {"200": {"kit": "starter", "server": "main"}}
//
// Basket custom field markers (set on the product in Tip4Serv): the Discord
// server ID for Premium, the gamertag and platform for Rust kits.

export type PremiumProduct = { kind: 'one_time'; months: number } | { kind: 'subscription'; periodDays: number };
export type RustKitProduct = { kit: string; server: string; kind: 'one_time' | 'subscription' };
export type EntitlementConfig = {
  premium: Record<string, PremiumProduct>;
  rustKits: Record<string, RustKitProduct>;
  markers: { guild: string; gamertag: string; platform: string };
};

export type PremiumAction = {
  type: 'premium';
  body: { eventKey: string; event: 'grant' | 'renew' | 'expire' | 'refund' | 'fail'; kind: 'one_time' | 'subscription'; guildId: string; paymentRef: string; months?: number; periodDays?: number; subscriptionId?: string; buyerDiscordId?: string };
};
export type RustOrderAction = {
  type: 'rust-order';
  body: { orderKey: string; orderRef: string; paymentMode: 'live' | 'test'; server: string; platform: string; gamertag: string; discordId?: string; kits: { kit: string; quantity: number; productId: string; name: string }[] };
};
export type RustRefundAction = { type: 'rust-refund'; body: { orderRef: string } };
export type EntitlementAction = PremiumAction | RustOrderAction | RustRefundAction;
/** A paid item Cloudy could not act on (e.g. no server ID): needs staff. */
export type EntitlementProblem = { productId: string; name: string; reason: string };

const SNOWFLAKE = /^\d{17,20}$/;
const PRODUCT_ID = /^[A-Za-z0-9_-]{1,64}$/;
const KIT = /^[A-Za-z0-9_-]{1,32}$/;
const SERVER = /^[a-z0-9_-]{1,32}$/;
const MARKER = /^[A-Za-z0-9_-]{1,40}$/;

function parseJson(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

export function entitlementConfig(env: Record<string, string | undefined> = process.env): EntitlementConfig {
  const premium: Record<string, PremiumProduct> = {};
  for (const [id, raw] of Object.entries(parseJson(env.CLOUDY_PREMIUM_PRODUCTS))) {
    const value = raw as Record<string, unknown> | null;
    if (!PRODUCT_ID.test(id) || !value || typeof value !== 'object') continue;
    if (value.kind === 'subscription') {
      const periodDays = Number.isInteger(value.periodDays) ? Number(value.periodDays) : 30;
      if (periodDays >= 1 && periodDays <= 366) premium[id] = { kind: 'subscription', periodDays };
    } else if (Number.isInteger(value.months) && Number(value.months) >= 1 && Number(value.months) <= 36) {
      premium[id] = { kind: 'one_time', months: Number(value.months) };
    }
  }
  const rustKits: Record<string, RustKitProduct> = {};
  for (const [id, raw] of Object.entries(parseJson(env.CLOUDY_RUST_KIT_PRODUCTS))) {
    const value = raw as Record<string, unknown> | null;
    if (!PRODUCT_ID.test(id) || !value || typeof value.kit !== 'string' || typeof value.server !== 'string') continue;
    if (!KIT.test(value.kit) || !SERVER.test(value.server)) continue;
    rustKits[id] = { kit: value.kit, server: value.server, kind: value.kind === 'subscription' ? 'subscription' : 'one_time' };
  }
  const marker = (value: string | undefined, fallback: string) => (value && MARKER.test(value) ? value : fallback);
  return {
    premium,
    rustKits,
    markers: {
      guild: marker(env.CLOUDY_PREMIUM_GUILD_MARKER, 'guild_id'),
      gamertag: marker(env.CLOUDY_RUST_GAMERTAG_MARKER, 'gamertag'),
      platform: marker(env.CLOUDY_RUST_PLATFORM_MARKER, 'platform'),
    },
  };
}

export function hasEntitlements(config: EntitlementConfig) {
  return Object.keys(config.premium).length > 0 || Object.keys(config.rustKits).length > 0;
}

type BasketItem = PaymentEvent['data']['basket'][number];

/** The text a customer entered or chose in the custom field with this marker. */
export function customFieldValue(item: BasketItem, marker: string): string {
  const fields = item.custom_fields ? (Array.isArray(item.custom_fields) ? item.custom_fields : Object.values(item.custom_fields)) : [];
  const field = fields.find(entry => entry?.marker === marker);
  const raw = field?.value;
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'object') return String((raw as { value?: unknown }).value ?? (raw as { name?: unknown }).name ?? '').trim();
  return String(raw).trim();
}

const safe = (value: string) => value.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 64);

/**
 * Turns one verified Tip4Serv event into entitlement actions. Subscription
 * products follow only subscription.* events (plus refunds and failures);
 * one-time products only payment.* events, so a checkout that sends both
 * payment.success and subscription.created is counted once.
 */
export function entitlementActions(event: PaymentEvent, config: EntitlementConfig): { actions: EntitlementAction[]; problems: EntitlementProblem[] } {
  const actions: EntitlementAction[] = [];
  const problems: EntitlementProblem[] = [];
  const { data } = event;
  const store = safe(String(event.store_id));
  const recordId = `${data.type}:${safe(String(data.id))}`;
  // Renewals without a provider transaction ID (test and bypass payments) are told apart by their day.
  const txn = safe(data.transaction_id || (event.event === 'subscription.renewed' ? event.created_at.slice(0, 10) : ''));
  const base = `tip4serv:${store}:${recordId}:${txn}`;
  const buyer = data.user.discord_id && SNOWFLAKE.test(data.user.discord_id) ? data.user.discord_id : undefined;
  const subscriptionId = `tip4serv:${store}:${safe(String(data.id))}`;

  const rustByTarget = new Map<string, RustOrderAction>();
  let rustRefund = false;

  data.basket.forEach((item, index) => {
    const productId = String(item.id);
    const premium = config.premium[productId];
    if (premium) {
      const eventKey = `${base}:${event.event}:${index}`;
      const paymentRef = `${base}:${index}`;
      if (premium.kind === 'one_time') {
        if (event.event !== 'payment.success' && event.event !== 'payment.refund') return;
        const guildId = customFieldValue(item, config.markers.guild);
        if (!SNOWFLAKE.test(guildId)) { problems.push({ productId, name: item.name, reason: 'missing_server_id' }); return; }
        if (event.event === 'payment.success') {
          actions.push({ type: 'premium', body: { eventKey, event: 'grant', kind: 'one_time', guildId, paymentRef, months: Math.min(36, premium.months * item.quantity), ...(buyer ? { buyerDiscordId: buyer } : {}) } });
        } else {
          actions.push({ type: 'premium', body: { eventKey, event: 'refund', kind: 'one_time', guildId, paymentRef } });
        }
        return;
      }
      const guildId = customFieldValue(item, config.markers.guild);
      if (event.event === 'payment.success') return;
      if (!SNOWFLAKE.test(guildId)) { problems.push({ productId, name: item.name, reason: 'missing_server_id' }); return; }
      const common = { eventKey, kind: 'subscription' as const, guildId, paymentRef, subscriptionId };
      if (event.event === 'subscription.created') actions.push({ type: 'premium', body: { ...common, event: 'grant', periodDays: premium.periodDays, ...(buyer ? { buyerDiscordId: buyer } : {}) } });
      else if (event.event === 'subscription.renewed') actions.push({ type: 'premium', body: { ...common, event: 'renew', periodDays: premium.periodDays, ...(buyer ? { buyerDiscordId: buyer } : {}) } });
      // A refunded subscription payment ends the subscription right away.
      else if (event.event === 'subscription.expired' || event.event === 'payment.refund') actions.push({ type: 'premium', body: { ...common, event: 'expire' } });
      else if (event.event === 'payment.failed') actions.push({ type: 'premium', body: { ...common, event: 'fail' } });
      return;
    }

    const kit = config.rustKits[productId];
    if (!kit) return;
    if (event.event === 'payment.refund') { rustRefund = true; return; }
    const delivers = kit.kind === 'one_time' ? event.event === 'payment.success' : event.event === 'subscription.created' || event.event === 'subscription.renewed';
    if (!delivers) return;
    const gamertag = customFieldValue(item, config.markers.gamertag);
    const platform = customFieldValue(item, config.markers.platform);
    if (!gamertag || !platform) { problems.push({ productId, name: item.name, reason: 'missing_gamertag' }); return; }
    // One order per server and player; the bot validates the gamertag itself.
    const target = `${kit.server}|${platform.toLowerCase()}|${gamertag.toLowerCase()}`;
    const order = rustByTarget.get(target) || {
      type: 'rust-order' as const,
      body: { orderKey: `${base}:${event.event}:${safe(kit.server)}:${rustByTarget.size}`, orderRef: base, paymentMode: event.mode, server: kit.server, platform, gamertag, ...(buyer ? { discordId: buyer } : {}), kits: [] },
    };
    order.body.kits.push({ kit: kit.kit, quantity: Math.min(20, item.quantity), productId, name: item.name.slice(0, 100) });
    rustByTarget.set(target, order);
  });

  actions.push(...rustByTarget.values());
  if (rustRefund) actions.push({ type: 'rust-refund', body: { orderRef: base } });
  return { actions, problems };
}
