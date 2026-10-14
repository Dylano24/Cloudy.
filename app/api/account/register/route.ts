import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, encodeSession, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/account-session';
import { REGISTRATION_COOKIE, registrationSecret } from '@/lib/account-oauth-finish';
import { validateDisplayName } from '@/lib/account-registration';
import { createAccount } from '@/lib/account-store';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: NextRequest) {
  const identity = decodeSession(request.cookies.get(REGISTRATION_COOKIE)?.value, registrationSecret());
  return NextResponse.json({ identity }, { headers });
}

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403, headers });
  const identity = decodeSession(request.cookies.get(REGISTRATION_COOKIE)?.value, registrationSecret());
  if (!identity || !accountSigningSecret()) return NextResponse.json({ error: 'Please continue with Google or Discord again.' }, { status: 401, headers });
  let name;
  try { name = validateDisplayName((await request.json()).name); } catch { name = null; }
  if (!name) return NextResponse.json({ error: 'Enter a display name between 1 and 50 characters.' }, { status: 400, headers });
  try {
    const user = await createAccount(identity, name);
    const response = NextResponse.json({ user }, { headers });
    const options = { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax' as const, path: '/' };
    response.cookies.set(SESSION_COOKIE, encodeSession(user, accountSigningSecret()), { ...options, maxAge: SESSION_SECONDS });
    response.cookies.set(REGISTRATION_COOKIE, '', { ...options, maxAge: 0 });
    return response;
  } catch { return NextResponse.json({ error: 'We could not create your account. Please try again.' }, { status: 503, headers }); }
}
