import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const GUILD = '111111111111111111';
const BUYER = '222222222222222222';
const BOT_SECRET = 'b'.repeat(48);
const WEBHOOK_SECRET = Buffer.from('tip4serv-test-secret').toString('base64');

const { entitlementActions, entitlementConfig, customFieldValue } = loadTypeScript('lib/store-entitlements.ts');
const { parsePaymentEvent, recordFromEvent, isKnownPaymentEvent } = loadTypeScript('lib/finance.ts');

const config = entitlementConfig({
  CLOUDY_PREMIUM_PRODUCTS: JSON.stringify({ 10: { months: 1 }, 11: { kind: 'subscription' }, bad: { months: 99 }, 'x y': { months: 1 } }),
  CLOUDY_RUST_KIT_PRODUCTS: JSON.stringify({ 20: { kit: 'starter', server: 'main' }, 21: { kit: 'vip', server: 'main' }, 22: { kit: 'bad"kit', server: 'main' }, 23: { kit: 'monthly', server: 'main', kind: 'subscription' } }),
});

function event({ name = 'payment.success', basket, type = 1, id = 500, txn = 'pi_1', createdAt = '2026-11-13T12:00:00Z', mode = 'test' } = {}) {
  return parsePaymentEvent({
    event: name, created_at: createdAt, request_id: `req-${name}-${id}`, store_id: '31', mode,
    data: { id, type, ...(txn ? { transaction_id: txn } : {}), amount: { total_paid: 13, currency: 'EUR' }, user: { discord_id: BUYER, email: 'buyer@example.invalid' }, basket },
  }, '31', mode);
}
const guildField = (value = GUILD) => ({ 1: { field_id: 1, name: 'Discord server ID', marker: 'guild_id', value } });
const rustFields = (gamertag = 'Cloudy Player', platform = 'xbox') => ({ 1: { marker: 'gamertag', value: gamertag }, 2: { marker: 'platform', type: 'selection', value: { option_id: 3, name: 'Xbox', value: platform } } });

test('only valid product configuration is used', () => {
  assert.deepEqual(Object.keys(config.premium).sort(), ['10', '11']);
  assert.deepEqual(Object.keys(config.rustKits).sort(), ['20', '21', '23']);
  assert.deepEqual(entitlementConfig({ CLOUDY_PREMIUM_PRODUCTS: '{not json' }).premium, {});
  assert.equal(config.premium['11'].periodDays, 30);
});

test('custom fields are read from text and selection values', () => {
  const [item] = event({ basket: [{ id: 20, name: 'Starter', quantity: 1, price: 5, custom_fields: rustFields('Cloudy Player', 'playstation') }] }).data.basket;
  assert.equal(customFieldValue(item, 'gamertag'), 'Cloudy Player');
  assert.equal(customFieldValue(item, 'platform'), 'playstation');
  assert.equal(customFieldValue(item, 'missing'), '');
});

test('Tip4Serv subscription events are understood and never counted as revenue', () => {
  for (const name of ['subscription.created', 'subscription.renewed', 'subscription.expired']) assert.equal(isKnownPaymentEvent(name), true);
  assert.equal(isKnownPaymentEvent('store.updated'), false);
  const row = recordFromEvent(event({ name: 'subscription.renewed', type: 2, basket: [{ id: 11, name: 'Premium', quantity: 1, price: 13, custom_fields: guildField() }] }));
  assert.equal(row.kind, 'subscription');
  assert.equal(JSON.stringify(row.items).includes('guild_id'), false, 'custom field answers are not copied into the ledger');
});

test('one-time Premium: payment.success grants months x quantity for the chosen server; refund takes it back', () => {
  const basket = [{ id: 10, name: 'Premium 1 month', quantity: 3, price: 13, custom_fields: guildField() }];
  const { actions, problems } = entitlementActions(event({ basket }), config);
  assert.deepEqual(problems, []);
  assert.equal(actions.length, 1);
  assert.deepEqual(actions[0], { type: 'premium', body: { eventKey: 'tip4serv:31:1:500:pi_1:payment.success:0', event: 'grant', kind: 'one_time', guildId: GUILD, paymentRef: 'tip4serv:31:1:500:pi_1:0', months: 3, buyerDiscordId: BUYER } });
  const refund = entitlementActions(event({ name: 'payment.refund', basket }), config).actions[0];
  assert.equal(refund.body.event, 'refund');
  assert.equal(refund.body.paymentRef, actions[0].body.paymentRef, 'a refund points at the payment it reverses');
  const missing = entitlementActions(event({ basket: [{ ...basket[0], custom_fields: guildField('not-a-server') }] }), config);
  assert.deepEqual(missing.actions, []);
  assert.equal(missing.problems[0].reason, 'missing_server_id');
});

test('subscription Premium follows only the subscription lifecycle, so one checkout counts once', () => {
  const basket = [{ id: 11, name: 'Premium monthly', quantity: 1, price: 13, custom_fields: guildField() }];
  assert.deepEqual(entitlementActions(event({ basket, type: 2 }), config).actions, [], 'payment.success is left to subscription.created');
  const created = entitlementActions(event({ name: 'subscription.created', basket, type: 2 }), config).actions[0].body;
  assert.equal(created.event, 'grant');
  assert.equal(created.subscriptionId, 'tip4serv:31:500');
  assert.equal(created.periodDays, 30);
  // Test renewals have no transaction ID; two renewals are still told apart.
  const first = entitlementActions(event({ name: 'subscription.renewed', basket, type: 2, txn: '', createdAt: '2026-12-13T12:00:00Z' }), config).actions[0].body;
  const second = entitlementActions(event({ name: 'subscription.renewed', basket, type: 2, txn: '', createdAt: '2027-01-13T12:00:00Z' }), config).actions[0].body;
  assert.equal(first.event, 'renew');
  assert.notEqual(first.eventKey, second.eventKey);
  assert.notEqual(first.paymentRef, second.paymentRef);
  assert.equal(entitlementActions(event({ name: 'subscription.expired', basket, type: 2 }), config).actions[0].body.event, 'expire');
  assert.equal(entitlementActions(event({ name: 'payment.refund', basket, type: 2 }), config).actions[0].body.event, 'expire');
  assert.equal(entitlementActions(event({ name: 'payment.failed', basket, type: 2 }), config).actions[0].body.event, 'fail');
});

test('Rust kits: one order per player and server; refunds and missing gamertags are handled', () => {
  const basket = [
    { id: 20, name: 'Starter', quantity: 2, price: 5, custom_fields: rustFields() },
    { id: 21, name: 'VIP', quantity: 1, price: 10, custom_fields: rustFields() },
    { id: 99, name: 'Unrelated product', quantity: 1, price: 1 },
  ];
  const { actions } = entitlementActions(event({ basket }), config);
  assert.equal(actions.length, 1);
  assert.equal(actions[0].type, 'rust-order');
  assert.deepEqual(actions[0].body.kits.map(kit => [kit.kit, kit.quantity]), [['starter', 2], ['vip', 1]]);
  assert.equal(actions[0].body.paymentMode, 'test');
  assert.equal(actions[0].body.discordId, BUYER);
  assert.deepEqual(entitlementActions(event({ name: 'payment.refund', basket }), config).actions, [{ type: 'rust-refund', body: { orderRef: 'tip4serv:31:1:500:pi_1' } }]);
  const noTag = entitlementActions(event({ basket: [{ id: 20, name: 'Starter', quantity: 1, price: 5 }] }), config);
  assert.equal(noTag.problems[0].reason, 'missing_gamertag');
  const monthly = [{ id: 23, name: 'Monthly kit', quantity: 1, price: 5, custom_fields: rustFields() }];
  assert.deepEqual(entitlementActions(event({ basket: monthly }), config).actions, []);
  assert.equal(entitlementActions(event({ name: 'subscription.renewed', type: 2, basket: monthly }), config).actions[0].type, 'rust-order');
});

// ---------------------------------------------------------------- webhook route

function loadRoute({ botResponse = () => ({ status: 200, body: { result: 'granted' } }), env = {} } = {}) {
  const saved = { records: [], outcomes: [], botCalls: [] };
  class FakeResponse {
    constructor(body, init = {}) { this.body = body; this.status = init.status ?? 200; this.headers = new Map(Object.entries(init.headers || {})); }
    static json(body, init = {}) { return new FakeResponse(body, init); }
  }
  const fetch = async (url, init) => {
    saved.botCalls.push({ url, init });
    const { status, body } = botResponse(saved.botCalls.length);
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  const route = loadTypeScript('app/api/tip4serv/webhook/route.ts', {
    imports: {
      'next/server': { NextResponse: FakeResponse },
      '@/lib/finance-store': { saveFinanceRecord: async record => { saved.records.push(record); }, saveEntitlementOutcome: async (id, outcome) => { saved.outcomes.push({ id, outcome }); } },
      '@/lib/account-links-store': { matchCheckoutIdentity: async () => null },
    },
    globals: {
      fetch,
      console: { warn() {}, log() {}, error() {} },
      process: { env: { TIP4SERV_WEBHOOK_SECRET: WEBHOOK_SECRET, TIP4SERV_STORE_ID: '31', VERCEL_ENV: 'preview', CLOUDY_DASHBOARD_API_SECRET: BOT_SECRET, CLOUDY_BOT_API_URL: 'https://bot.example.com', CLOUDY_PREMIUM_PRODUCTS: JSON.stringify({ 10: { months: 1 } }), ...env } },
    },
  });
  return { POST: route.POST, saved };
}

function signedRequest(payload) {
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', Buffer.from(WEBHOOK_SECRET, 'base64')).update(`${timestamp}.${body}`).digest('hex');
  const headers = new Map([['x-pay-timestamp', timestamp], ['x-pay-signature', signature], ['content-length', String(body.length)]]);
  return { headers: { get: name => headers.get(name) ?? null }, text: async () => body };
}

const premiumPayment = (name = 'payment.success') => ({
  event: name, created_at: '2026-11-13T12:00:00Z', request_id: 'req-1', store_id: 31, mode: 'test',
  data: { id: 500, type: 1, transaction_id: 'pi_1', amount: { total_paid: 13, currency: 'EUR' }, user: { discord_id: BUYER }, basket: [{ id: 10, name: 'Premium', quantity: 1, price: '13.00', custom_fields: guildField() }] },
});

test('webhook: a paid Premium order is logged and sent to Cloudy over the signed connection', async () => {
  const { POST, saved } = loadRoute();
  const response = await POST(signedRequest(premiumPayment()));
  assert.equal(response.status, 200);
  assert.equal(saved.records.length, 1);
  assert.equal(saved.botCalls.length, 1);
  const { url, init } = saved.botCalls[0];
  assert.equal(url, 'https://bot.example.com/api/dashboard/v1/billing/premium');
  assert.equal(init.headers.Authorization, undefined, 'never a user token');
  // Same canonical string as Cloudy's verifySignedRequest.
  const h = init.headers;
  const canonical = ['cloudy-dashboard-v1', 'POST', '/api/dashboard/v1/billing/premium', h['x-cloudy-dashboard-timestamp'], h['x-cloudy-dashboard-nonce'], BUYER, createHash('sha256').update(init.body).digest('hex')].join('\n');
  assert.equal(h['x-cloudy-dashboard-signature'], createHmac('sha256', BOT_SECRET).update(canonical).digest('base64url'));
  assert.equal(JSON.parse(init.body).guildId, GUILD);
  assert.equal(saved.outcomes[0].outcome.outcomes[0].status, 'applied');
});

test('webhook: Cloudy offline means 503 with Retry-After, so Tip4Serv delivers again', async () => {
  const { POST, saved } = loadRoute({ botResponse: () => ({ status: 503, body: { error: 'Cloudy is starting.', code: 'starting' } }) });
  const response = await POST(signedRequest(premiumPayment()));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(saved.records.length, 1, 'the payment is still logged once');
  assert.equal(saved.outcomes.length, 0);
});

test('webhook: a permanent refusal stops retries and is kept for staff', async () => {
  const { POST, saved } = loadRoute({ botResponse: () => ({ status: 422, body: { error: 'Invalid server ID.', code: 'invalid' } }) });
  const response = await POST(signedRequest(premiumPayment()));
  assert.equal(response.status, 200);
  assert.equal(saved.outcomes[0].outcome.outcomes[0].status, 'rejected');
});

test('webhook: without the signed connection a paid entitlement is retried, never dropped', async () => {
  const { POST, saved } = loadRoute({ env: { CLOUDY_DASHBOARD_API_SECRET: '' } });
  const response = await POST(signedRequest(premiumPayment()));
  assert.equal(response.status, 503);
  assert.equal(saved.botCalls.length, 0);
});

test('webhook: subscription events are accepted (they were refused with 400 before) and unknown events are acknowledged', async () => {
  const { POST, saved } = loadRoute({ env: { CLOUDY_PREMIUM_PRODUCTS: '' } });
  const created = { ...premiumPayment('subscription.created'), data: { ...premiumPayment().data, type: 2 } };
  assert.equal((await POST(signedRequest(created))).status, 200);
  assert.equal(saved.records[0].kind, 'subscription');
  assert.equal((await POST(signedRequest({ ...created, event: 'store.updated' }))).status, 202);
  assert.equal(saved.botCalls.length, 0, 'nothing is unlocked without configured products');
  const unsigned = { headers: { get: () => null }, text: async () => '{}' };
  assert.equal((await POST(unsigned)).status, 401);
});
