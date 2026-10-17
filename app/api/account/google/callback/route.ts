import { NextRequest, NextResponse } from 'next/server';
import { finishAccountOAuth } from '@/lib/account-oauth-finish';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const [expected, verifier] = (request.cookies.get('cloudy-google-state')?.value || '').split('.');
  const state = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');
  function finish(error?: string) {
    const response = NextResponse.redirect(new URL(error ? `${expected.startsWith('create:') ? '/account/create' : '/account'}?login_error=${error}` : '/account', origin));
    response.cookies.set('cloudy-google-state', '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/account/google/callback', maxAge: 0 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  if (!state || !expected || state !== expected || !verifier || !code) return finish('failed');
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return finish('unavailable');
  try {
    const token = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: `${origin}/api/account/google/callback` }), cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!token.ok) return finish('failed');
    const tokenData = await token.json();
    if (typeof tokenData.access_token !== 'string') return finish('failed');
    const profile = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!profile.ok) return finish('failed');
    const user = await profile.json();
    if (typeof user.sub !== 'string' || !/^[A-Za-z0-9_-]{1,255}$/.test(user.sub) || typeof user.name !== 'string') return finish('failed');
    const response = await finishAccountOAuth(request, { id: user.sub, name: user.name.slice(0, 100), provider: 'google' });
    response.cookies.set('cloudy-google-state', '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/account/google/callback', maxAge: 0 });
    return response;
  } catch { return finish('failed'); }
}
