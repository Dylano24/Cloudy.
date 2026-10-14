import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';

export async function GET(request: NextRequest) {
  const user = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, accountSigningSecret());
  return NextResponse.json({ user }, { headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const response = NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
