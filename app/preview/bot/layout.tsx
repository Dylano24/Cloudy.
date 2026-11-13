import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { Info } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { DashboardShell } from '@/components/bot/dashboard-shell';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { DEMO_BASE, DEMO_CHANNELS, DEMO_GUILD, DEMO_ROLES, DEMO_USER, demoAllowed, demoPlan } from '@/lib/bot-dashboard/demo';
import styles from '@/components/bot/bot.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cloudy Bot | Dashboard demo', robots: { index: false, follow: false } };

const NAV_MODULES = MODULES.map(module => ({ id: module.id, title: module.title, group: module.group, icon: module.icon }));

// Preview-only: the real dashboard with sample data, for reviewing without a
// Discord login. Never available on the production site; never calls Cloudy.
export default function DashboardDemoLayout({ children }: { children: ReactNode }) {
  if (!demoAllowed()) notFound();
  return (
    <div className={styles.root}>
      <DashboardShell
        data={{ guild: DEMO_GUILD, channels: DEMO_CHANNELS, roles: DEMO_ROLES, csrf: 'demo', plan: demoPlan(), base: DEMO_BASE, demo: true }}
        user={DEMO_USER} servers={[{ id: DEMO_GUILD.id, name: DEMO_GUILD.name, iconUrl: null }]} groups={GROUPS} modules={NAV_MODULES}>
        <div className={`${styles.notice} ${styles.noticeNeutral}`} role="note" style={{ marginBottom: 18 }}>
          <Info size={18} aria-hidden="true" />
          <div>
            <strong>Demo with sample data</strong>
            This is the Cloudy Bot dashboard with a made-up server. Nothing you change here reaches Cloudy. To manage your own server, log in with Discord.
            <div style={{ marginTop: 12 }}><Link className={`${styles.button} ${styles.buttonSmall}`} href={'/bot' as Route}><SiDiscord size={15} aria-hidden="true" /> Log in with Discord</Link></div>
          </div>
        </div>
        {children}
      </DashboardShell>
    </div>
  );
}
