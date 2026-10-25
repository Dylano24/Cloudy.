import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';
import { createPasswordResetToken, resetEmailAccountPassword, validAccountPassword, verifyEmailAccount } from '@/lib/email-account';

const headers = { 'Cache-Control': 'private, no-store' };
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  const secret = accountSigningSecret();
  if (!secret || !process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Password changes are temporarily unavailable.' }, { status: 503, headers });
  const user = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, secret);
  if (!user || user.provider !== 'email' || !user.email) return NextResponse.json({ error: 'Sign in with your Cloudy email account first.' }, { status: 401, headers });
  if (Number(request.headers.get('content-length') || 0) > 2048) return NextResponse.json({ error: 'Invalid request.' }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const input = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  if (!validAccountPassword(input.currentPassword) || !validAccountPassword(input.password) || input.password !== input.confirmPassword) return NextResponse.json({ error: 'Check your passwords. New passwords must match and contain at least 10 characters.' }, { status: 400, headers });
  try {
    const verified = await verifyEmailAccount(user.email, input.currentPassword);
    if (!verified || verified.id !== user.id) return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 400, headers });
    const token = await createPasswordResetToken(user.email);
    if (!token || !await resetEmailAccountPassword(token, input.password)) throw new Error('Password update failed');
    return NextResponse.json({ message: 'Your password has been updated.' }, { headers });
  } catch { return NextResponse.json({ error: 'Password changes are temporarily unavailable.' }, { status: 503, headers }); }
}
