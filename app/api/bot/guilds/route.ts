import { NextRequest } from 'next/server';
import { getManageableGuilds } from '@/lib/bot-dashboard/discord';
import { discordErrorResponse, guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';
import { loadServerList } from '@/lib/bot-dashboard/server-list';

export async function GET(request: NextRequest) {
  const guard = guardRequest(request, 'read');
  if (!guard.ok) return guard.response;
  try {
    const fresh = request.nextUrl.searchParams.get('fresh') === '1';
    if (fresh) await getManageableGuilds(guard.session.at, { fresh: true });
    return jsonResponse(await loadServerList(guard.session));
  } catch (error) {
    return discordErrorResponse(error);
  }
}
