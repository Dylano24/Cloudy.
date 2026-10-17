import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAccount, validateDisplayName } from '../lib/account-registration.ts';

const identity = { id: '123456789012345678', provider: 'discord', name: 'Discord name' };
test('first provider sign-in creates an account using the provider name', async () => {
  let created;
  const result = await resolveAccount(identity, async () => null, async (user, name) => {
    created = { user, name };
    return user;
  });
  assert.deepEqual(created, { user: identity, name: identity.name });
  assert.deepEqual(result, { kind: 'signed-in', user: identity });
});
test('existing account signs in with the saved Cloudy name', async () => {
  const saved = { ...identity, name: 'Cloudy name' };
  assert.deepEqual(await resolveAccount(identity, async () => saved, async () => { throw new Error('must not create'); }), { kind: 'signed-in', user: saved });
});
test('Google and Discord identities remain distinct', async () => {
  const google = { ...identity, provider: 'google' };
  let seen;
  await resolveAccount(google, async (user) => { seen = user; return google; }, async () => { throw new Error('must not create'); });
  assert.equal(seen.provider, 'google');
});
test('display names trim spaces and reject empty, long and control characters', () => {
  assert.equal(validateDisplayName(' Cloudy player '), 'Cloudy player');
  for (const value of ['', ' ', 'a'.repeat(51), 'bad\nname', null, 42]) assert.equal(validateDisplayName(value), null);
});
