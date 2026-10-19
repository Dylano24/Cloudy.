import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, encodeSession, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/account-session';

import { findAccount, updateAccountName } from '@/lib/account-store';
import { findEmailAccount, updateEmailAccountName } from '@/lib/email-account';
import { validateDisplayName } from '@/lib/account-registration';

export async function GET(request: NextRequest) {
  const identity = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, accountSigningSecret());
  let user = null;
  try {
    if (identity?.provider === 'email' && identity.email) {
      const account = await findEmailAccount(identity.email);
      user = account?.id === identity.id ? account : null;
    } else if (identity) user = await findAccount({ ...identity, provider: identity.provider || 'discord' });
  } catch { return NextResponse.json({ error: 'Unable to load your account' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }); }
  return NextResponse.json({ user }, { headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const response = NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}

export async function PATCH(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  if (Number(request.headers.get('content-length') || 0) > 1024) return NextResponse.json({ error: 'Invalid request.' }, { status: 413, headers });
  const secret = accountSigningSecret();
  const identity = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, secret);
  if (!identity) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401, headers });
  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const name = validateDisplayName(body && typeof body === 'object' ? (body as Record<string, unknown>).name : null);
  if (!name) return NextResponse.json({ error: 'Enter a name with 1 to 50 characters.' }, { status: 400, headers });
  try {
    const user = identity.provider === 'email' && identity.email
      ? await updateEmailAccountName(identity.email, name)
      : await updateAccountName({ ...identity, provider: identity.provider || 'discord' }, name);
    if (!user || user.id !== identity.id) return NextResponse.json({ error: 'Account not found.' }, { status: 404, headers });
    const response = NextResponse.json({ user }, { headers });
    response.cookies.set(SESSION_COOKIE, encodeSession(user, secret), {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not save your name. Please try again.' }, { status: 503, headers });
  }
}
