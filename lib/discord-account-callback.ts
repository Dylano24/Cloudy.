import { NextRequest, NextResponse } from 'next/server';
import { STATE_COOKIE } from '@/lib/account-session';

import { finishAccountOAuth } from '@/lib/account-oauth-finish';

export async function completeAccountLogin(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const state = request.nextUrl.searchParams.get('state');
  const expected = request.cookies.get(STATE_COOKIE)?.value;
  const code = request.nextUrl.searchParams.get('code');
  const finish = (error?: string) => {
    const response = NextResponse.redirect(new URL(error ? `/account?login_error=${error}` : '/account', origin));
    response.cookies.set(STATE_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/oauth/discord/callback', maxAge: 0 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  };
  if (!state || !expected || state !== expected || !code) return finish('failed');
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) return finish('unavailable');
  try {
    const token = await fetch('https://discord.com/api/v10/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri: `${origin}/api/oauth/discord/callback` }), cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!token.ok) return finish('failed');
    const tokenData = await token.json();
    const profile = await fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${tokenData.access_token}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!profile.ok) return finish('failed');
    const user = await profile.json();
    if (typeof user.id !== 'string' || !/^\d{17,20}$/.test(user.id) || typeof user.username !== 'string') return finish('failed');
    const response = await finishAccountOAuth(request, { id: user.id, name: (user.global_name || user.username).slice(0, 100), provider: 'discord' }, expected.startsWith('cloudy-login:create:') ? 'create' : 'login');
    response.cookies.set(STATE_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/oauth/discord/callback', maxAge: 0 });
    return response;
  } catch { return finish('failed'); }
}
