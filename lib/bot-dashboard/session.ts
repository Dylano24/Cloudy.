import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { accountSigningSecret } from '@/lib/account-session';

// The Bot dashboard reuses the website's existing signing secret, but derives
// its own keys so a dashboard cookie can never be confused with an account
// session (or the other way around).
export const BOT_SESSION_COOKIE = 'cloudy-bot-session';
export const BOT_STATE_COOKIE = 'cloudy-bot-login-state';
export const BOT_SESSION_MAX_SECONDS = 7 * 86400;

const VERSION = 'v1';
const AAD = Buffer.from('cloudy-bot-dashboard-session-v1');

export type BotSession = {
  sid: string;        // random session id (CSRF tokens are bound to it)
  uid: string;        // Discord user id
  name: string;       // display name
  username: string;
  avatar: string | null;
  at: string;         // Discord OAuth access token (server-side only)
  exp: number;        // unix seconds
};

export function dashboardSecret() {
  return process.env.BOT_DASHBOARD_SESSION_SECRET || accountSigningSecret();
}

function deriveKey(secret: string, purpose: 'session' | 'csrf' | 'state') {
  if (!secret || secret.length < 16) throw new Error('Missing dashboard signing secret');
  return Buffer.from(hkdfSync('sha256', secret, 'cloudy-bot-dashboard', `cloudy-bot-${purpose}-v1`, 32));
}

const SNOWFLAKE = /^\d{17,20}$/;

function validSession(data: unknown, now: number): data is BotSession {
  if (!data || typeof data !== 'object') return false;
  const value = data as Record<string, unknown>;
  return typeof value.sid === 'string' && /^[A-Za-z0-9_-]{22}$/.test(value.sid)
    && typeof value.uid === 'string' && SNOWFLAKE.test(value.uid)
    && typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 100
    && typeof value.username === 'string' && value.username.length <= 64
    && (value.avatar === null || (typeof value.avatar === 'string' && /^(a_)?[a-f0-9]{32}$/.test(value.avatar)))
    && typeof value.at === 'string' && value.at.length >= 20 && value.at.length <= 200
    && typeof value.exp === 'number' && Number.isFinite(value.exp) && value.exp > now;
}

export function newSessionId() {
  return randomBytes(16).toString('base64url');
}

export function sealSession(session: BotSession, secret = dashboardSecret()) {
  const key = deriveKey(secret, 'session');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(AAD);
  const body = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return `${VERSION}.${iv.toString('base64url')}.${body.toString('base64url')}`;
}

export function openSession(token: string | undefined | null, secret = dashboardSecret(), now = Math.floor(Date.now() / 1000)): BotSession | null {
  if (!token || token.length > 3000 || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== VERSION) return null;
  const [, ivRaw, bodyRaw] = parts;
  if (!/^[A-Za-z0-9_-]{16}$/.test(ivRaw) || !/^[A-Za-z0-9_-]{40,2900}$/.test(bodyRaw)) return null;
  try {
    const key = deriveKey(secret, 'session');
    const body = Buffer.from(bodyRaw, 'base64url');
    if (body.length < 17) return null;
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivRaw, 'base64url'));
    decipher.setAAD(AAD);
    decipher.setAuthTag(body.subarray(body.length - 16));
    const plain = Buffer.concat([decipher.update(body.subarray(0, body.length - 16)), decipher.final()]).toString('utf8');
    const data = JSON.parse(plain);
    return validSession(data, now) ? data : null;
  } catch {
    return null;
  }
}

/** A CSRF token bound to one dashboard session. Rendered into the page, sent back as a header. */
export function csrfTokenFor(session: Pick<BotSession, 'sid'>, secret = dashboardSecret()) {
  return createHmac('sha256', deriveKey(secret, 'csrf')).update(`csrf:${session.sid}`).digest('base64url');
}

export function verifyCsrfToken(session: Pick<BotSession, 'sid'>, supplied: string | null | undefined, secret = dashboardSecret()) {
  if (!supplied || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) return false;
  const expected = csrfTokenFor(session, secret);
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

/** Signed OAuth state: binds the login to the browser (cookie) and to a safe return path. */
export function createLoginState(returnTo: string, secret = dashboardSecret(), now = Math.floor(Date.now() / 1000)) {
  const nonce = randomBytes(18).toString('base64url');
  const path = safeReturnPath(returnTo);
  const payload = `${now}.${nonce}.${Buffer.from(path).toString('base64url')}`;
  const signature = createHmac('sha256', deriveKey(secret, 'state')).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyLoginState(value: string | null | undefined, secret = dashboardSecret(), now = Math.floor(Date.now() / 1000)) {
  if (!value || value.length > 600) return null;
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const [issuedRaw, nonce, pathRaw, supplied] = parts;
  if (!/^\d{10}$/.test(issuedRaw) || !/^[A-Za-z0-9_-]{24}$/.test(nonce) || !/^[A-Za-z0-9_-]{1,400}$/.test(pathRaw) || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) return null;
  const issued = Number(issuedRaw);
  if (issued > now + 60 || now - issued > 600) return null;
  const expected = createHmac('sha256', deriveKey(secret, 'state')).update(`${issuedRaw}.${nonce}.${pathRaw}`).digest('base64url');
  if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  return { returnTo: safeReturnPath(Buffer.from(pathRaw, 'base64url').toString('utf8')) };
}

/** Only dashboard paths are allowed after login: never an external or protocol-relative URL. */
export function safeReturnPath(value: string | null | undefined) {
  const path = String(value || '');
  return /^\/bot(?:\/[A-Za-z0-9_-]{1,40}){0,2}$/.test(path) ? path : '/bot';
}

export function sessionCookieOptions(secure: boolean, maxAge: number) {
  return { httpOnly: true, secure, sameSite: 'lax' as const, path: '/', maxAge: Math.max(0, Math.floor(maxAge)) };
}
