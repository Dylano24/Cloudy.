import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle, Plus, ShieldOff } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { DashboardShell } from '@/components/bot/dashboard-shell';
import styles from '@/components/bot/bot.module.css';

export const metadata: Metadata = { title: 'Cloudy Bot | Dashboard', robots: { index: false, follow: false } };

const NAV_MODULES = MODULES.map(module => ({ id: module.id, title: module.title, group: module.group, icon: module.icon }));

function Blocked({ title, text, action, icon = 'alert' }: { title: string; text: string; action: ReactNode; icon?: 'alert' | 'shield' }) {
  return (
    <div className={styles.root}>
      <div className={styles.container} style={{ paddingBlock: 'var(--cloudy-page-pad)', maxWidth: 640 }}>
        <div className={styles.notice} role="alert">
          {icon === 'shield' ? <ShieldOff size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
          <div><strong>{title}</strong>{text}<div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>{action}</div></div>
        </div>
      </div>
    </div>
  );
}

export default async function GuildLayout({ children, params }: { children: ReactNode; params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);
  const back = <Link className={`${styles.buttonGhost} ${styles.buttonSmall}`} href={'/bot' as Route}>Back to your servers</Link>;

  switch (context.kind) {
    case 'invalid':
      notFound();
    case 'login':
      redirect(`/api/bot/auth/login?next=${encodeURIComponent(`/bot/${guildId}`)}`);
    case 'expired':
      return <Blocked title="Your Discord login has expired" text="Log in again to continue." action={<a className={`${styles.button} ${styles.buttonSmall}`} href={`/api/bot/auth/login?next=${encodeURIComponent(`/bot/${guildId}`)}`}><SiDiscord size={15} aria-hidden="true" /> Log in again</a>} />;
    case 'discord-error':
      return <Blocked title="Discord did not answer" text="Your permissions could not be checked right now. Please try again in a moment." action={<Link className={`${styles.buttonGhost} ${styles.buttonSmall}`} href={`/bot/${guildId}` as Route}>Try again</Link>} />;
    case 'forbidden':
      return <Blocked icon="shield" title="No access to this server" text="You need to be the owner, an Administrator or have Manage Server in this server." action={back} />;
    case 'not-installed':
      return (
        <Blocked title={`Cloudy is not in ${context.guildName} yet`} text="Add Cloudy to this server to manage it here."
          action={<>{context.inviteUrl ? <a className={`${styles.button} ${styles.buttonSmall}`} href={context.inviteUrl} target="_blank" rel="noopener noreferrer"><Plus size={15} aria-hidden="true" /> Invite Cloudy</a> : null}{back}</>} />
      );
    case 'offline':
      return <Blocked title="Cloudy did not answer" text={`Cloudy could not load ${context.guildName} right now. Nothing was changed. Please try again in a moment.`} action={<><Link className={`${styles.button} ${styles.buttonSmall}`} href={`/bot/${guildId}` as Route}>Try again</Link>{back}</>} />;
    case 'ok':
      return (
        <div className={styles.root}>
          <DashboardShell
            data={{ guild: context.guild, channels: context.channels, roles: context.roles, csrf: context.csrf }}
            user={context.user} servers={context.servers} groups={GROUPS} modules={NAV_MODULES}>
            {children}
          </DashboardShell>
        </div>
      );
  }
}
