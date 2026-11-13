import { NextRequest } from 'next/server';
import { botApi, BotApiError } from '@/lib/bot-dashboard/bot-api';
import { discordErrorResponse, errorResponse, findManageableGuild, guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';

type Context = { params: Promise<{ guildId: string }> };

// The server's current plan, read from Cloudy. Used after a purchase to show
// Premium as soon as Cloudy has applied the payment.
export async function GET(request: NextRequest, context: Context) {
  const guard = guardRequest(request, 'read');
  if (!guard.ok) return guard.response;
  const { guildId } = await context.params;
  if (!/^\d{17,20}$/.test(guildId)) return errorResponse(404, 'Unknown server.', 'not_found');
  try {
    const guild = await findManageableGuild(guard.session, guildId);
    if (!guild) return errorResponse(403, 'You need Manage Server in this server.', 'forbidden');
    const overview = await botApi.overview(guard.session, guild.id);
    return jsonResponse({ plan: overview.plan ?? null });
  } catch (error) {
    if (error instanceof BotApiError) return errorResponse([403, 404, 429, 503, 504].includes(error.status) ? error.status : 502, error.message, error.code);
    return discordErrorResponse(error);
  }
}
