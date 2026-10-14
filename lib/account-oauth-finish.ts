import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, encodeSession, SESSION_COOKIE, SESSION_SECONDS, type AccountUser } from '@/lib/account-session';
import { resolveAccount } from '@/lib/account-registration';
import { findAccount } from '@/lib/account-store';

export const REGISTRATION_COOKIE = 'cloudy-registration';
export function registrationSecret() { const secret = accountSigningSecret(); return secret ? `${secret}:registration` : ''; }
export async function finishAccountOAuth(request: NextRequest, identity: AccountUser, intent: 'create' | 'login') {
  const result = await resolveAccount(identity, intent, findAccount);
  const target = result.kind === 'missing' ? '/account?login_error=not_registered' : result.kind === 'register' ? '/account/create?step=profile' : '/account';
  const response = NextResponse.redirect(new URL(target, request.nextUrl.origin));
  const options = { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax' as const, path: '/' };
  response.cookies.set(REGISTRATION_COOKIE, '', { ...options, maxAge: 0 });
  response.cookies.set(SESSION_COOKIE, '', { ...options, maxAge: 0 });
  if (result.kind === 'signed-in') response.cookies.set(SESSION_COOKIE, encodeSession(result.user, accountSigningSecret()), { ...options, maxAge: SESSION_SECONDS });
  if (result.kind === 'register') response.cookies.set(REGISTRATION_COOKIE, encodeSession(identity, registrationSecret(), Math.floor(Date.now() / 1000), 600), { ...options, maxAge: 600 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
