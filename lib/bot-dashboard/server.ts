import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { BOT_SESSION_COOKIE, openSession, verifyCsrfToken, type BotSession } from './session';
import { DiscordAuthError, getManageableGuilds } from './discord';
import { isSnowflake, type ManageableGuild } from './permissions';
import { takeToken, LIMITS } from './rate-limit';

export async function readDashboardSession() {
  const store = await cookies();
  return openSession(store.get(BOT_SESSION_COOKIE)?.value);
}

export function sessionFromRequest(request: NextRequest) {
  return openSession(request.cookies.get(BOT_SESSION_COOKIE)?.value);
}

/**
 * Server-side permission gate used by every page and API route: the guild must
 * be in the list Discord itself returns for this user with Owner,
 * Administrator or Manage Server. Client-supplied guild data is never trusted.
 */
export async function findManageableGuild(session: BotSession, guildId: string): Promise<ManageableGuild | null> {
  if (!isSnowflake(guildId)) return null;
  const { manageable } = await getManageableGuilds(session.at);
  return manageable.find(guild => guild.id === guildId) || null;
}

const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

export function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...SECURITY_HEADERS, ...extra } });
}

export function errorResponse(status: number, error: string, code: string, extra: Record<string, string> = {}) {
  return jsonResponse({ error, code }, status, extra);
}

export function clientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

/** Same-origin check for state-changing requests, on top of SameSite=Lax cookies and the CSRF token. */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') === 'same-origin';
  let host: string;
  try { host = new URL(origin).host.toLowerCase(); } catch { return false; }
  // The host the browser actually used (Vercel forwards it), not an internal name.
  const allowed = [request.headers.get('x-forwarded-host'), request.headers.get('host'), request.nextUrl.host]
    .flatMap(value => (value ? value.split(',').map(part => part.trim().toLowerCase()) : []));
  return allowed.includes(host);
}

type Guarded =
  | { ok: true; session: BotSession }
  | { ok: false; response: NextResponse };

/** Session, rate limit and (for writes) Origin + CSRF checks shared by the API routes. */
export function guardRequest(request: NextRequest, kind: 'read' | 'write'): Guarded {
  const session = sessionFromRequest(request);
  if (!session) return { ok: false, response: errorResponse(401, 'Please sign in with Discord again.', 'unauthenticated') };
  const limit = takeToken(`${kind}:${session.uid}`, LIMITS[kind]);
  if (!limit.ok) {
    return { ok: false, response: errorResponse(429, 'Too many requests. Please wait a moment.', 'rate_limited', { 'Retry-After': String(limit.retryAfter) }) };
  }
  if (kind === 'write') {
    if (!isSameOrigin(request) || !verifyCsrfToken(session, request.headers.get('x-cloudy-csrf'))) {
      return { ok: false, response: errorResponse(403, 'This request could not be verified. Reload the page and try again.', 'csrf') };
    }
  }
  return { ok: true, session };
}

export function discordErrorResponse(error: unknown) {
  if (error instanceof DiscordAuthError) {
    return errorResponse(error.status, error.message, error.status === 401 ? 'discord_session_expired' : 'discord_unavailable');
  }
  return errorResponse(502, 'Discord could not be reached. Please try again.', 'discord_unavailable');
}
