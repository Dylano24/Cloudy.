import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { RefreshCw } from 'lucide-react';
import { readDashboardSession } from '@/lib/bot-dashboard/server';
import { csrfTokenFor, safeReturnPath } from '@/lib/bot-dashboard/session';
import { getManageableGuilds } from '@/lib/bot-dashboard/discord';
import { userAvatarUrl } from '@/lib/bot-dashboard/permissions';
import { BotLanding } from '@/components/bot/landing';
import { ServerList, ServerListSkeleton } from '@/components/bot/server-picker';
import { LogoutButton } from '@/components/bot/logout-button';
import { PreviewSetup } from '@/components/bot/preview-setup';
import styles from '@/components/bot/bot.module.css';

export const metadata: Metadata = {
  title: 'Cloudy Bot | Server dashboard',
  description: 'Manage Cloudy for your Discord server: welcome messages, tickets, leveling, logs and more.',
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BotPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await readDashboardSession();

  if (!session) {
    const loginError = typeof params.login_error === 'string' ? params.login_error.slice(0, 20) : null;
    const next = safeReturnPath(typeof params.next === 'string' ? params.next : null);
    return <div className={styles.root}><BotLanding loginError={loginError} next={next} /><PreviewSetup /></div>;
  }

  if (params.refresh === '1') await getManageableGuilds(session.at, { fresh: true }).catch(() => undefined);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <header className={styles.pickerHead}>
          <div className={styles.profile}>
            <img className={styles.avatar} src={userAvatarUrl(session, 128)} alt="" width={64} height={64} decoding="async" />
            <div>
              <span className={styles.eyebrow}>Cloudy Bot</span>
              <h1 className={styles.display} style={{ marginTop: 8 }}>Welcome, {session.name}</h1>
              <p>@{session.username} · Choose a server to manage</p>
            </div>
          </div>
          <div className={styles.pickerTools}>
            <Link href={'/bot?refresh=1' as Route} className={styles.buttonGhost} prefetch={false}><RefreshCw size={16} aria-hidden="true" /> Refresh</Link>
            <LogoutButton csrf={csrfTokenFor(session)} />
          </div>
        </header>
        <Suspense fallback={<ServerListSkeleton />}>
          <ServerList session={session} />
        </Suspense>
      </div>
    </div>
  );
}
