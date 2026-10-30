import { headers } from 'next/headers';
import { Wrench } from 'lucide-react';
import { discordCredentials } from '@/lib/bot-dashboard/discord';
import { isBotApiConfigured } from '@/lib/bot-dashboard/bot-api';
import { dashboardOrigin, dashboardRedirectUri } from '@/lib/bot-dashboard/origin';
import styles from './bot.module.css';

/**
 * Shown only on Vercel preview deployments: the exact Discord redirect URL to
 * register and which settings are present (yes/no only, never values).
 */
export async function PreviewSetup() {
  if (process.env.VERCEL_ENV !== 'preview') return null;
  const list = await headers();
  const host = list.get('x-forwarded-host') || list.get('host') || '';
  const origin = dashboardOrigin(host ? `https://${host}` : '');
  const checks = [
    ['Discord login (DISCORD_CLIENT_ID / SECRET)', Boolean(discordCredentials())],
    ['Invite button (CLOUDY_BOT_CLIENT_ID)', Boolean(process.env.CLOUDY_BOT_CLIENT_ID)],
    ['Live settings (CLOUDY_BOT_API_URL + CLOUDY_DASHBOARD_API_SECRET)', isBotApiConfigured()],
  ] as const;
  return (
    <div className={styles.container} style={{ paddingBottom: 'var(--cloudy-page-pad)' }}>
      <div className={`${styles.notice} ${styles.noticeNeutral}`} role="note">
        <Wrench size={18} aria-hidden="true" />
        <div style={{ minWidth: 0 }}>
          <strong>Preview setup (only visible on preview deployments)</strong>
          Add this redirect in the Discord Developer Portal (OAuth2 → Redirects):
          <code style={{ display: 'block', margin: '8px 0 12px', overflowWrap: 'anywhere', fontSize: 12 }}>{dashboardRedirectUri(origin)}</code>
          {checks.map(([label, ok]) => (
            <div key={label} className={styles.small}>{ok ? '✓' : '✗'} {label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
