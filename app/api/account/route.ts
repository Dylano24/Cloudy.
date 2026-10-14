import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';

import { REGISTRATION_COOKIE } from '@/lib/account-oauth-finish';
import { findAccount } from '@/lib/account-store';

export async function GET(request: NextRequest) {
  const identity = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, accountSigningSecret());
  let user = null;
  try { if (identity) user = await findAccount({ ...identity, provider: identity.provider || 'discord' }); } catch { return NextResponse.json({ error: 'Unable to load your account' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }); }
  return NextResponse.json({ user }, { headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const response = NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  response.cookies.set(REGISTRATION_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
