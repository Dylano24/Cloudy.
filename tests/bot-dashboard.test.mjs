import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const SECRET = 'test-dashboard-secret-0123456789abcdef';
const session = loadTypeScript('lib/bot-dashboard/session.ts');
const permissions = loadTypeScript('lib/bot-dashboard/permissions.ts');
const modules = loadTypeScript('lib/bot-dashboard/modules.ts');
const validation = loadTypeScript('lib/bot-dashboard/validation.ts');
const botApi = loadTypeScript('lib/bot-dashboard/bot-api.ts');
const rateLimit = loadTypeScript('lib/bot-dashboard/rate-limit.ts');

const sample = {
  sid: 'AAAAAAAAAAAAAAAAAAAAAA',
  uid: '123456789012345678',
  name: 'Cloudy Admin',
  username: 'cloudyadmin',
  avatar: null,
  at: 'discord-access-token-value-1234567890',
  exp: 2_000_000_000,
};

test('dashboard sessions are encrypted, authenticated and expire', () => {
  const sealed = session.sealSession(sample, SECRET);
  assert.ok(!sealed.includes(sample.at), 'the Discord token is never readable in the cookie');
  assert.ok(!sealed.includes(sample.uid));
  assert.deepEqual(session.openSession(sealed, SECRET, 1_000), sample);
  assert.equal(session.openSession(sealed, 'another-secret-0123456789abcdef', 1_000), null);
  assert.equal(session.openSession(sealed, SECRET, 2_000_000_001), null, 'expired');
  const [version, iv, body] = sealed.split('.');
  const flipped = body.slice(0, -2) + (body.at(-2) === 'A' ? 'B' : 'A') + body.at(-1);
  assert.equal(session.openSession(`${version}.${iv}.${flipped}`, SECRET, 1_000), null, 'tampered');
  assert.equal(session.openSession('garbage', SECRET, 1_000), null);
  assert.equal(session.openSession('', SECRET, 1_000), null);
});

test('sessions with invalid content are rejected even when correctly encrypted', () => {
  const bad = session.sealSession({ ...sample, uid: 'not-a-snowflake' }, SECRET);
  assert.equal(session.openSession(bad, SECRET, 1_000), null);
});

test('CSRF tokens are bound to one session', () => {
  const token = session.csrfTokenFor(sample, SECRET);
  assert.equal(session.verifyCsrfToken(sample, token, SECRET), true);
  assert.equal(session.verifyCsrfToken({ sid: 'BBBBBBBBBBBBBBBBBBBBBB' }, token, SECRET), false);
  assert.equal(session.verifyCsrfToken(sample, null, SECRET), false);
  assert.equal(session.verifyCsrfToken(sample, 'x'.repeat(43), SECRET), false);
});

test('login state is signed, short-lived and only returns to dashboard paths', () => {
  const state = session.createLoginState('/bot/123456789012345678/welcome', SECRET, 1_000_000_000);
  assert.deepEqual(session.verifyLoginState(state, SECRET, 1_000_000_100), { returnTo: '/bot/123456789012345678/welcome' });
  assert.equal(session.verifyLoginState(state, SECRET, 1_000_000_700), null, 'older than 10 minutes');
  assert.equal(session.verifyLoginState(state, 'wrong-secret-0123456789abcdef', 1_000_000_100), null);
  assert.equal(session.verifyLoginState(state.replace(/.$/, c => (c === 'A' ? 'B' : 'A')), SECRET, 1_000_000_100), null);
  for (const hostile of ['//evil.example', 'https://evil.example', '/bot/../admin', '/botx', '/bot/a/b/c', 'javascript:alert(1)', '/bot\\evil']) {
    assert.equal(session.safeReturnPath(hostile), '/bot', hostile);
  }
  assert.equal(session.safeReturnPath('/bot/demo'), '/bot/demo');
});

test('only owners, Administrators and Manage Server can manage a guild', () => {
  assert.equal(permissions.manageRole({ owner: true, permissions: '0' }), 'owner');
  assert.equal(permissions.manageRole({ owner: false, permissions: '8' }), 'administrator');
  assert.equal(permissions.manageRole({ owner: false, permissions: '32' }), 'manager');
  assert.equal(permissions.manageRole({ owner: false, permissions: String(1 << 13) }), null, 'Manage Messages alone is not enough');
  assert.equal(permissions.manageRole({ owner: false, permissions: 'abc' }), null);
  assert.equal(permissions.manageRole({ owner: false }), null);
  // Large bitfields (above 2^53) still keep Manage Server.
  assert.equal(permissions.manageRole({ permissions: (BigInt(1) << BigInt(45) | BigInt(32)).toString() }), 'manager');

  const { manageable, hidden } = permissions.manageableGuilds([
    { id: '111111111111111111', name: 'Zeta', icon: null, owner: true, permissions: '0' },
    { id: '222222222222222222', name: 'alpha', icon: 'a_' + 'f'.repeat(32), owner: false, permissions: '32' },
    { id: '333333333333333333', name: 'Member only', icon: null, owner: false, permissions: '1024' },
    { id: 'bad', name: 'Invalid', icon: null, owner: true, permissions: '8' },
    { id: '444444444444444444', name: 'Bad icon', icon: '../../x', owner: true, permissions: '8' },
  ]);
  assert.deepEqual(manageable.map(guild => guild.name), ['alpha', 'Bad icon', 'Zeta']);
  assert.equal(hidden, 1);
  assert.equal(manageable.find(guild => guild.name === 'Bad icon').icon, null);
});

test('the invite asks for Cloudy\'s feature permissions but never Administrator', () => {
  const bits = BigInt(permissions.invitePermissionBits());
  assert.equal(bits & permissions.PERMISSIONS.ADMINISTRATOR, BigInt(0));
  assert.notEqual(bits & permissions.PERMISSIONS.MODERATE_MEMBERS, BigInt(0));
  assert.notEqual(bits & permissions.PERMISSIONS.MANAGE_ROLES, BigInt(0));
});

test('every module field has a validator and the catalog has unique ids', () => {
  const ids = new Set();
  for (const mod of modules.MODULES) {
    assert.ok(!ids.has(mod.id), `duplicate ${mod.id}`);
    ids.add(mod.id);
    const paths = new Set();
    for (const field of modules.allFields(mod)) {
      assert.ok(!paths.has(field.path), `${mod.id}.${field.path} duplicated`);
      paths.add(field.path);
      assert.ok(validation.schemaForField(field), `${mod.id}.${field.path}`);
    }
  }
});

test('module changes are validated strictly', () => {
  const welcome = modules.getModule('welcome');
  const leveling = modules.getModule('leveling');
  const tickets = modules.getModule('tickets');
  const logging = modules.getModule('logging');
  const feeds = modules.getModule('feeds');

  assert.deepEqual(validation.validateModuleChanges(welcome, { enabled: true, channelId: '123456789012345678' }), { ok: true, changes: { enabled: true, channelId: '123456789012345678' } });
  assert.equal(validation.validateModuleChanges(welcome, { __proto__: { enabled: true } }).ok, false, 'nothing to save');
  assert.equal(validation.validateModuleChanges(welcome, { isAdmin: true }).ok, false, 'unknown path');
  assert.equal(validation.validateModuleChanges(welcome, { enabled: 'yes' }).ok, false);
  assert.equal(validation.validateModuleChanges(welcome, { channelId: '123; DROP TABLE' }).ok, false);
  assert.equal(validation.validateModuleChanges(welcome, { 'leaveEmbed.image': 'javascript:alert(1)' }).ok, false);
  assert.equal(validation.validateModuleChanges(welcome, { 'leaveEmbed.image': 'http://insecure.example/a.png' }).ok, false);
  assert.equal(validation.validateModuleChanges(welcome, { 'leaveEmbed.image': 'https://cdn.example/a.png' }).ok, true);
  assert.equal(validation.validateModuleChanges(welcome, { 'leaveEmbed.title': 'Line\nbreak' }).ok, false, 'single-line text');
  assert.equal(validation.validateModuleChanges(welcome, { leaveMessage: 'x'.repeat(2001) }).ok, false);
  assert.equal(validation.validateModuleChanges(welcome, { leaveMessage: 'bad\u0007bell' }).ok, false);
  assert.equal(validation.validateModuleChanges(welcome, { 'leaveEmbed.color': 'red' }).ok, false);

  assert.equal(validation.validateModuleChanges(leveling, { 'xpRange.min': 30, 'xpRange.max': 10 }).ok, false);
  assert.equal(validation.validateModuleChanges(leveling, { 'xpRange.min': 0 }).ok, false);
  assert.equal(validation.validateModuleChanges(leveling, { xpCooldown: 1.5 }).ok, false);
  assert.equal(validation.validateModuleChanges(leveling, { roleRewards: { 10: '123456789012345678' } }).ok, true);
  assert.equal(validation.validateModuleChanges(leveling, { roleRewards: { 501: '123456789012345678' } }).ok, false);
  assert.equal(validation.validateModuleChanges(leveling, { ignoredRoles: ['123456789012345678', '123456789012345678'] }).ok, false, 'duplicates');

  assert.equal(validation.validateModuleChanges(tickets, { maxTicketsPerUser: 11 }).ok, false);
  assert.equal(validation.validateModuleChanges(logging, { 'logging.enabledEvents': { 'message.delete': true } }).ok, true);
  assert.equal(validation.validateModuleChanges(logging, { 'logging.enabledEvents': { 'evil.event': true } }).ok, false);

  const feed = { name: 'Clips', source: 'https://example.com', channelId: '123456789012345678', minutes: 60, mediaType: 'video', adult: false, active: true };
  assert.equal(validation.validateModuleChanges(feeds, { feeds: [feed] }).ok, true);
  assert.equal(validation.validateModuleChanges(feeds, { feeds: [{ ...feed, extra: 1 }] }).ok, false, 'unknown item key');
  assert.equal(validation.validateModuleChanges(feeds, { feeds: Array(6).fill(feed) }).ok, false, 'max 5 feeds');
  assert.equal(validation.validateModuleChanges(feeds, { feeds: [{ ...feed, minutes: 10081 }] }).ok, false);
});

test('Join to Create bitrate is validated in the stored unit (bps)', () => {
  const jtc = modules.getModule('jointocreate');
  assert.equal(validation.validateModuleChanges(jtc, { bitrate: 64000 }).ok, true);
  assert.equal(validation.validateModuleChanges(jtc, { bitrate: 500000 }).ok, false);
});

test('Dashboard API requests are signed over method, path, time, nonce, actor and body', () => {
  const body = JSON.stringify({ revision: 'r1', changes: { enabled: true } });
  const headers = botApi.signDashboardRequest({ method: 'patch', path: '/api/dashboard/v1/guilds/1/modules/welcome', body, actorId: '123456789012345678' }, SECRET, 1_700_000_000_000, 'fixed-nonce');
  const canonical = ['cloudy-dashboard-v1', 'PATCH', '/api/dashboard/v1/guilds/1/modules/welcome', '1700000000', 'fixed-nonce', '123456789012345678', createHash('sha256').update(body).digest('hex')].join('\n');
  assert.equal(headers['x-cloudy-dashboard-signature'], createHmac('sha256', SECRET).update(canonical).digest('base64url'));
  assert.equal(headers['x-cloudy-dashboard-timestamp'], '1700000000');
  const other = botApi.signDashboardRequest({ method: 'PATCH', path: '/api/dashboard/v1/guilds/2/modules/welcome', body, actorId: '123456789012345678' }, SECRET, 1_700_000_000_000, 'fixed-nonce');
  assert.notEqual(other['x-cloudy-dashboard-signature'], headers['x-cloudy-dashboard-signature'], 'another guild needs another signature');
});

test('the rate limiter blocks bursts and recovers after its window', () => {
  rateLimit.resetRateLimits();
  const limit = { limit: 3, windowMs: 1000 };
  assert.equal(rateLimit.takeToken('k', limit, 0).ok, true);
  assert.equal(rateLimit.takeToken('k', limit, 1).ok, true);
  assert.equal(rateLimit.takeToken('k', limit, 2).ok, true);
  const blocked = rateLimit.takeToken('k', limit, 3);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.retryAfter, 1);
  assert.equal(rateLimit.takeToken('other', limit, 3).ok, true, 'per key');
  assert.equal(rateLimit.takeToken('k', limit, 1000).ok, true);
});

test('the OAuth origin comes from configuration or Vercel, never from the request query', () => {
  const env = { VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'cloudy-store-git-preview-cloudystore.vercel.app' };
  const origin = loadTypeScript('lib/bot-dashboard/origin.ts', { globals: { process: { env } } });
  assert.equal(origin.dashboardOrigin('https://random-hash.vercel.app'), 'https://cloudy-store-git-preview-cloudystore.vercel.app');
  assert.equal(origin.botInviteUrl('123456789012345678'), null, 'no invite without a configured bot client id');
  env.CLOUDY_BOT_CLIENT_ID = '987654321098765432';
  const invite = new URL(origin.botInviteUrl('123456789012345678'));
  assert.equal(invite.hostname, 'discord.com');
  assert.equal(invite.searchParams.get('guild_id'), '123456789012345678');
  assert.equal(invite.searchParams.get('scope'), 'bot applications.commands');
  env.CLOUDY_BOT_DASHBOARD_ORIGIN = 'https://cloudy.example';
  assert.equal(origin.dashboardOrigin('https://other.example'), 'https://cloudy.example');
  env.CLOUDY_BOT_DASHBOARD_ORIGIN = 'http://insecure.example';
  assert.equal(origin.dashboardOrigin('https://request.example'), 'https://cloudy-store-git-preview-cloudystore.vercel.app');
});
