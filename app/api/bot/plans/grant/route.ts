import { NextRequest } from 'next/server';
import { botApi, BotApiError } from '@/lib/bot-dashboard/bot-api';
import { errorResponse, guardRequest, jsonResponse } from '@/lib/bot-dashboard/server';
import { auditDashboard } from '@/lib/bot-dashboard/audit';

// Owner only. Cloudy verifies that the signed-in Discord user is its owner.
export async function POST(request: NextRequest) {
  const guard = guardRequest(request, 'write');
  if (!guard.ok) return guard.response;
  const raw = await request.text();
  if (raw.length > 1_000) return errorResponse(413, 'This request is too large.', 'too_large');
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return errorResponse(400, 'Invalid request.', 'invalid_json'); }
  const { guildId, months } = (body && typeof body === 'object' ? body : {}) as { guildId?: unknown; months?: unknown };
  if (typeof guildId !== 'string' || !/^\d{17,20}$/.test(guildId)) return errorResponse(422, 'Enter a valid server ID.', 'invalid');
  if (typeof months !== 'number' || !Number.isInteger(months) || months < 0 || months > 24) return errorResponse(422, 'Choose 0 to 24 months.', 'invalid');
  try {
    const result = await botApi.grantPremium(guard.session, guildId, months);
    auditDashboard({ actor: guard.session.uid, guild: guildId, module: 'plan', action: 'action', keys: [months ? `premium:+${months}` : 'premium:off'], outcome: 'ok' });
    return jsonResponse(result);
  } catch (error) {
    auditDashboard({ actor: guard.session.uid, guild: guildId, module: 'plan', action: 'action', keys: ['premium'], outcome: 'failed' });
    if (error instanceof BotApiError) return errorResponse([403, 404, 422, 429, 503].includes(error.status) ? error.status : 502, error.message, error.code);
    return errorResponse(502, 'Cloudy could not change Premium.', 'bot_error');
  }
}
