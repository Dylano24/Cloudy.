import { NextRequest } from 'next/server';
import { getModule } from '@/lib/bot-dashboard/modules';
import { validateModuleChanges } from '@/lib/bot-dashboard/validation';
import { botApi, BotApiError } from '@/lib/bot-dashboard/bot-api';
import { discordErrorResponse, errorResponse, findManageableGuild, guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';
import { auditDashboard } from '@/lib/bot-dashboard/audit';

type Context = { params: Promise<{ guildId: string; module: string }> };

function botErrorResponse(error: unknown) {
  if (error instanceof BotApiError) {
    const status = [400, 403, 404, 409, 422, 429, 503, 504].includes(error.status) ? error.status : 502;
    return errorResponse(status, error.message, error.code);
  }
  return errorResponse(502, 'Cloudy could not complete this request.', 'bot_error');
}

async function authorize(request: NextRequest, context: Context, kind: 'read' | 'write') {
  const guard = guardRequest(request, kind);
  if (!guard.ok) return { response: guard.response } as const;
  const { guildId, module: moduleId } = await context.params;
  const mod = getModule(moduleId);
  if (!mod || mod.sections.length === 0) return { response: errorResponse(404, 'Unknown module.', 'unknown_module') } as const;
  try {
    const guild = await findManageableGuild(guard.session, guildId);
    if (!guild) return { response: errorResponse(403, 'You need Manage Server in this server.', 'forbidden') } as const;
    return { session: guard.session, guild, mod } as const;
  } catch (error) {
    return { response: discordErrorResponse(error) } as const;
  }
}

export async function GET(request: NextRequest, context: Context) {
  const auth = await authorize(request, context, 'read');
  if ('response' in auth) return auth.response;
  try {
    return jsonResponse(await botApi.module(auth.session.uid, auth.guild.id, auth.mod.id));
  } catch (error) {
    return botErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await authorize(request, context, 'write');
  if ('response' in auth) return auth.response;
  const { session, guild, mod } = auth;

  const raw = await request.text();
  if (raw.length > 64_000) return errorResponse(413, 'This change is too large.', 'too_large');
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return errorResponse(400, 'Invalid request.', 'invalid_json'); }
  const { revision, changes } = (body && typeof body === 'object' ? body : {}) as { revision?: unknown; changes?: unknown };
  if (typeof revision !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(revision)) {
    return errorResponse(400, 'Reload the page and try again.', 'invalid_revision');
  }

  const result = validateModuleChanges(mod, changes);
  if (!result.ok) {
    auditDashboard({ actor: session.uid, guild: guild.id, module: mod.id, action: 'update', outcome: 'rejected', reason: result.error });
    return jsonResponse({ error: result.error, code: 'invalid', path: result.path }, 422);
  }

  const keys = Object.keys(result.changes);
  try {
    const snapshot = await botApi.updateModule(session.uid, guild.id, mod.id, revision, result.changes);
    auditDashboard({ actor: session.uid, guild: guild.id, module: mod.id, action: 'update', keys, outcome: 'ok' });
    return jsonResponse(snapshot);
  } catch (error) {
    auditDashboard({ actor: session.uid, guild: guild.id, module: mod.id, action: 'update', keys, outcome: 'failed', reason: error instanceof BotApiError ? error.code : 'error' });
    return botErrorResponse(error);
  }
}
