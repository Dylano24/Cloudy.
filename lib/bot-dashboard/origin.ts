import { invitePermissionBits } from './permissions';

// The one origin that may receive the Discord OAuth callback for the dashboard.
// Discord only redirects to registered URLs, so a visitor on another alias of
// the same deployment is first sent to this origin. Derived from Vercel's own
// system variables or an explicit setting, never from the request URL query.
export function dashboardOrigin(requestOrigin: string) {
  const configured = process.env.CLOUDY_BOT_DASHBOARD_ORIGIN;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:' || url.hostname === 'localhost') return url.origin;
    } catch { /* fall through */ }
  }
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return requestOrigin;
}

export function dashboardRedirectUri(origin: string) {
  return `${origin}/api/bot/auth/callback`;
}

const invitePermissions = invitePermissionBits();

/** Discord's own "Add app" page, pre-selecting the server. Null until the bot's client id is configured. */
export function botInviteUrl(guildId?: string) {
  const clientId = process.env.CLOUDY_BOT_CLIENT_ID;
  if (!clientId || !/^\d{17,20}$/.test(clientId)) return null;
  const params = new URLSearchParams({ client_id: clientId, scope: 'bot applications.commands', permissions: invitePermissions });
  if (guildId && /^\d{17,20}$/.test(guildId)) {
    params.set('guild_id', guildId);
    params.set('disable_guild_select', 'true');
  }
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
