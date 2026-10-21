import type { AccountUser } from './account-session';
export type VerifiedLinks = { discord_id?: string; steam_id?: string };
export function checkLinks(user: AccountUser | null, required: string[], links: VerifiedLinks) {
  if (!user) return { ok: false, error: 'Sign in to your Cloudy account before purchasing.', missing: ['cloudy'] };
  const verified: VerifiedLinks = { ...(user.provider === 'discord' || !user.provider ? { discord_id: user.id } : {}), ...links };
  const missing = required.filter(id => ['steam_id', 'discord_id'].includes(id) && !verified[id as keyof VerifiedLinks]);
  return { ok: missing.length === 0, missing, verified, error: missing.length ? `Link your ${missing.map(id => id === 'steam_id' ? 'Steam' : 'Discord').join(' and ')} account before purchasing.` : '' };
}
