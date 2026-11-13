import { NextRequest } from 'next/server';
import { botApi, BotApiError } from '@/lib/bot-dashboard/bot-api';
import { discordErrorResponse, errorResponse, findManageableGuild, guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';

type Context = { params: Promise<{ guildId: string }> };

// Whether Cloudy is in one of the signed-in member's servers (used after "Invite Cloudy").
export async function GET(request: NextRequest, context: Context) {
  const guard = guardRequest(request, 'read');
  if (!guard.ok) return guard.response;
  const { guildId } = await context.params;
  if (!/^\d{17,20}$/.test(guildId)) return errorResponse(404, 'Unknown server.', 'not_found');
  try {
    const guild = await findManageableGuild(guard.session, guildId);
    if (!guild) return errorResponse(403, 'You need Manage Server in this server.', 'forbidden');
    const { present } = await botApi.presence(guard.session, [guild.id]);
    return jsonResponse({ installed: present.includes(guild.id) });
  } catch (error) {
    if (error instanceof BotApiError) return errorResponse([429, 503, 504].includes(error.status) ? error.status : 502, error.message, error.code);
    return discordErrorResponse(error);
  }
}
