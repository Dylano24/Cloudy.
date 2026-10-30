import { NextRequest, NextResponse } from 'next/server';
import { BOT_STATE_COOKIE, createLoginState, safeReturnPath } from '@/lib/bot-dashboard/session';
import { DASHBOARD_SCOPES, discordCredentials } from '@/lib/bot-dashboard/discord';
import { dashboardOrigin, dashboardRedirectUri } from '@/lib/bot-dashboard/origin';
import { clientKey } from '@/lib/bot-dashboard/server';
import { LIMITS, takeToken } from '@/lib/bot-dashboard/rate-limit';

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get('next'));
  const origin = dashboardOrigin(request.nextUrl.origin);

  // Discord only accepts the registered callback, so start on that origin.
  if (origin !== request.nextUrl.origin) {
    const canonical = new URL('/api/bot/auth/login', origin);
    canonical.searchParams.set('next', returnTo);
    return noStore(NextResponse.redirect(canonical));
  }

  if (!takeToken(`auth:${clientKey(request)}`, LIMITS.auth).ok) {
    return noStore(NextResponse.redirect(new URL('/bot?login_error=busy', origin)));
  }

  const credentials = discordCredentials();
  if (!credentials) return noStore(NextResponse.redirect(new URL('/bot?login_error=unavailable', origin)));

  const state = createLoginState(returnTo);
  const authorize = new URL('https://discord.com/oauth2/authorize');
  const params = new URLSearchParams({
    client_id: credentials.clientId,
    response_type: 'code',
    scope: DASHBOARD_SCOPES,
    state,
    redirect_uri: dashboardRedirectUri(origin),
  });
  // Discord should show its normal sign-in/consent flow when needed.
  // Forcing prompt=none prevents first-time visitors from logging in.
  if (request.nextUrl.searchParams.get('consent') === '1') {
    params.set('prompt', 'consent');
  }
  authorize.search = params.toString();

  const response = NextResponse.redirect(authorize);
  response.cookies.set(BOT_STATE_COOKIE, state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/api/bot/auth',
    maxAge: 600,
  });
  return noStore(response);
}
