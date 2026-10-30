import { NextRequest } from 'next/server';
import { BOT_SESSION_COOKIE } from '@/lib/bot-dashboard/session';
import { forgetGuildCache, revokeToken } from '@/lib/bot-dashboard/discord';
import { guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';
import { auditDashboard } from '@/lib/bot-dashboard/audit';

export async function POST(request: NextRequest) {
  const guard = guardRequest(request, 'write');
  if (!guard.ok) return guard.response;
  forgetGuildCache(guard.session.at);
  await revokeToken(guard.session.at);
  auditDashboard({ actor: guard.session.uid, guild: '-', module: '-', action: 'logout', outcome: 'ok' });
  const response = jsonResponse({ ok: true });
  response.cookies.set(BOT_SESSION_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
