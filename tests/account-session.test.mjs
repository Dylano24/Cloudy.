import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeSession, decodeSession } from '../lib/account-session.ts';

const user = { id: '123456789012345678', name: 'Cloudy member' };
test('a valid Discord session is verified with its signing key', () => {
  const token = encodeSession(user, 'test-secret', 1000);
  assert.deepEqual(decodeSession(token, 'test-secret', 1001), user);
});
test('altered, expired, unsigned and wrong-key sessions cannot log in', () => {
  const token = encodeSession(user, 'test-secret', 1000);
  assert.equal(decodeSession(token + 'x', 'test-secret', 1001), null);
  assert.equal(decodeSession(token, 'wrong-secret', 1001), null);
  assert.equal(decodeSession(token, 'test-secret', 1000 + 86400 * 7), null);
  assert.equal(decodeSession('arbitrary-user-id', 'test-secret', 1001), null);
  assert.equal(decodeSession(token, '', 1001), null);
  assert.equal(decodeSession(token.split('.')[0] + '.' + 'é'.repeat(43), 'test-secret', 1001), null);
});
