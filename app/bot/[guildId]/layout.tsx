import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle, ShieldOff } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { DashboardShell } from '@/components/bot/dashboard-shell';
import styles from '@/components/bot/bot.module.css';

export const metadata: Metadata = { title: 'Cloudy Bot | Dashboard', robots: { index: false, follow: false } };

const NAV_MODULES = MODULES.map(module => ({ id: module.id, title: module.title, group: module.group, icon: module.icon, soon: module.readiness !== 'service-ready' }));

function Blocked({ title, text, action }: { title: string; text: string; action: ReactNode }) {
  return (
    <div className={styles.root}>
      <div className={styles.container} style={{ paddingBlock: 'var(--cloudy-page-pad)', maxWidth: 640 }}>
        <div className={styles.notice} role="alert">
          {title.startsWith('No access') ? <ShieldOff size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
          <div><strong>{title}</strong>{text}<div style={{ marginTop: 14 }}>{action}</div></div>
        </div>
      </div>
    </div>
  );
}

export default async function GuildLayout({ children, params }: { children: ReactNode; params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);

  switch (context.kind) {
    case 'login':
      redirect(`/api/bot/auth/login?next=${encodeURIComponent(`/bot/${guildId}`)}`);
    case 'invalid':
      notFound();
    case 'expired':
      return <Blocked title="Your Discord login has expired" text="Log in again to continue." action={<a className={`${styles.button} ${styles.buttonSmall}`} href={`/api/bot/auth/login?next=${encodeURIComponent(`/bot/${guildId}`)}`}><SiDiscord size={15} aria-hidden="true" /> Log in again</a>} />;
    case 'discord-error':
      return <Blocked title="Discord did not answer" text="Your permissions could not be checked right now, so nothing is shown. Please try again in a moment." action={<Link className={`${styles.buttonGhost} ${styles.buttonSmall}`} href={`/bot/${guildId}` as Route}>Try again</Link>} />;
    case 'forbidden':
      return <Blocked title="No access to this server" text="You need to be the owner, an Administrator or have Manage Server in this server." action={<Link className={`${styles.buttonGhost} ${styles.buttonSmall}`} href={'/bot' as Route}>Back to your servers</Link>} />;
    case 'demo':
      return (
        <div className={styles.root}>
          <DashboardShell
            data={{ mode: 'demo', guild: context.guild, channels: context.channels, roles: context.roles, csrf: null }}
            user={null} servers={[{ id: 'demo', name: context.guild.name, iconUrl: null }]} groups={GROUPS} modules={NAV_MODULES}>
            {children}
          </DashboardShell>
        </div>
      );
    case 'ok':
      return (
        <div className={styles.root}>
          <DashboardShell
            data={{ mode: context.mode, guild: context.guild, channels: context.channels, roles: context.roles, csrf: context.csrf }}
            user={context.user} servers={context.servers} groups={GROUPS} modules={NAV_MODULES}>
            {children}
          </DashboardShell>
        </div>
      );
  }
}
