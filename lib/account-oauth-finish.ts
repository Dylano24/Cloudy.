import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, encodeSession, SESSION_COOKIE, SESSION_SECONDS, type AccountUser } from '@/lib/account-session';
import { resolveAccount } from '@/lib/account-registration';
import { createAccount, findAccount } from '@/lib/account-store';

export async function finishAccountOAuth(request: NextRequest, identity: AccountUser) {
  const result = await resolveAccount(identity, findAccount, createAccount);
  const response = NextResponse.redirect(new URL('/account', request.nextUrl.origin));
  const options = { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax' as const, path: '/' };
  response.cookies.set(SESSION_COOKIE, encodeSession(result.user, accountSigningSecret()), { ...options, maxAge: SESSION_SECONDS });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
