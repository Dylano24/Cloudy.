import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const STAFF = '999999999999999999';
const admin = { id: STAFF, name: 'Lano', provider: 'discord' };
const { staffFromSession, actionsFor } = loadTypeScript('lib/delivery-admin.ts');

test('only an allow-listed account with a Discord ID reaches the staff screen', () => {
  assert.equal(staffFromSession(null, undefined, `discord:${STAFF}`).status, 401);
  assert.equal(staffFromSession({ ...admin, id: '111111111111111111' }, undefined, `discord:${STAFF}`).status, 403);
  const google = { id: 'g-123', name: 'Lano', provider: 'google' };
  assert.equal(staffFromSession(google, undefined, 'google:g-123').status, 403, 'needs a linked Discord account');
  assert.deepEqual(staffFromSession(google, STAFF, 'google:g-123').discordId, STAFF);
  assert.equal(staffFromSession(admin, undefined, `discord:${STAFF}`).discordId, STAFF);
});

test('staff actions match what Cloudy allows for each status', () => {
  assert.deepEqual(actionsFor('needs_review'), ['mark-delivered', 'retry', 'cancel']);
  assert.deepEqual(actionsFor('failed'), ['retry', 'cancel']);
  assert.deepEqual(actionsFor('queued'), ['cancel']);
  assert.deepEqual(actionsFor('delivered'), []);
  assert.deepEqual(actionsFor('delivering'), [], 'never while a command may be on its way');
});

function routes({ user = admin, mode = 'mock', fail = null } = {}) {
  const calls = [];
  class FakeResponse {
    constructor(body, init = {}) { this.body = body; this.status = init.status ?? 200; }
    static json(body, init = {}) { return new FakeResponse(body, init); }
  }
  class BotApiError extends Error { constructor(message, status, code) { super(message); this.status = status; this.code = code; } }
  const signedBotCall = async (method, path, actor, payload) => {
    calls.push({ method, path, actor, payload });
    if (fail) throw new BotApiError(fail.message, fail.status, fail.code);
    if (path === '/billing/rust/status') return { mode, servers: ['main'], requireVerification: true, counts: {} };
    if (path.endsWith('/query')) return { deliveries: [{ id: 'a'.repeat(24), status: 'failed' }], counts: { failed: 1 } };
    return { delivery: { id: 'a'.repeat(24), status: 'queued' } };
  };
  const imports = {
    'next/server': { NextResponse: FakeResponse },
    '@/lib/bot-dashboard/bot-api': { signedBotCall, BotApiError },
    '@/lib/account-links-store': { getAccountLinks: async () => ({}) },
  };
  const globals = { process: { env: { CLOUDY_STAFF_ADMINS: `discord:${STAFF}` } } };
  const lib = loadTypeScript('lib/delivery-admin.ts', { globals });
  imports['@/lib/delivery-admin'] = { ...lib, sessionFrom: () => user };
  return {
    calls,
    list: loadTypeScript('app/api/admin/deliveries/route.ts', { imports, globals }).GET,
    act: loadTypeScript('app/api/admin/deliveries/[id]/route.ts', { imports, globals }).POST,
  };
}
const req = ({ status = '', origin = 'https://cloudy.example', body = '{"action":"retry"}' } = {}) => ({
  nextUrl: { origin: 'https://cloudy.example', searchParams: new URLSearchParams(status ? { status } : {}) },
  headers: { get: name => (name === 'origin' ? origin : null) },
  text: async () => body,
});

test('the list is read from Cloudy as the signed-in staff member', async () => {
  const { list, calls } = routes();
  const response = await list(req({ status: 'failed' }));
  assert.equal(response.status, 200);
  assert.equal(response.body.deliveries.length, 1);
  assert.deepEqual(calls.map(call => [call.path, call.actor]), [['/billing/rust/status', STAFF], ['/billing/rust/deliveries/query', STAFF]]);
  assert.equal(calls[1].payload.status, 'failed');
  const unknown = routes();
  await unknown.list(req({ status: 'nonsense' }));
  assert.equal(unknown.calls[1].payload.status, undefined);
});

test('with delivery switched off the screen says so and queries nothing else', async () => {
  const { list, calls } = routes({ mode: 'off' });
  const response = await list(req());
  assert.equal(response.body.mode, 'off');
  assert.deepEqual(response.body.deliveries, []);
  assert.equal(calls.length, 1);
});

test('actions: same origin, known action, valid ID; Cloudy\'s refusal is passed on', async () => {
  const { act, calls } = routes();
  const ok = await act(req(), { params: Promise.resolve({ id: 'a'.repeat(24) }) });
  assert.equal(ok.status, 200);
  assert.equal(calls[0].path, `/billing/rust/deliveries/${'a'.repeat(24)}/retry`);
  assert.equal((await act(req({ origin: 'https://evil.example' }), { params: Promise.resolve({ id: 'a'.repeat(24) }) })).status, 403);
  assert.equal((await act(req({ body: '{"action":"delete"}' }), { params: Promise.resolve({ id: 'a'.repeat(24) }) })).status, 422);
  assert.equal((await act(req(), { params: Promise.resolve({ id: '../x' }) })).status, 404);
  assert.equal((await routes({ user: null }).act(req(), { params: Promise.resolve({ id: 'a'.repeat(24) }) })).status, 401);
  const refused = routes({ fail: { message: 'Only Cloudy staff can manage deliveries.', status: 403, code: 'forbidden' } });
  const response = await refused.act(req(), { params: Promise.resolve({ id: 'a'.repeat(24) }) });
  assert.equal(response.status, 403);
  assert.equal(response.body.error, 'Only Cloudy staff can manage deliveries.');
});
