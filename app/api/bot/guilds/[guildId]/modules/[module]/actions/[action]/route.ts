import { NextRequest } from 'next/server';
import { getModule } from '@/lib/bot-dashboard/modules';
import { botApi, BotApiError } from '@/lib/bot-dashboard/bot-api';
import { discordErrorResponse, errorResponse, findManageableGuild, guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';
import { auditDashboard } from '@/lib/bot-dashboard/audit';

type Context = { params: Promise<{ guildId: string; module: string; action: string }> };

// Explicit, one-off bot actions (for example "Update panel in Discord").
// Saving settings never posts or edits Discord messages by itself.
export async function POST(request: NextRequest, context: Context) {
  const guard = guardRequest(request, 'write');
  if (!guard.ok) return guard.response;
  const { guildId, module: moduleId, action: actionId } = await context.params;
  const mod = getModule(moduleId);
  const action = mod?.actions?.find(entry => entry.id === actionId);
  if (!mod || !action) return errorResponse(404, 'Unknown action.', 'unknown_action');

  try {
    const guild = await findManageableGuild(guard.session, guildId);
    if (!guild) return errorResponse(403, 'You need Manage Server in this server.', 'forbidden');
    try {
      const result = await botApi.action(guard.session.uid, guild.id, mod.id, action.id);
      auditDashboard({ actor: guard.session.uid, guild: guild.id, module: mod.id, action: 'action', keys: [action.id], outcome: 'ok' });
      return jsonResponse(result);
    } catch (error) {
      auditDashboard({ actor: guard.session.uid, guild: guild.id, module: mod.id, action: 'action', keys: [action.id], outcome: 'failed' });
      if (error instanceof BotApiError) return errorResponse(error.status === 503 ? 503 : 502, error.message, error.code);
      return errorResponse(502, 'Cloudy could not complete this action.', 'bot_error');
    }
  } catch (error) {
    return discordErrorResponse(error);
  }
}
