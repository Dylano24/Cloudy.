const bit = (position: number) => BigInt(1) << BigInt(position);

// Discord permission bits used by the dashboard. Discord sends permissions as
// a decimal string because the bitfield exceeds 53 bits, so use BigInt.
export const PERMISSIONS = {
  KICK_MEMBERS: bit(1),
  BAN_MEMBERS: bit(2),
  ADMINISTRATOR: bit(3),
  MANAGE_CHANNELS: bit(4),
  MANAGE_GUILD: bit(5),
  ADD_REACTIONS: bit(6),
  VIEW_AUDIT_LOG: bit(7),
  VIEW_CHANNEL: bit(10),
  SEND_MESSAGES: bit(11),
  MANAGE_MESSAGES: bit(13),
  EMBED_LINKS: bit(14),
  ATTACH_FILES: bit(15),
  READ_MESSAGE_HISTORY: bit(16),
  MENTION_EVERYONE: bit(17),
  USE_EXTERNAL_EMOJIS: bit(18),
  CONNECT: bit(20),
  SPEAK: bit(21),
  MOVE_MEMBERS: bit(24),
  MANAGE_ROLES: bit(28),
  MANAGE_THREADS: bit(34),
  SEND_MESSAGES_IN_THREADS: bit(38),
  MODERATE_MEMBERS: bit(40),
} as const;

// What Cloudy's existing features use: messages and embeds, moderation
// (kick, ban, timeout, purge), roles (auto roles, reaction roles, verification),
// channels (tickets, Join to Create, server stats), voice (music), the audit
// log (deletion attribution) and Manage Server (invite tracking). Deliberately
// not Administrator.
export const CLOUDY_INVITE_PERMISSIONS = [
  'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG',
  'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY',
  'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'CONNECT', 'SPEAK', 'MOVE_MEMBERS', 'MANAGE_ROLES',
  'MANAGE_THREADS', 'SEND_MESSAGES_IN_THREADS', 'MODERATE_MEMBERS',
] as const satisfies readonly (keyof typeof PERMISSIONS)[];

export function invitePermissionBits() {
  return CLOUDY_INVITE_PERMISSIONS.reduce((total, name) => total | PERMISSIONS[name], BigInt(0)).toString();
}

export type DiscordPartialGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
};

export type ManageRole = 'owner' | 'administrator' | 'manager';

function parseBits(value: unknown) {
  if (typeof value !== 'string' || !/^\d{1,30}$/.test(value)) return BigInt(0);
  try { return BigInt(value); } catch { return BigInt(0); }
}

/**
 * The same rule Discord itself uses for adding a bot: the server owner, an
 * Administrator or someone with Manage Server. Everyone else is excluded.
 */
export function manageRole(guild: Pick<DiscordPartialGuild, 'owner' | 'permissions'>): ManageRole | null {
  if (guild.owner === true) return 'owner';
  const bits = parseBits(guild.permissions);
  if ((bits & PERMISSIONS.ADMINISTRATOR) === PERMISSIONS.ADMINISTRATOR) return 'administrator';
  if ((bits & PERMISSIONS.MANAGE_GUILD) === PERMISSIONS.MANAGE_GUILD) return 'manager';
  return null;
}

export const SNOWFLAKE_PATTERN = /^\d{17,20}$/;
export function isSnowflake(value: unknown): value is string {
  return typeof value === 'string' && SNOWFLAKE_PATTERN.test(value);
}

export type ManageableGuild = { id: string; name: string; icon: string | null; role: ManageRole };

export function manageableGuilds(guilds: unknown): { manageable: ManageableGuild[]; hidden: number } {
  if (!Array.isArray(guilds)) return { manageable: [], hidden: 0 };
  const manageable: ManageableGuild[] = [];
  let hidden = 0;
  for (const guild of guilds.slice(0, 500)) {
    if (!guild || typeof guild !== 'object' || !isSnowflake((guild as DiscordPartialGuild).id)) continue;
    const role = manageRole(guild as DiscordPartialGuild);
    if (!role) { hidden += 1; continue; }
    const { id, name, icon } = guild as DiscordPartialGuild;
    manageable.push({
      id,
      name: typeof name === 'string' ? name.slice(0, 100) : 'Unnamed server',
      icon: typeof icon === 'string' && /^(a_)?[a-f0-9]{32}$/.test(icon) ? icon : null,
      role,
    });
  }
  manageable.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return { manageable, hidden };
}

export function guildIconUrl(guild: Pick<ManageableGuild, 'id' | 'icon'>, size = 96) {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'webp'}?size=${size}`;
}

export function userAvatarUrl(user: { uid: string; avatar: string | null }, size = 96) {
  if (!user.avatar) {
    const index = Number((BigInt(user.uid) >> BigInt(22)) % BigInt(6));
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${user.uid}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=${size}`;
}
