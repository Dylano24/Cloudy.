import test from 'node:test';
import assert from 'node:assert/strict';
import { emailAccountPath, normalizeAccountEmail, validAccountPassword } from '../lib/email-account.ts';

test('preview accounts use a separate storage path from live accounts', () => {
  assert.match(emailAccountPath('player@example.com', 'preview'), /^accounts\/preview-v1\/[a-f0-9]{64}\.json$/);
  assert.match(emailAccountPath('player@example.com', 'production'), /^accounts\/v1\/[a-f0-9]{64}\.json$/);
});

test('Cloudy email accounts normalize case and surrounding whitespace', () => {
  assert.equal(normalizeAccountEmail('  Player@Example.COM '), 'player@example.com');
  for (const value of ['', 'player', 'player@', 'player@example', 'player example@test.com', null]) {
    assert.equal(normalizeAccountEmail(value), null);
  }
});

test('Cloudy passwords require at least ten characters and a bounded byte length', () => {
  assert.equal(validAccountPassword('ninechars'), false);
  assert.equal(validAccountPassword('tenletters'), true);
  assert.equal(validAccountPassword('é'.repeat(129)), false);
  assert.equal(validAccountPassword(null), false);
});
