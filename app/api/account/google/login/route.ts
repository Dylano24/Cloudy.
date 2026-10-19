import { createHash, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return NextResponse.redirect(new URL('/account?login_error=unavailable', request.nextUrl.origin));
  const intent = request.nextUrl.searchParams.get('intent') === 'create' ? 'create' : 'login';
  const state = `${intent}:${randomBytes(32).toString('hex')}`;
  const verifier = randomBytes(32).toString('base64url');
  const authorize = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorize.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, response_type: 'code', scope: 'openid profile', state, redirect_uri: `${request.nextUrl.origin}/api/account/google/callback`, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256', prompt: 'select_account' }).toString();
  const response = NextResponse.redirect(authorize);
  response.cookies.set('cloudy-google-state', `${state}.${verifier}`, { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/api/account/google/callback', maxAge: 600 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
