import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Info, Settings2, ShieldCheck, TerminalSquare } from 'lucide-react';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { ModuleIcon } from '@/components/bot/module-icon';
import { PageHead } from '@/components/bot/page-head';
import styles from '@/components/bot/bot.module.css';

export const metadata: Metadata = { title: 'Command center | Cloudy Bot', robots: { index: false, follow: false } };

const groupName = Object.fromEntries(GROUPS.map(group => [group.id, group.label]));
const settings = MODULES.filter(module => module.kind === 'settings');
const insights = MODULES.filter(module => module.kind === 'insight');

export default async function CommandCenter({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);
  if (context.kind !== 'ok') return null;
  const base = `/bot/${context.guild.id}`;

  return (
    <div className={styles.stack}>
      <PageHead
        guildId={context.guild.id}
        guildName={context.guild.name}
        crumb="Command center"
        title="Command center"
        summary="Explore Cloudy's website controls and Discord-first modules. No new slash commands are registered from this page."
      />

      <section className={styles.accessHero} aria-label="Command management">
        <span className={styles.accessHeroIcon}><TerminalSquare size={28} aria-hidden="true" /></span>
        <div>
          <span className={styles.accessEyebrow}>SERVER COMMANDS</span>
          <h2>One place to configure.</h2>
          <p>Open the existing command categories editor to enable or disable categories for this server. Discord slash commands remain managed by Cloudy's bot.</p>
        </div>
        <Link className={styles.button} href={`${base}/commands` as Route}>Manage categories <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <div className={styles.accessSummaryGrid}>
        <div className={styles.panel + ' ' + styles.accessMetric}><span>Website settings</span><strong>{settings.length}</strong><p>Configurable modules listed in the existing dashboard</p></div>
        <div className={styles.panel + ' ' + styles.accessMetric}><span>Discord-first modules</span><strong>{insights.length}</strong><p>Read-only live overviews provided by the bot</p></div>
      </div>

      <section className={styles.panel + ' ' + styles.accessSection} aria-labelledby="command-settings">
        <div className={styles.accessSectionHead}>
          <span className={styles.accessSectionIcon}><Settings2 size={20} aria-hidden="true" /></span>
          <div><h2 id="command-settings">Website configuration</h2><p>These are existing dashboard editors. A save requires the live bot API and appropriate permissions.</p></div>
        </div>
        <div className={styles.accessModuleGrid}>
          {settings.map(module => (
            <Link key={module.id} className={styles.accessModule} href={`${base}/${module.id}` as Route} prefetch={false}>
              <span className={styles.accessModuleIcon}><ModuleIcon name={module.icon} size={18} /></span>
              <span><strong>{module.title}</strong><small>{groupName[module.group]}</small></span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.panel + ' ' + styles.accessSection} aria-labelledby="command-insights">
        <div className={styles.accessSectionHead}>
          <span className={styles.accessSectionIcon}><Code2 size={20} aria-hidden="true" /></span>
          <div><h2 id="command-insights">Discord-first tools</h2><p>Cloudy handles these in Discord. The website displays available insight data, not editable replacements for the Discord interactions.</p></div>
        </div>
        <div className={styles.accessModuleGrid}>
          {insights.map(module => (
            <Link key={module.id} className={styles.accessModule} href={`${base}/${module.id}` as Route} prefetch={false}>
              <span className={styles.accessModuleIcon}><ModuleIcon name={module.icon} size={18} /></span>
              <span><strong>{module.title}</strong><small>Live overview</small></span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.accessUpcoming} aria-label="Slash command integration status">
        <Info size={20} aria-hidden="true" />
        <div>
          <strong>Slash commands are not created by this website.</strong>
          <p>Cloudy's current command category configuration is available above. Adding a missing slash command, connecting a new web action, or changing how a bot command works requires a separate bot update and tests later. This page does not claim that any missing command is already installed.</p>
        </div>
      </section>

      <div className={styles.accessFooter}><ShieldCheck size={15} aria-hidden="true" /> Discord permissions and the bot's own validation continue to apply to every save.</div>
    </div>
  );
}
