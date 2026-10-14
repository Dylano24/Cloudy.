import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAccount, validateDisplayName } from '../lib/account-registration.ts';

const identity = { id: '123456789012345678', provider: 'discord', name: 'Discord name' };
test('login rejects an unregistered provider without creating an account', async () => {
  const result = await resolveAccount(identity, 'login', async () => null);
  assert.deepEqual(result, { kind: 'missing' });
});
test('create asks a new user for a display name and does not sign them in', async () => {
  assert.deepEqual(await resolveAccount(identity, 'create', async () => null), { kind: 'register', identity });
});
test('existing account signs in with the saved Cloudy name for either entry point', async () => {
  const saved = { ...identity, name: 'Cloudy name' };
  for (const intent of ['login', 'create']) assert.deepEqual(await resolveAccount(identity, intent, async () => saved), { kind: 'signed-in', user: saved });
});
test('Google and Discord identities remain distinct', async () => {
  const google = { ...identity, provider: 'google' };
  let seen;
  await resolveAccount(google, 'login', async (user) => { seen = user; return null; });
  assert.equal(seen.provider, 'google');
});
test('display names trim spaces and reject empty, long and control characters', () => {
  assert.equal(validateDisplayName(' Cloudy player '), 'Cloudy player');
  for (const value of ['', ' ', 'a'.repeat(51), 'bad\nname', null, 42]) assert.equal(validateDisplayName(value), null);
});
