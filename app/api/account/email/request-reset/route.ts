import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { accountSigningSecret } from '@/lib/account-session';
import { createPasswordResetToken, normalizeAccountEmail } from '@/lib/email-account';
import { createHash } from 'node:crypto';

const headers = { 'Cache-Control': 'private, no-store' };
const message = 'If an email account exists, a password reset link will be sent.';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  if (Number(request.headers.get('content-length') || 0) > 1024) return NextResponse.json({ error: 'Invalid request.' }, { status: 413, headers });
  if (!accountSigningSecret() || !process.env.BLOB_READ_WRITE_TOKEN || !process.env.RESEND_API_KEY || !process.env.PASSWORD_RESET_FROM_EMAIL) return NextResponse.json({ error: 'Password reset is temporarily unavailable.' }, { status: 503, headers });
  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const email = normalizeAccountEmail(body && typeof body === 'object' ? (body as Record<string, unknown>).email : null);
  if (!email) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400, headers });
  try {
    const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
    const digest = createHash('sha256').update(email).digest('hex');
    await put(`password-reset/${process.env.VERCEL_ENV === 'preview' ? 'preview' : 'production'}/${digest}/${bucket}`, '', { access: 'private', addRandomSuffix: false, allowOverwrite: false });
  } catch { return NextResponse.json({ message }, { headers }); }
  try {
    const token = await createPasswordResetToken(email);
    if (token) {
      const base = process.env.PASSWORD_RESET_BASE_URL || (process.env.VERCEL_ENV === 'production' ? 'https://cloudy-store-vert.vercel.app' : `https://${process.env.VERCEL_URL}`);
      const url = new URL('/account/reset-password', base);
      url.searchParams.set('token', token);
      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.PASSWORD_RESET_FROM_EMAIL, to: [email], subject: 'Reset your Cloudy password', text: `Use this link to reset your Cloudy password. It expires in 30 minutes.\n\n${url.toString()}\n\nIf you did not request this, you can ignore this email.` }),
        cache: 'no-store',
      });
      if (!sent.ok) throw new Error('Mail delivery failed');
    }
    return NextResponse.json({ message }, { headers });
  } catch { return NextResponse.json({ error: 'Password reset is temporarily unavailable.' }, { status: 503, headers }); }
}
