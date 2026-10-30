import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  BOT_SESSION_COOKIE, BOT_SESSION_MAX_SECONDS, BOT_STATE_COOKIE,
  newSessionId, sealSession, sessionCookieOptions, verifyLoginState,
} from '@/lib/bot-dashboard/session';
import { exchangeCode, fetchDiscordUser } from '@/lib/bot-dashboard/discord';
import { dashboardRedirectUri } from '@/lib/bot-dashboard/origin';
import { auditDashboard } from '@/lib/bot-dashboard/audit';

function sameValue(a: string, b: string) {
  return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const secure = request.nextUrl.protocol === 'https:';
  const params = request.nextUrl.searchParams;
  const state = params.get('state') || '';
  const expected = request.cookies.get(BOT_STATE_COOKIE)?.value || '';

  const finish = (target: string, session?: string, maxAge = 0) => {
    const response = NextResponse.redirect(new URL(target, origin));
    response.cookies.set(BOT_STATE_COOKIE, '', { httpOnly: true, secure, sameSite: 'lax', path: '/api/bot/auth', maxAge: 0 });
    if (session) response.cookies.set(BOT_SESSION_COOKIE, session, sessionCookieOptions(secure, maxAge));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  };

  // The state must be signed by us and match this browser's cookie.
  const verified = verifyLoginState(state);
  if (!verified || !expected || !sameValue(state, expected)) return finish('/bot?login_error=expired');

  const discordError = params.get('error');
  if (discordError) {
    // prompt=none fails when the user has not approved the guilds scope yet: ask once.
    if (discordError === 'consent_required' || discordError === 'interaction_required' || discordError === 'login_required') {
      return finish(`/bot?login_error=consent&next=${encodeURIComponent(verified.returnTo)}`);
    }
    return finish('/bot?login_error=denied');
  }

  const code = params.get('code');
  if (!code || code.length > 200) return finish('/bot?login_error=failed');

  try {
    const token = await exchangeCode(code, dashboardRedirectUri(origin));
    const user = await fetchDiscordUser(token.accessToken);
    const now = Math.floor(Date.now() / 1000);
    const lifetime = Math.min(BOT_SESSION_MAX_SECONDS, Math.max(300, token.expiresIn - 60));
    const session = sealSession({
      sid: newSessionId(),
      uid: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      at: token.accessToken,
      exp: now + lifetime,
    });
    auditDashboard({ actor: user.id, guild: '-', module: '-', action: 'login', outcome: 'ok' });
    return finish(verified.returnTo, session, lifetime);
  } catch {
    return finish('/bot?login_error=failed');
  }
}
