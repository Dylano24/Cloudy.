import { getManageableGuilds } from './discord';
import { botApi, isBotApiConfigured } from './bot-api';
import { guildIconUrl, type ManageRole } from './permissions';
import { botInviteUrl } from './origin';
import type { BotSession } from './session';

export type CloudyPresence = 'installed' | 'missing' | 'unknown';
export type ServerCard = {
  id: string;
  name: string;
  iconUrl: string | null;
  role: ManageRole;
  cloudy: CloudyPresence;
  inviteUrl: string | null;
};
export type ServerList = { servers: ServerCard[]; hidden: number; connected: boolean };

let applicationIdCache: { at: number; value: string | null } | null = null;

/** Cloudy's application id (for the invite link), from settings or Cloudy itself. */
export async function cloudyApplicationId(actorId: string) {
  if (process.env.CLOUDY_BOT_CLIENT_ID) return process.env.CLOUDY_BOT_CLIENT_ID;
  if (applicationIdCache && Date.now() - applicationIdCache.at < 3_600_000) return applicationIdCache.value;
  try {
    const { applicationId } = await botApi.meta(actorId);
    applicationIdCache = { at: Date.now(), value: applicationId };
    return applicationId;
  } catch {
    return null;
  }
}

/** Servers the user may manage, with whether Cloudy is in each one. */
export async function loadServerList(session: BotSession): Promise<ServerList> {
  const { manageable, hidden } = await getManageableGuilds(session.at);
  let present: Set<string> | null = null;
  if (isBotApiConfigured() && manageable.length) {
    try {
      present = new Set((await botApi.presence(session.uid, manageable.map(guild => guild.id))).present);
    } catch {
      present = null;
    }
  }
  const applicationId = await cloudyApplicationId(session.uid);
  // Servers with Cloudy first, then the rest; alphabetical inside each group.
  const servers: ServerCard[] = manageable.map(guild => ({
    id: guild.id,
    name: guild.name,
    iconUrl: guildIconUrl(guild),
    role: guild.role,
    cloudy: present ? (present.has(guild.id) ? 'installed' : 'missing') : 'unknown',
    inviteUrl: botInviteUrl(guild.id, applicationId),
  }));
  servers.sort((a, b) => Number(b.cloudy === 'installed') - Number(a.cloudy === 'installed'));
  return { hidden, connected: present !== null, servers };
}
