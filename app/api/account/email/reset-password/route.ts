import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret } from '@/lib/account-session';
import { resetEmailAccountPassword, validAccountPassword } from '@/lib/email-account';

const headers = { 'Cache-Control': 'private, no-store' };
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  if (!accountSigningSecret() || !process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Password reset is temporarily unavailable.' }, { status: 503, headers });
  if (Number(request.headers.get('content-length') || 0) > 2048) return NextResponse.json({ error: 'Invalid request.' }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const input = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  if (typeof input.token !== 'string' || !validAccountPassword(input.password) || input.password !== input.confirmPassword) return NextResponse.json({ error: 'Check your password and try again.' }, { status: 400, headers });
  try {
    if (!await resetEmailAccountPassword(input.token, input.password)) return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400, headers });
    return NextResponse.json({ message: 'Your password has been updated. You can sign in now.' }, { headers });
  } catch { return NextResponse.json({ error: 'Password reset is temporarily unavailable.' }, { status: 503, headers }); }
}
