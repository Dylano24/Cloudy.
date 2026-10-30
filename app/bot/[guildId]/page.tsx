import Link from 'next/link';
import type { Route } from 'next';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { GuildIcon } from '@/components/bot/guild-icon';
import { ModuleIcon } from '@/components/bot/module-icon';
import { BotStatusTile, StatusPlaceholder } from '@/components/bot/bot-status';
import { ModeNotice, PageHead, ReadinessPill } from '@/components/bot/page-head';
import styles from '@/components/bot/bot.module.css';

const ROLE_LABEL = { owner: 'Owner', administrator: 'Administrator', manager: 'Manage Server' } as const;

export default async function GuildOverview({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);
  if (context.kind !== 'ok' && context.kind !== 'demo') return null;

  const mode = context.kind === 'demo' ? 'demo' : context.mode;
  const guild = context.guild;
  const ready = MODULES.filter(module => module.readiness === 'service-ready').length;
  const pending = MODULES.length - ready;

  return (
    <div className={styles.stack}>
      <PageHead guildId={guild.id} guildName={guild.name} title="Overview" summary="Everything Cloudy does on this server, at a glance." />
      <ModeNotice mode={mode} botError={context.kind === 'ok' ? context.botError : false} />

      <section className={`${styles.panel} ${styles.overviewHero}`} aria-label="Server">
        <GuildIcon name={guild.name} url={guild.iconUrl} large />
        <div style={{ minWidth: 0 }}>
          <h2>{guild.name}</h2>
          <p>
            {guild.memberCount !== null ? `${guild.memberCount.toLocaleString('en')} members · ` : ''}
            {context.kind === 'ok' ? `You are ${ROLE_LABEL[context.guild.role]}` : 'Sample server'}
          </p>
        </div>
        <div className={styles.headPills}>
          {mode === 'live' ? <span className={`${styles.pill} ${styles.pillGreen}`}>Connected to Cloudy</span>
            : mode === 'demo' ? <span className={`${styles.pill} ${styles.pillRed}`}>Demo</span>
              : <span className={styles.pill}>Connection pending</span>}
        </div>
      </section>

      {context.kind === 'ok' && context.missingPermissions.length ? (
        <div className={styles.notice} role="alert">
          <ArrowRight size={18} aria-hidden="true" />
          <div><strong>Cloudy is missing permissions here</strong>{context.missingPermissions.join(', ')}</div>
        </div>
      ) : null}

      <div className={styles.tiles}>
        <Suspense fallback={<StatusPlaceholder tile />}><BotStatusTile /></Suspense>
        <div className={`${styles.panel} ${styles.tile}`}>
          <span>Dashboard link</span>
          <strong>{mode === 'live' ? 'Connected' : mode === 'demo' ? 'Demo' : 'Pending'}</strong>
          <p>{mode === 'live' ? 'Settings load from and save to Cloudy.' : mode === 'demo' ? 'Sample data in this browser tab only.' : 'Cloudy\'s Dashboard API is not switched on yet.'}</p>
        </div>
        <div className={`${styles.panel} ${styles.tile}`}>
          <span>Modules</span>
          <strong>{ready} / {MODULES.length}</strong>
          <p>{ready} ready for the dashboard · {pending} need a bot update or are view-only.</p>
        </div>
      </div>

      {GROUPS.map(group => {
        const modules = MODULES.filter(module => module.group === group.id);
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`} className={styles.stack} style={{ gap: 10 }}>
            <h2 id={`group-${group.id}`} className={styles.groupTitle}>{group.label}</h2>
            <div className={styles.moduleGrid}>
              {modules.map(module => (
                <Link key={module.id} href={`/bot/${guild.id}/${module.id}` as Route} className={styles.moduleCard} prefetch={false}>
                  <header><span className={styles.moduleIcon}><ModuleIcon name={module.icon} size={18} /></span><h3>{module.title}</h3></header>
                  <p>{module.summary}</p>
                  <footer><ReadinessPill readiness={module.readiness} mode={mode} /><ArrowRight size={16} aria-hidden="true" /></footer>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
