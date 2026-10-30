import { createHash, createHmac, randomBytes } from 'node:crypto';

// Contract with Cloudy's Dashboard API on Railway (docs/bot-dashboard/BOT_API_SPEC.md).
// The website never touches Cloudy's database or Redis directly: Cloudy keeps
// its own write queues and caches, so every change must go through the bot.

const DEFAULT_BOT_ORIGIN = 'https://cloudy-production-b24f.up.railway.app';
const API_PREFIX = '/api/dashboard/v1';
const TIMEOUT_MS = 6_000;

export type BotApiConfig = { origin: string; secret: string | null };
/** Who is asking: the signed-in user's Discord id and their Discord login. */
export type BotAuth = { uid: string; at: string };

// Cloudy accepts either a shared secret (when configured on both sides) or
// the user's own Discord login, which Cloudy verifies with Discord.
export function botApiConfig(): BotApiConfig | null {
  const origin = process.env.CLOUDY_BOT_API_URL || DEFAULT_BOT_ORIGIN;
  const rawSecret = process.env.CLOUDY_DASHBOARD_API_SECRET;
  const secret = rawSecret && rawSecret.length >= 32 ? rawSecret : null;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') return null;
    return { origin: url.origin, secret };
  } catch {
    return null;
  }
}

export function isBotApiConfigured() {
  return botApiConfig() !== null;
}

export function signDashboardRequest(
  { method, path, body, actorId }: { method: string; path: string; body: string; actorId: string },
  secret: string,
  now = Date.now(),
  nonce = randomBytes(16).toString('base64url'),
) {
  const timestamp = String(Math.floor(now / 1000));
  const bodyHash = createHash('sha256').update(body).digest('hex');
  const canonical = ['cloudy-dashboard-v1', method.toUpperCase(), path, timestamp, nonce, actorId, bodyHash].join('\n');
  const signature = createHmac('sha256', secret).update(canonical).digest('base64url');
  return {
    'x-cloudy-dashboard-timestamp': timestamp,
    'x-cloudy-dashboard-nonce': nonce,
    'x-cloudy-dashboard-actor': actorId,
    'x-cloudy-dashboard-signature': signature,
  };
}

export class BotApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) { super(message); }
}

async function call<T>(method: 'GET' | 'POST' | 'PATCH', path: string, auth: BotAuth, payload?: unknown): Promise<T> {
  const config = botApiConfig();
  if (!config) throw new BotApiError('Cloudy Dashboard API is not connected yet', 503, 'not_configured');
  const fullPath = `${API_PREFIX}${path}`;
  const body = payload === undefined ? '' : JSON.stringify(payload);
  let response: Response;
  try {
    response = await fetch(`${config.origin}${fullPath}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(config.secret
          ? signDashboardRequest({ method, path: fullPath, body, actorId: auth.uid }, config.secret)
          : { Authorization: `Bearer ${auth.at}` }),
      },
      body: body || undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new BotApiError('Cloudy did not respond in time', 504, 'unreachable');
  }
  const data = await response.json().catch(() => null) as { error?: unknown; code?: unknown } | null;
  if (!response.ok) {
    // Only pass on Cloudy's short user-facing message, never internal detail.
    const message = typeof data?.error === 'string' && data.error.length <= 200 ? data.error : 'Cloudy could not complete this request';
    const code = typeof data?.code === 'string' && /^[a-z_]{1,40}$/.test(data.code) ? data.code : 'bot_error';
    throw new BotApiError(message, response.status, code);
  }
  return data as T;
}

export type BotChannel = { id: string; name: string; type: 'text' | 'voice' | 'category' | 'announcement' | 'forum'; parentId: string | null; position: number };
export type BotRole = { id: string; name: string; color: number; position: number; managed: boolean; assignable: boolean };
export type GuildOverview = {
  guild: { id: string; name: string; memberCount: number; icon: string | null };
  channels: BotChannel[];
  roles: BotRole[];
  modules: Record<string, { enabled: boolean | null }>;
  plan?: Plan;
  missingPermissions: string[];
};
/**
 * Cloudy decides and enforces the plan. `new`: free trial starts with the first
 * save. `expired`: settings stay visible, saving needs Premium.
 */
export type Plan = {
  status: 'owner' | 'premium' | 'trial' | 'new' | 'expired';
  canSave: boolean;
  until: string | null;
  priceEur: number;
  trialDays: number;
};
export type ModuleSnapshot = { revision: string; values: Record<string, unknown>; plan?: Plan };
export type Insight = { stats: { label: string; value: string }[]; tables: { title: string; columns: string[]; rows: string[][]; empty: string }[] };

export const botApi = {
  meta: (auth: BotAuth) => call<{ applicationId: string | null }>('GET', '/meta', auth),
  insight: (auth: BotAuth, guildId: string, moduleId: string) =>
    call<Insight>('GET', `/guilds/${guildId}/insights/${moduleId}`, auth),
  presence: (auth: BotAuth, guildIds: string[]) =>
    call<{ present: string[] }>('POST', '/guilds/presence', auth, { guildIds: guildIds.slice(0, 200) }),
  overview: (auth: BotAuth, guildId: string) =>
    call<GuildOverview>('GET', `/guilds/${guildId}/overview`, auth),
  module: (auth: BotAuth, guildId: string, moduleId: string) =>
    call<ModuleSnapshot>('GET', `/guilds/${guildId}/modules/${moduleId}`, auth),
  updateModule: (auth: BotAuth, guildId: string, moduleId: string, revision: string, changes: Record<string, unknown>) =>
    call<ModuleSnapshot>('PATCH', `/guilds/${guildId}/modules/${moduleId}`, auth, { revision, changes }),
  action: (auth: BotAuth, guildId: string, moduleId: string, actionId: string) =>
    call<{ ok: true; message: string }>('POST', `/guilds/${guildId}/modules/${moduleId}/actions/${actionId}`, auth, {}),
  grantPremium: (auth: BotAuth, guildId: string, months: number) =>
    call<{ guild: { id: string; name: string }; plan: Plan }>('POST', '/plans/grant', auth, { guildId, months }),
};

// Cloudy's public health endpoint already exists and needs no secret.
export type BotHealth = { online: boolean; uptimeSeconds: number | null; version: string | null; databaseOk: boolean | null; checkedAt: string };
let healthCache: { at: number; value: BotHealth } | null = null;

export function botPublicOrigin() {
  const configured = botApiConfig()?.origin || process.env.CLOUDY_BOT_PUBLIC_URL;
  try { return configured ? new URL(configured).origin : DEFAULT_BOT_ORIGIN; } catch { return DEFAULT_BOT_ORIGIN; }
}

export async function getBotHealth(): Promise<BotHealth> {
  if (healthCache && Date.now() - healthCache.at < 15_000) return healthCache.value;
  const checkedAt = new Date().toISOString();
  let value: BotHealth;
  try {
    const response = await fetch(`${botPublicOrigin()}/health`, { cache: 'no-store', signal: AbortSignal.timeout(3_000) });
    const data = await response.json().catch(() => null) as { status?: unknown; uptime?: unknown; build?: { commit?: unknown }; database?: { connected?: unknown; degraded?: unknown } } | null;
    value = {
      online: response.ok && data?.status === 'healthy',
      uptimeSeconds: typeof data?.uptime === 'number' ? Math.floor(data.uptime) : null,
      version: typeof data?.build?.commit === 'string' && /^[a-f0-9]{7,40}$/.test(data.build.commit) ? data.build.commit.slice(0, 7) : null,
      databaseOk: typeof data?.database?.connected === 'boolean' ? data.database.connected && data.database.degraded !== true : null,
      checkedAt,
    };
  } catch {
    value = { online: false, uptimeSeconds: null, version: null, databaseOk: null, checkedAt };
  }
  healthCache = { at: Date.now(), value };
  return value;
}
