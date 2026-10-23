import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';
import { readFavorites, writeFavorites, type Favorite } from '@/lib/account-favorites';

const headers = { 'Cache-Control': 'private, no-store' };
function identity(request: NextRequest) {
  return decodeSession(request.cookies.get(SESSION_COOKIE)?.value, accountSigningSecret());
}

export async function GET(request: NextRequest) {
  const user = identity(request);
  if (!user) return NextResponse.json({ error: 'Sign in to view favorites.' }, { status: 401, headers });
  try { return NextResponse.json({ favorites: await readFavorites(user) }, { headers }); }
  catch { return NextResponse.json({ error: 'Could not load favorites.' }, { status: 503, headers }); }
}

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  const user = identity(request);
  if (!user) return NextResponse.json({ error: 'Sign in to save favorites.' }, { status: 401, headers });
  if (Number(request.headers.get('content-length') || 0) > 1024) return NextResponse.json({ error: 'Invalid request.' }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const item = body && typeof body === 'object' ? body as Partial<Favorite> : {};
  if (!Number.isSafeInteger(item.id) || (item.id || 0) <= 0 || typeof item.slug !== 'string' || !/^[a-zA-Z0-9_-]{1,150}$/.test(item.slug) ||
      typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120) {
    return NextResponse.json({ error: 'Invalid product.' }, { status: 400, headers });
  }
  try {
    const favorites = await readFavorites(user);
    const updated = favorites.some(favorite => favorite.id === item.id)
      ? favorites.filter(favorite => favorite.id !== item.id)
      : [{ id: item.id as number, slug: item.slug, name: item.name.trim() }, ...favorites].slice(0, 100);
    await writeFavorites(user, updated);
    return NextResponse.json({ favorites: updated }, { headers });
  } catch { return NextResponse.json({ error: 'Could not save favorites.' }, { status: 503, headers }); }
}
