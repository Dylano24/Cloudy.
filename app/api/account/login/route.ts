import { NextRequest, NextResponse } from 'next/server';
import { STATE_COOKIE } from '@/lib/account-session';
import { createDiscordOAuthState } from '@/lib/discord-oauth-state';

const CLOUDY_PRODUCTION_ORIGIN = 'https://cloudy-store-vert.vercel.app';

function configuredDiscordRedirect() {
  const configured = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null;
    return url;
  } catch {
    return null;
  }
}

function discordLoginOrigin(request: NextRequest) {
  const configured = configuredDiscordRedirect();
  if (configured) return configured.origin;
  const host = request.nextUrl.hostname.toLowerCase();
  if (host.endsWith('.vercel.app') && host !== 'cloudy-store-vert.vercel.app') return CLOUDY_PRODUCTION_ORIGIN;
  return request.nextUrl.origin;
}

function isIOS(request: NextRequest) {
  return /iPhone|iPad|iPod/i.test(request.headers.get('user-agent') || '');
}

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get('intent') === 'create' ? 'create' : 'login';
  const origin = discordLoginOrigin(request);

  if (origin !== request.nextUrl.origin) {
    const canonicalLogin = new URL('/api/account/login', origin);
    if (intent === 'create') canonicalLogin.searchParams.set('intent', 'create');
    const response = NextResponse.redirect(canonicalLogin);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/account?login_error=unavailable', origin));
  }

  const state = createDiscordOAuthState(intent);
  const configured = configuredDiscordRedirect();
  const redirectUri = configured?.toString() || `${origin}/api/oauth/discord/callback`;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    scope: 'identify',
    state,
    redirect_uri: redirectUri,
  });
  const authorize = `https://discord.com/oauth2/authorize?${params.toString()}`;

  if (isIOS(request)) {
    const appAuthorize = `discord://-/oauth2/authorize?${params.toString()}`;
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Opening Discord…</title>
<style>
html,body{margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{min-height:100vh;display:grid;place-items:center;padding:24px;text-align:center}
a{color:#fff}
</style>
</head>
<body>
<main><div><p>Opening Discord…</p><p><a id="fallback" href=${JSON.stringify(authorize)}>Continue in browser</a></p></div></main>
<script>
(() => {
  const appUrl = ${JSON.stringify(appAuthorize)};
  const webUrl = ${JSON.stringify(authorize)};
  let switchedAway = false;
  const stopFallback = () => { if (document.hidden) switchedAway = true; };
  document.addEventListener('visibilitychange', stopFallback, { passive: true });
  window.addEventListener('pagehide', () => { switchedAway = true; }, { passive: true });
  try { window.location.href = appUrl; } catch {}
  window.setTimeout(() => {
    if (!switchedAway && document.visibilityState === 'visible') window.location.replace(webUrl);
  }, 1100);
})();
</script>
</body>
</html>`;
    const response = new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/api/oauth/discord/callback',
      maxAge: 600,
    });
    return response;
  }

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/api/oauth/discord/callback',
    maxAge: 600,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
