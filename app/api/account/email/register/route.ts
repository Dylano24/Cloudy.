import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, encodeSession, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/account-session';
import { createEmailAccount, normalizeAccountEmail, validAccountPassword } from '@/lib/email-account';

const headers = { 'Cache-Control': 'private, no-store' };
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  if (!accountSigningSecret() || !process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Account creation is unavailable.' }, { status: 503, headers });
  if (Number(request.headers.get('content-length') || 0) > 1024) return NextResponse.json({ error: 'Invalid request.' }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const input = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const email = normalizeAccountEmail(input.email);
  if (!email || !validAccountPassword(input.password)) return NextResponse.json({ error: 'Enter a valid email and a password of at least 10 characters.' }, { status: 400, headers });
  try {
    const user = await createEmailAccount(email, input.password);
    const response = NextResponse.json({ user }, { headers });
    response.cookies.set(SESSION_COOKIE, encodeSession(user, accountSigningSecret()), {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'An account with this email already exists.') return NextResponse.json({ error: error.message }, { status: 409, headers });
    return NextResponse.json({ error: 'Account creation is temporarily unavailable.' }, { status: 503, headers });
  }
}
