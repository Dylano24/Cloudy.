import { cache } from 'react';
import { readDashboardSession } from './server';
import { DiscordAuthError, getManageableGuilds } from './discord';
import { botApi, BotApiError, type BotChannel, type BotRole, type Plan } from './bot-api';
import { csrfTokenFor, type BotSession } from './session';
import { guildIconUrl, isSnowflake, userAvatarUrl, type ManageableGuild } from './permissions';
import { botInviteUrl } from './origin';
import { cloudyApplicationId } from './server-list';
import { PLAN_PRICE_EUR } from './plan';

export type GuildContext =
  | { kind: 'login' }
  | { kind: 'invalid' }
  | { kind: 'expired' }
  | { kind: 'discord-error' }
  | { kind: 'forbidden' }
  | { kind: 'not-installed'; guildName: string; inviteUrl: string | null }
  | { kind: 'offline'; guildName: string }
  | {
    kind: 'ok';
    session: BotSession;
    csrf: string;
    user: { name: string; username: string; avatarUrl: string };
    guild: { id: string; name: string; iconUrl: string | null; memberCount: number | null; role: ManageableGuild['role'] };
    servers: { id: string; name: string; iconUrl: string | null }[];
    channels: BotChannel[];
    roles: BotRole[];
    plan: Plan;
    missingPermissions: string[];
  };

/** Everything a dashboard page needs about one server, checked server-side and shared per request. */
export const loadGuildContext = cache(async (guildId: string): Promise<GuildContext> => {
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
  if (!guild) return { kind: 'forbidden' };

  try {
    const overview = await botApi.overview(session, guild.id);
    return {
      kind: 'ok',
      session,
      csrf: csrfTokenFor(session),
      user: { name: session.name, username: session.username, avatarUrl: userAvatarUrl(session, 64) },
      guild: { id: guild.id, name: guild.name, iconUrl: guildIconUrl(guild, 96), memberCount: overview.guild.memberCount, role: guild.role },
      servers: manageable.map(entry => ({ id: entry.id, name: entry.name, iconUrl: guildIconUrl(entry, 64) })),
      channels: overview.channels,
      roles: overview.roles,
      plan: overview.plan || { status: 'new', canSave: true, until: null, priceEur: PLAN_PRICE_EUR, trialDays: 7 },
      missingPermissions: overview.missingPermissions,
    };
  } catch (error) {
    if (error instanceof BotApiError && error.code === 'not_in_guild') {
      return { kind: 'not-installed', guildName: guild.name, inviteUrl: botInviteUrl(guild.id, await cloudyApplicationId(session)) };
    }
    return { kind: 'offline', guildName: guild.name };
  }
});
