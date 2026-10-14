import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { accountSigningSecret } from '@/lib/account-session';

export type DiscordOAuthIntent = 'create' | 'login';

const PREFIX = 'cloudy-login-v2';
const MAX_AGE_SECONDS = 600;

function sign(payload: string) {
  const secret = accountSigningSecret();
  if (!secret) throw new Error('Missing account signing key');
  return createHmac('sha256', secret)
    .update(`cloudy-discord-oauth-v1:${payload}`)
    .digest('base64url');
}

export function createDiscordOAuthState(intent: DiscordOAuthIntent, now = Math.floor(Date.now() / 1000)) {
  const payload = `${intent}.${now}.${randomBytes(18).toString('base64url')}`;
  return `${PREFIX}.${payload}.${sign(payload)}`;
}

export function verifyDiscordOAuthState(value: string | null | undefined, now = Math.floor(Date.now() / 1000)): DiscordOAuthIntent | null {
  if (!value || value.length > 512) return null;
  const parts = value.split('.');
  if (parts.length !== 5 || parts[0] !== PREFIX) return null;
  const [, intent, issuedRaw, nonce, supplied] = parts;
  if (intent !== 'create' && intent !== 'login') return null;
  if (!/^\d{10}$/.test(issuedRaw) || !/^[A-Za-z0-9_-]{20,40}$/.test(nonce) || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) return null;
  const issued = Number(issuedRaw);
  if (!Number.isFinite(issued) || issued > now + 60 || now - issued > MAX_AGE_SECONDS) return null;
  const payload = `${intent}.${issuedRaw}.${nonce}`;
  const expected = sign(payload);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  return intent;
}
