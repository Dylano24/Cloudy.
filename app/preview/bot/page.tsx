import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight } from 'lucide-react';
import { GROUPS, MODULES, getModule } from '@/lib/bot-dashboard/modules';
import { DEMO_BASE, DEMO_GUILD, demoPlan, demoValues } from '@/lib/bot-dashboard/demo';
import { setupSteps } from '@/lib/bot-dashboard/setup';
import { GuildIcon } from '@/components/bot/guild-icon';
import { ModuleIcon } from '@/components/bot/module-icon';
import { PageHead } from '@/components/bot/page-head';
import { PlanBanner } from '@/components/bot/plan-banner';
import { SetupChecklist } from '@/components/bot/setup-checklist';
import styles from '@/components/bot/bot.module.css';

const GROUP_LABEL = Object.fromEntries(GROUPS.map(group => [group.id, group.label]));

export default function DemoOverview() {
  const logging = getModule('logging');
  const steps = setupSteps({
    guildId: DEMO_GUILD.id, base: DEMO_BASE, missingPermissions: [], inviteUrl: null,
    logging: logging ? demoValues(logging) : null,
    // Left open on purpose, so the demo shows a step that is still to do.
    welcome: {},
    plan: demoPlan(),
  });
  return (
    <div className={styles.stack}>
      <PageHead guildId={DEMO_GUILD.id} guildName={DEMO_GUILD.name} base={DEMO_BASE} title="Overview" summary="Everything Cloudy does on this server, at a glance." />
      <PlanBanner />
      <SetupChecklist steps={steps} />
      <section className={`${styles.panel} ${styles.overviewHero}`} aria-label="Server">
        <GuildIcon name={DEMO_GUILD.name} url={null} large />
        <div style={{ minWidth: 0 }}>
          <h2>{DEMO_GUILD.name}</h2>
          <p>{DEMO_GUILD.memberCount.toLocaleString('en')} members · You are Owner</p>
        </div>
        <div className={styles.headPills}><span className={`${styles.pill} ${styles.pillGreen}`}>Connected to Cloudy</span></div>
      </section>
      <div className={styles.tiles}>
        <div className={`${styles.panel} ${styles.tile}`}><span>Members</span><strong>{DEMO_GUILD.memberCount.toLocaleString('en')}</strong><p>In {DEMO_GUILD.name}</p></div>
        <div className={`${styles.panel} ${styles.tile}`}><span>Modules</span><strong>{MODULES.length}</strong><p>Every Cloudy feature for this server</p></div>
      </div>
      <section aria-label="Modules" className={styles.moduleGrid}>
        {MODULES.map(module => (
          <Link key={module.id} href={`${DEMO_BASE}/${module.id}` as Route} className={styles.moduleCard} prefetch={false}>
            <header><span className={styles.moduleIcon}><ModuleIcon name={module.icon} size={18} /></span><h3>{module.title}</h3></header>
            <p>{module.summary}</p>
            <footer><span className={styles.moduleGroup}>{GROUP_LABEL[module.group]}</span><ArrowRight size={16} aria-hidden="true" /></footer>
          </Link>
        ))}
      </section>
    </div>
  );
}
