import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { STATE_COOKIE } from '@/lib/account-session';

const CLOUDY_PRODUCTION_ORIGIN = 'https://cloudy-store-vert.vercel.app';

function discordLoginOrigin(request: NextRequest) {
  const host = request.nextUrl.hostname.toLowerCase();
  if (host.endsWith('.vercel.app') && host !== 'cloudy-store-vert.vercel.app') return CLOUDY_PRODUCTION_ORIGIN;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get('intent') === 'create' ? 'create' : 'login';
  const origin = discordLoginOrigin(request);

  // Vercel preview URLs are immutable and are not registered Discord OAuth redirect URIs.
  // Move the complete login flow to Cloudy's stable production host before setting state,
  // which is especially important on mobile/in-app browsers where the cookie must survive
  // the round trip through Discord.
  if (origin !== request.nextUrl.origin) {
    const canonicalLogin = new URL('/api/account/login', origin);
    if (intent === 'create') canonicalLogin.searchParams.set('intent', 'create');
    const response = NextResponse.redirect(canonicalLogin);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/account?login_error=unavailable', origin));
  }

  const state = `cloudy-login:${intent}:${randomBytes(32).toString('hex')}`;
  const redirectUri = `${origin}/api/oauth/discord/callback`;
  const authorize = new URL('https://discord.com/oauth2/authorize');
  authorize.search = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    scope: 'identify',
    state,
    redirect_uri: redirectUri,
  }).toString();

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/oauth/discord/callback',
    maxAge: 600,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
