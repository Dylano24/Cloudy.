import Link from 'next/link';
import type { Route } from 'next';
import { AlertTriangle, ArrowRight, Info, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { DiscordAuthError } from '@/lib/bot-dashboard/discord';
import { loadServerList, type ServerCard } from '@/lib/bot-dashboard/server-list';
import type { BotSession } from '@/lib/bot-dashboard/session';
import { GuildIcon } from './guild-icon';
import styles from './bot.module.css';

const ROLE_LABEL = { owner: 'Owner', administrator: 'Administrator', manager: 'Manage Server' } as const;

function PresencePill({ server }: { server: ServerCard }) {
  if (server.cloudy === 'installed') return <span className={`${styles.pill} ${styles.pillGreen}`}>Cloudy is here</span>;
  if (server.cloudy === 'missing') return <span className={`${styles.pill} ${styles.pillRed}`}>Cloudy not added</span>;
  return <span className={styles.pill}>Cloudy status pending</span>;
}

function InviteLink({ server, ghost }: { server: ServerCard; ghost?: boolean }) {
  if (!server.inviteUrl) {
    return <span className={`${ghost ? styles.buttonGhost : styles.button} ${styles.buttonSmall}`} aria-disabled="true" title="The invite link is not configured on this deployment yet.">Invite Cloudy</span>;
  }
  return (
    <a href={server.inviteUrl} className={`${ghost ? styles.buttonGhost : styles.button} ${styles.buttonSmall}`} target="_blank" rel="noopener noreferrer">
      <Plus size={15} aria-hidden="true" /> Invite Cloudy
    </a>
  );
}

export async function ServerList({ session }: { session: BotSession }) {
  let list;
  try {
    list = await loadServerList(session);
  } catch (error) {
    const expired = error instanceof DiscordAuthError && error.status === 401;
    return (
      <div className={styles.notice} role="alert" style={{ marginBottom: 'var(--cloudy-page-pad)' }}>
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <strong>{expired ? 'Your Discord login has expired' : 'Discord did not answer'}</strong>
          {expired ? 'Log in again to see your servers.' : 'Your servers could not be loaded right now. Please try again in a moment.'}
          <div style={{ marginTop: 12 }}>
            {expired
              ? <a className={`${styles.button} ${styles.buttonSmall}`} href="/api/bot/auth/login"><SiDiscord size={15} aria-hidden="true" /> Log in again</a>
              : <Link className={`${styles.buttonGhost} ${styles.buttonSmall}`} href={'/bot?refresh=1' as Route}><RefreshCw size={15} aria-hidden="true" /> Try again</Link>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {list.botApi !== 'connected' ? (
        <div className={`${styles.notice} ${styles.noticeNeutral}`} role="note" style={{ marginBottom: 'var(--cloudy-card-gap)' }}>
          <Info size={18} aria-hidden="true" />
          <div>
            <strong>{list.botApi === 'unavailable' ? 'Cloudy did not answer' : 'Cloudy connection pending'}</strong>
            {list.botApi === 'unavailable'
              ? 'Your servers are shown, but Cloudy could not confirm where it is installed right now.'
              : 'Your servers and permissions come live from Discord. Whether Cloudy is installed, and its settings, appear once Cloudy\'s Dashboard API is switched on.'}
          </div>
        </div>
      ) : null}

      <div className={styles.serverGrid}>
        {list.servers.map(server => (
          <article key={server.id} className={styles.serverCard}>
            <div className={styles.serverTop}>
              <GuildIcon name={server.name} url={server.iconUrl} />
              <div className={styles.serverName}>
                <strong title={server.name}>{server.name}</strong>
                <span className={styles.roleBadge}>{ROLE_LABEL[server.role]}</span>
              </div>
            </div>
            <div className={styles.serverMeta}><PresencePill server={server} /></div>
            <div className={[styles.serverActions, server.cloudy === 'unknown' ? styles.two : ''].join(' ')}>
              {server.cloudy === 'missing' ? <InviteLink server={server} /> : (
                <Link href={`/bot/${server.id}` as Route} className={`${styles.button} ${styles.buttonSmall}`} prefetch={false}>
                  Open dashboard <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
              {server.cloudy === 'unknown' ? <InviteLink server={server} ghost /> : null}
            </div>
          </article>
        ))}

        <article className={`${styles.serverCard} ${styles.demoCard}`}>
          <div className={styles.serverTop}>
            <span className={styles.guildIcon} aria-hidden="true"><Sparkles size={20} /></span>
            <div className={styles.serverName}><strong>Cloudy Demo Server</strong><span className={styles.roleBadge}>Demo</span></div>
          </div>
          <p className={`${styles.small} ${styles.muted}`} style={{ margin: 0 }}>Try every setting with sample data. Nothing is sent to Discord.</p>
          <div className={styles.serverActions}>
            <Link href={'/bot/demo' as Route} className={`${styles.buttonGhost} ${styles.buttonSmall}`}>Open demo <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </article>
      </div>

      {list.servers.length === 0 ? (
        <div className={styles.emptyState} style={{ marginBottom: 'var(--cloudy-page-pad)' }}>
          <strong>No servers to manage yet</strong>
          <p className={`${styles.small} ${styles.muted}`}>You need to be the owner, an Administrator or have Manage Server in a Discord server.</p>
        </div>
      ) : null}
      {list.hidden > 0 ? <p className={styles.hiddenNote}>{list.hidden} {list.hidden === 1 ? 'server is' : 'servers are'} hidden because you cannot manage {list.hidden === 1 ? 'it' : 'them'}.</p> : null}
    </>
  );
}

export function ServerListSkeleton() {
  return (
    <div className={styles.serverGrid} aria-busy="true" aria-label="Loading your servers">
      {[0, 1, 2].map(index => (
        <div key={index} className={styles.serverCard} style={{ minHeight: 190, opacity: 0.55 }}>
          <div className={styles.serverTop}><span className={styles.guildIcon} /><div className={styles.serverName}><strong>Loading…</strong></div></div>
        </div>
      ))}
    </div>
  );
}
