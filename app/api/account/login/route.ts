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
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:#050505;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
body{min-height:100vh;overflow:hidden}
body:before{content:"";position:fixed;inset:-30%;background:radial-gradient(circle at 50% 35%,rgba(229,27,46,.14),transparent 32%);pointer-events:none}
main{min-height:100vh;display:grid;place-items:center;padding:28px 22px;text-align:center;position:relative}
.card{width:min(100%,430px);padding:38px 28px 34px;border:1px solid rgba(229,27,46,.42);border-radius:28px;background:rgba(10,10,10,.94);box-shadow:0 0 0 1px rgba(255,255,255,.025),0 24px 80px rgba(0,0,0,.55),0 0 42px rgba(229,27,46,.08)}
.logoWrap{width:88px;height:88px;margin:0 auto 22px;display:grid;place-items:center;border-radius:50%;background:#090909;border:1px solid rgba(255,255,255,.07);box-shadow:0 0 30px rgba(229,27,46,.12)}
.logo{width:72px;height:72px;object-fit:contain;border-radius:50%}
h1{margin:0;font-size:30px;line-height:1.12;letter-spacing:-.02em}
p{margin:12px auto 0;max-width:310px;color:#9b9b9f;font-size:15px;line-height:1.55}
.status{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:26px;color:#f5f5f5;font-size:15px;font-weight:650}
.spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.22);border-top-color:#e51b2e;border-radius:50%;animation:spin .8s linear infinite}
.retry{display:inline-flex;align-items:center;justify-content:center;min-height:48px;margin-top:24px;padding:0 22px;border:1px solid #e51b2e;border-radius:999px;color:#fff;text-decoration:none;font-weight:700;font-size:14px;background:rgba(229,27,46,.04);-webkit-tap-highlight-color:transparent}
.retry:active{transform:scale(.985)}
.note{margin-top:18px;font-size:12px;color:#68686d}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<main>
  <section class="card" aria-live="polite">
    <div class="logoWrap"><img class="logo" src="https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif" alt="Cloudy"></div>
    <h1>Opening Discord</h1>
    <p>Cloudy is securely handing you over to Discord to continue.</p>
    <div class="status"><span class="spinner" aria-hidden="true"></span><span>Connecting to Discord…</span></div>
    <a class="retry" href=${JSON.stringify(appAuthorize)}>Open Discord again</a>
    <p class="note">You can return to Cloudy after authorization.</p>
  </section>
</main>
<script>
(() => {
  const appUrl = ${JSON.stringify(appAuthorize)};
  try { window.location.replace(appUrl); } catch {}
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
