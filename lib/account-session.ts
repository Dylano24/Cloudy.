import { createHmac, timingSafeEqual } from 'node:crypto';

export type AccountUser = { id: string; name: string; provider?: 'discord' | 'google' };
export function accountSigningSecret() { return process.env.ACCOUNT_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || ''; }
export const SESSION_COOKIE = 'cloudy-session';
export const STATE_COOKIE = 'cloudy-login-state';
export const SESSION_SECONDS = 7 * 86400;

function signature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(`cloudy-account-v1:${payload}`).digest('base64url');
}
export function encodeSession(user: AccountUser, secret: string, now = Math.floor(Date.now() / 1000), duration = SESSION_SECONDS) {
  if (!secret) throw new Error('Missing session signing key');
  const payload = Buffer.from(JSON.stringify({ ...user, exp: now + duration })).toString('base64url');
  return `${payload}.${signature(payload, secret)}`;
}
export function decodeSession(token: string | undefined, secret: string, now = Math.floor(Date.now() / 1000)): AccountUser | null {
  if (!token || !secret || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, supplied] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) return null;
  const expected = signature(payload, secret);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const validId = typeof data.id === 'string' && (data.provider === 'google' ? /^[A-Za-z0-9_-]{1,255}$/.test(data.id) : /^\d{17,20}$/.test(data.id));
    if (!Number.isFinite(data.exp) || data.exp <= now || !validId || typeof data.name !== 'string' || data.name.length > 100 || (data.provider !== undefined && !['discord', 'google'].includes(data.provider))) return null;
    return { id: data.id, name: data.name, ...(data.provider ? { provider: data.provider } : {}) };
  } catch { return null; }
}
