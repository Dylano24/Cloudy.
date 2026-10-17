import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAccountEmail, validAccountPassword } from '../lib/email-account.ts';

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
