import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const ME = '222222222222222222';
const OTHER = '333333333333333333';
const CLOUDY = 'a'.repeat(64);

const orders = loadTypeScript('lib/customer-orders.ts');

function record(over = {}) {
  const kind = over.kind || 'sale';
  const event = { sale: 'payment.success', refund: 'payment.refund', failed: 'payment.failed', subscription: 'subscription.renewed' }[kind];
  const paymentId = over.paymentId || '500';
  const type = over.type || 1;
  return {
    id: (over.id || `${paymentId}-${kind}-${over.timestamp || ''}`).padEnd(64, '0').slice(0, 64).replace(/[^a-f0-9]/g, 'b'),
    economicKey: over.economicKey || `31:${type}:${paymentId}:${over.transactionId ?? 'pi_1'}:${event}`,
    timestamp: over.timestamp || '2026-11-01T10:00:00Z', kind,
    description: over.description || 'Starter kit × 1', amountMinor: over.amountMinor ?? 1300, currency: 'EUR',
    paymentId, transactionId: over.transactionId ?? 'pi_1', cloudyId: over.cloudyId ?? '', discordId: over.discordId ?? ME, googleId: '',
    email: over.email || 'buyer@example.invalid', steamId: over.steamId || '', amountConfirmed: over.amountConfirmed ?? true, ingameId: '', linkStatus: 'Not linked', mode: over.mode || 'test',
    items: over.items || [{ id: '10', name: 'Starter kit', quantity: 1, price: 13 }],
  };
}
const me = { cloudyId: CLOUDY, discordIds: [ME], steamIds: [] };

test('an order belongs to a customer only through a proven identity, never through email alone', () => {
  assert.equal(orders.ownsRecord(record(), me), true, 'Discord login');
  assert.equal(orders.ownsRecord(record({ discordId: '', cloudyId: CLOUDY }), me), true, 'matched Cloudy account');
  assert.equal(orders.ownsRecord(record({ discordId: OTHER }), me), false);
  assert.equal(orders.ownsRecord(record({ discordId: '', email: 'buyer@example.invalid' }), me), false, 'same email, no proven link');
  assert.equal(orders.ownsRecord(record({ discordId: '', steamId: '76561198000000000' }), { ...me, steamIds: ['76561198000000000'] }), true, 'linked Steam');
  assert.deepEqual(orders.recordIdentityKeys(record({ discordId: 'bad', cloudyId: 'short' })), []);
});

test('ledger entries become orders with the right status, without double counting', () => {
  const sale = record({ timestamp: '2026-11-01T10:00:00Z' });
  const [paid] = orders.buildOrders([sale, { ...sale, id: 'f'.repeat(64) }]);
  assert.equal(paid.status, 'paid');
  assert.equal(paid.paidMinor, 1300, 'a resend of the same payment counts once');
  assert.equal(paid.lines[0].name, 'Starter kit');
  assert.match(paid.id, /^[a-f0-9]{24}$/);

  const refund = record({ kind: 'refund', timestamp: '2026-11-03T10:00:00Z' });
  assert.equal(orders.buildOrders([sale, refund])[0].status, 'refunded');
  assert.equal(orders.buildOrders([sale, record({ kind: 'refund', amountMinor: 500, timestamp: '2026-11-03T10:00:00Z' })])[0].status, 'partially_refunded');
  assert.equal(orders.buildOrders([sale, { ...refund, amountConfirmed: false }])[0].status, 'paid', 'an unconfirmed refund amount is not subtracted');
  assert.equal(orders.buildOrders([record({ kind: 'failed' })])[0].status, 'failed');

  const two = orders.buildOrders([sale, record({ paymentId: '501', timestamp: '2026-11-05T10:00:00Z' }), { ...sale, kind: 'expense', economicKey: 'expense-1' }]);
  assert.equal(two.length, 2, 'expenses are never customer orders');
  assert.equal(two[0].reference, '501', 'newest first');
});

test('subscriptions show whether they are still running', () => {
  const start = record({ type: 2, paymentId: '900', timestamp: '2026-10-01T10:00:00Z' });
  const renewed = record({ type: 2, paymentId: '900', kind: 'subscription', description: 'Subscription renewed: Premium × 1', timestamp: '2026-11-01T10:00:00Z' });
  const [active] = orders.buildOrders([start, renewed]);
  assert.equal(active.subscription, true);
  assert.equal(active.status, 'subscription_active');
  const expired = record({ type: 2, paymentId: '900', kind: 'subscription', description: 'Subscription expired: Premium × 1', timestamp: '2026-12-01T10:00:00Z', economicKey: '31:2:900::subscription.expired' });
  assert.equal(orders.buildOrders([start, renewed, expired])[0].status, 'subscription_ended');
});

// ---------------------------------------------------------------- storage

function fakeBlob() {
  const files = new Map();
  return {
    files,
    async put(path, body, options) {
      if (files.has(path) && options.allowOverwrite === false) throw new Error('exists');
      files.set(path, body);
    },
    async get(path) {
      if (!files.has(path)) return null;
      return { statusCode: 200, stream: new Response(files.get(path)).body, blob: { size: files.get(path).length } };
    },
    async list({ prefix }) {
      return { blobs: [...files.keys()].filter(key => key.startsWith(prefix)).map(pathname => ({ pathname })), hasMore: false };
    },
  };
}

test('each payment is filed under its customers, and reading checks ownership again', async () => {
  const blob = fakeBlob();
  const store = loadTypeScript('lib/finance-store.ts', { imports: { '@vercel/blob': blob }, globals: { process: { env: { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'test' } } } });
  const mine = record({ cloudyId: CLOUDY });
  const theirs = record({ discordId: OTHER, paymentId: '777' });
  await store.saveFinanceRecord(mine);
  await store.saveFinanceRecord(theirs);
  await store.saveFinanceRecord(mine);
  const pointers = [...blob.files.keys()].filter(key => key.includes('/customers/'));
  assert.equal(pointers.length, 3, 'mine under Discord and Cloudy account, theirs under their Discord');
  assert.equal(pointers.some(key => key.includes(ME) || key.includes(CLOUDY)), false, 'no raw IDs in storage paths');

  assert.deepEqual((await store.customerRecords(me)).map(row => row.paymentId), ['500']);
  // A pointer to someone else's payment planted in my folder is ignored.
  const myFolder = pointers.find(key => blob.files.get(key).includes(mine.id)).split('/').slice(0, -1).join('/');
  blob.files.set(`${myFolder}/${theirs.id}.json`, JSON.stringify({ id: theirs.id }));
  assert.deepEqual((await store.customerRecords(me)).map(row => row.paymentId), ['500']);
});

// ---------------------------------------------------------------- routes

function routes(rows, user = { id: ME, name: 'Lano', provider: 'discord' }) {
  class FakeResponse {
    constructor(body, init = {}) { this.body = body; this.status = init.status ?? 200; this.headers = init.headers || {}; }
    static json(body, init = {}) { return new FakeResponse(body, init); }
  }
  const imports = {
    'next/server': { NextResponse: FakeResponse },
    '@/lib/finance-store': { customerRecords: async identity => rows.filter(row => orders.ownsRecord(row, identity)) },
    '@/lib/customer-identity': { sessionUser: () => user, customerIdentity: async () => me },
  };
  return {
    list: loadTypeScript('app/api/account/orders/route.ts', { imports }).GET,
    receipt: loadTypeScript('app/api/account/orders/[id]/route.ts', { imports }).GET,
  };
}

test('My orders lists only the customer\'s own orders and keeps transaction IDs for the receipt', async () => {
  const rows = [record(), record({ discordId: OTHER, paymentId: '777', transactionId: 'pi_secret' })];
  const { list, receipt } = routes(rows);
  const response = await list({});
  assert.equal(response.status, 200);
  assert.equal(response.body.orders.length, 1);
  assert.equal(response.headers['Cache-Control'], 'private, no-store');
  assert.equal(JSON.stringify(response.body).includes('pi_1'), false);
  const own = await receipt({}, { params: Promise.resolve({ id: response.body.orders[0].id }) });
  assert.equal(own.status, 200);
  assert.equal(own.body.order.payments[0].transactionId, 'pi_1');
  const foreignId = orders.buildOrders([rows[1]])[0].id;
  assert.equal((await receipt({}, { params: Promise.resolve({ id: foreignId }) })).status, 404, 'another customer\'s receipt is not found');
  assert.equal((await receipt({}, { params: Promise.resolve({ id: '../x' }) })).status, 404);
  const anonymous = routes(rows, null);
  assert.equal((await anonymous.list({})).status, 401);
});
