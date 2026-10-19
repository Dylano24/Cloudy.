import { NextRequest, NextResponse } from 'next/server';
import { STATE_COOKIE } from '@/lib/account-session';
import { createDiscordOAuthState } from '@/lib/discord-oauth-state';

const CLOUDY_PRODUCTION_ORIGIN = 'https://cloudy-store-vert.vercel.app';

function configuredDiscordRedirect() {
  const configured = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null;
    return url;
  } catch {
    return null;
  }
}

function discordLoginOrigin(request: NextRequest) {
  const configured = configuredDiscordRedirect();
  if (configured) return configured.origin;
  const host = request.nextUrl.hostname.toLowerCase();
  if (host.endsWith('.vercel.app') && host !== 'cloudy-store-vert.vercel.app') return CLOUDY_PRODUCTION_ORIGIN;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get('intent') === 'create' ? 'create' : 'login';
  const origin = discordLoginOrigin(request);

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

  const state = createDiscordOAuthState(intent);
  const configured = configuredDiscordRedirect();
  const redirectUri = configured?.toString() || `${origin}/api/oauth/discord/callback`;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    scope: 'identify',
    state,
    redirect_uri: redirectUri,
  });
  const authorize = `https://discord.com/oauth2/authorize?${params.toString()}`;

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/api/oauth/discord/callback',
    maxAge: 600,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
