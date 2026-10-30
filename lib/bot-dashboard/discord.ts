import { createHash } from 'node:crypto';
import { manageableGuilds, type ManageableGuild } from './permissions';

const API = 'https://discord.com/api/v10';
const GUILD_CACHE_MS = 60_000;
const GUILD_CACHE_LIMIT = 500;

export const DASHBOARD_SCOPES = 'identify guilds';

export class DiscordAuthError extends Error {
  constructor(message: string, readonly status = 401) { super(message); }
}

export function discordCredentials() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export async function exchangeCode(code: string, redirectUri: string) {
  const credentials = discordCredentials();
  if (!credentials) throw new DiscordAuthError('Discord login is not configured', 503);
  const response = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new DiscordAuthError('Discord rejected the login code');
  const data = await response.json() as { access_token?: unknown; expires_in?: unknown; scope?: unknown };
  const scopes = typeof data.scope === 'string' ? data.scope.split(' ') : [];
  if (typeof data.access_token !== 'string' || !scopes.includes('identify') || !scopes.includes('guilds')) {
    throw new DiscordAuthError('Discord did not grant the required access');
  }
  const expiresIn = typeof data.expires_in === 'number' && data.expires_in > 0 ? data.expires_in : 3600;
  return { accessToken: data.access_token, expiresIn };
}

export async function fetchDiscordUser(accessToken: string) {
  const response = await fetch(`${API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new DiscordAuthError('Could not read your Discord profile');
  const user = await response.json() as { id?: unknown; username?: unknown; global_name?: unknown; avatar?: unknown };
  if (typeof user.id !== 'string' || !/^\d{17,20}$/.test(user.id) || typeof user.username !== 'string') {
    throw new DiscordAuthError('Discord returned an invalid profile');
  }
  const username = user.username.slice(0, 64);
  const name = (typeof user.global_name === 'string' && user.global_name.trim() ? user.global_name : username).slice(0, 100);
  const avatar = typeof user.avatar === 'string' && /^(a_)?[a-f0-9]{32}$/.test(user.avatar) ? user.avatar : null;
  return { id: user.id, username, name, avatar };
}

export async function revokeToken(accessToken: string) {
  const credentials = discordCredentials();
  if (!credentials) return;
  await fetch(`${API}/oauth2/token/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      token: accessToken,
      token_type_hint: 'access_token',
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(5_000),
  }).catch(() => undefined);
}

type GuildCacheEntry = { at: number; value: { manageable: ManageableGuild[]; hidden: number } };
const guildCache = new Map<string, GuildCacheEntry>();
const inFlight = new Map<string, Promise<GuildCacheEntry['value']>>();

function tokenKey(accessToken: string) {
  return createHash('sha256').update(accessToken).digest('base64url');
}

/**
 * The servers this user can manage, straight from Discord with the user's own
 * token. Cached briefly per token: Discord rate-limits this route per user,
 * and permissions are re-read at least every minute.
 */
export async function getManageableGuilds(accessToken: string, { fresh = false } = {}) {
  const key = tokenKey(accessToken);
  const cached = guildCache.get(key);
  if (!fresh && cached && Date.now() - cached.at < GUILD_CACHE_MS) return cached.value;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const response = await fetch(`${API}/users/@me/guilds?limit=200`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 401) throw new DiscordAuthError('Your Discord session has expired');
    if (response.status === 429 && cached) return cached.value;
    if (!response.ok) throw new DiscordAuthError('Discord could not list your servers right now', 502);
    const value = manageableGuilds(await response.json());
    guildCache.set(key, { at: Date.now(), value });
    while (guildCache.size > GUILD_CACHE_LIMIT) guildCache.delete(guildCache.keys().next().value as string);
    return value;
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
}

export function forgetGuildCache(accessToken: string) {
  guildCache.delete(tokenKey(accessToken));
}
