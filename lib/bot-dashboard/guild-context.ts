import { cache } from 'react';
import { readDashboardSession } from './server';
import { DiscordAuthError, getManageableGuilds } from './discord';
import { botApi, isBotApiConfigured, type BotChannel, type BotRole } from './bot-api';
import { csrfTokenFor, type BotSession } from './session';
import { guildIconUrl, isSnowflake, userAvatarUrl, type ManageableGuild } from './permissions';
import { DEMO_CHANNELS, DEMO_GUILD, DEMO_ROLES } from './demo';

export type GuildContext =
  | { kind: 'demo'; guild: { id: string; name: string; iconUrl: null; memberCount: number }; channels: BotChannel[]; roles: BotRole[] }
  | { kind: 'login' }
  | { kind: 'invalid' }
  | { kind: 'expired' }
  | { kind: 'discord-error' }
  | { kind: 'forbidden'; session: BotSession }
  | {
    kind: 'ok';
    session: BotSession;
    csrf: string;
    user: { name: string; username: string; avatarUrl: string };
    guild: { id: string; name: string; iconUrl: string | null; memberCount: number | null; role: ManageableGuild['role'] };
    servers: { id: string; name: string; iconUrl: string | null }[];
    mode: 'live' | 'unlinked';
    botError: boolean;
    channels: BotChannel[];
    roles: BotRole[];
    missingPermissions: string[];
  };

/** Everything a dashboard page needs about one server, checked server-side and shared per request. */
export const loadGuildContext = cache(async (guildId: string): Promise<GuildContext> => {
  if (guildId === 'demo') return { kind: 'demo', guild: DEMO_GUILD, channels: DEMO_CHANNELS, roles: DEMO_ROLES };
  if (!isSnowflake(guildId)) return { kind: 'invalid' };
  const session = await readDashboardSession();
  if (!session) return { kind: 'login' };

  let manageable: ManageableGuild[];
  try {
    manageable = (await getManageableGuilds(session.at)).manageable;
  } catch (error) {
    return error instanceof DiscordAuthError && error.status === 401 ? { kind: 'expired' } : { kind: 'discord-error' };
  }
  const guild = manageable.find(entry => entry.id === guildId);
  if (!guild) return { kind: 'forbidden', session };

  let mode: 'live' | 'unlinked' = isBotApiConfigured() ? 'live' : 'unlinked';
  let botError = false;
  let channels: BotChannel[] = [];
  let roles: BotRole[] = [];
  let memberCount: number | null = null;
  let missingPermissions: string[] = [];
  if (mode === 'live') {
    try {
      const overview = await botApi.overview(session.uid, guild.id);
      channels = overview.channels;
      roles = overview.roles;
      memberCount = overview.guild.memberCount;
      missingPermissions = overview.missingPermissions;
    } catch {
      botError = true;
      mode = 'unlinked';
    }
  }

  return {
    kind: 'ok',
    session,
    csrf: csrfTokenFor(session),
    user: { name: session.name, username: session.username, avatarUrl: userAvatarUrl(session, 64) },
    guild: { id: guild.id, name: guild.name, iconUrl: guildIconUrl(guild, 96), memberCount, role: guild.role },
    servers: manageable.map(entry => ({ id: entry.id, name: entry.name, iconUrl: guildIconUrl(entry, 64) })),
    mode,
    botError,
    channels,
    roles,
    missingPermissions,
  };
});
