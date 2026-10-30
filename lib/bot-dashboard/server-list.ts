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
export type ServerList = { servers: ServerCard[]; hidden: number; botApi: 'connected' | 'not_connected' | 'unavailable' };

/** Servers the user may manage, with Cloudy's presence when the Dashboard API can tell. */
export async function loadServerList(session: BotSession): Promise<ServerList> {
  const { manageable, hidden } = await getManageableGuilds(session.at);
  let present: Set<string> | null = null;
  let status: ServerList['botApi'] = isBotApiConfigured() ? 'connected' : 'not_connected';
  if (status === 'connected' && manageable.length) {
    try {
      present = new Set((await botApi.presence(session.uid, manageable.map(guild => guild.id))).present);
    } catch {
      status = 'unavailable';
    }
  }
  return {
    hidden,
    botApi: status,
    servers: manageable.map(guild => ({
      id: guild.id,
      name: guild.name,
      iconUrl: guildIconUrl(guild),
      role: guild.role,
      cloudy: present ? (present.has(guild.id) ? 'installed' : 'missing') : 'unknown',
      inviteUrl: botInviteUrl(guild.id),
    })),
  };
}
