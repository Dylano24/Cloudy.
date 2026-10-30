import Link from 'next/link';
import type { Route } from 'next';
import { Suspense } from 'react';
import { AlertTriangle, ArrowRight, TerminalSquare, UsersRound } from 'lucide-react';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { GuildIcon } from '@/components/bot/guild-icon';
import { ModuleIcon } from '@/components/bot/module-icon';
import { BotStatusTile, StatusPlaceholder } from '@/components/bot/bot-status';
import { PageHead } from '@/components/bot/page-head';
import { PlanBanner } from '@/components/bot/plan-banner';
import styles from '@/components/bot/bot.module.css';

const ROLE_LABEL = { owner: 'Owner', administrator: 'Administrator', manager: 'Manage Server' } as const;
const GROUP_LABEL = Object.fromEntries(GROUPS.map(group => [group.id, group.label]));

export default async function GuildOverview({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);
  if (context.kind !== 'ok') return null;
  const { guild } = context;

  return (
    <div className={styles.stack}>
      <PageHead guildId={guild.id} guildName={guild.name} title="Overview" summary="Everything Cloudy does on this server, at a glance." />
      <PlanBanner />

      <section className={`${styles.panel} ${styles.overviewHero}`} aria-label="Server">
        <GuildIcon name={guild.name} url={guild.iconUrl} large />
        <div style={{ minWidth: 0 }}>
          <h2>{guild.name}</h2>
          <p>{guild.memberCount !== null ? `${guild.memberCount.toLocaleString('en')} members · ` : ''}You are {ROLE_LABEL[guild.role]}</p>
        </div>
        <div className={styles.headPills}><span className={`${styles.pill} ${styles.pillGreen}`}>Connected to Cloudy</span></div>
      </section>

      {context.missingPermissions.length ? (
        <div className={styles.notice} role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div><strong>Cloudy is missing permissions here</strong>{context.missingPermissions.join(', ')}</div>
        </div>
      ) : null}

      <div className={styles.tiles}>
        <Suspense fallback={<StatusPlaceholder tile />}><BotStatusTile /></Suspense>
        <div className={`${styles.panel} ${styles.tile}`}>
          <span>Members</span>
          <strong>{guild.memberCount !== null ? guild.memberCount.toLocaleString('en') : '–'}</strong>
          <p>In {guild.name}</p>
        </div>
        <div className={`${styles.panel} ${styles.tile}`}>
          <span>Modules</span>
          <strong>{MODULES.length}</strong>
          <p>Every Cloudy feature for this server</p>
        </div>
      </div>

      <section className={styles.accessOverviewLinks} aria-label="Team and commands">
        <Link href={`/bot/${guild.id}/team` as Route} className={styles.accessOverviewLink} prefetch={false}>
          <span className={styles.moduleIcon}><UsersRound size={20} aria-hidden="true" /></span>
          <span><strong>Team &amp; access</strong><small>See dashboard permissions and configure existing staff roles.</small></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href={`/bot/${guild.id}/command-center` as Route} className={styles.accessOverviewLink} prefetch={false}>
          <span className={styles.moduleIcon}><TerminalSquare size={20} aria-hidden="true" /></span>
          <span><strong>Command center</strong><small>Browse website controls and Discord-first modules.</small></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section aria-label="Modules" className={styles.moduleGrid}>
        {MODULES.map(module => (
          <Link key={module.id} href={`/bot/${guild.id}/${module.id}` as Route} className={styles.moduleCard} prefetch={false}>
            <header><span className={styles.moduleIcon}><ModuleIcon name={module.icon} size={18} /></span><h3>{module.title}</h3></header>
            <p>{module.summary}</p>
            <footer><span className={styles.moduleGroup}>{GROUP_LABEL[module.group]}</span><ArrowRight size={16} aria-hidden="true" /></footer>
          </Link>
        ))}
      </section>
    </div>
  );
}
