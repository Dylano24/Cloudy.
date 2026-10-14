import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { STATE_COOKIE } from '@/lib/account-session';

export async function GET(request: NextRequest) {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) return NextResponse.redirect(new URL('/account?login_error=unavailable', request.nextUrl.origin));
  const intent = request.nextUrl.searchParams.get('intent') === 'create' ? 'create' : 'login';
  const state = `cloudy-login:${intent}:${randomBytes(32).toString('hex')}`;
  const authorize = new URL('https://discord.com/oauth2/authorize');
  authorize.search = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, response_type: 'code', scope: 'identify', state, redirect_uri: `${request.nextUrl.origin}/api/oauth/discord/callback` }).toString();
  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/oauth/discord/callback', maxAge: 600 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
