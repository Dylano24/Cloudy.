import { notFound } from 'next/navigation';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { getModule, MODULE_IDS } from '@/lib/bot-dashboard/modules';
import { botApi } from '@/lib/bot-dashboard/bot-api';
import { DEMO_VALUES } from '@/lib/bot-dashboard/demo';
import { ModuleEditor } from '@/components/bot/module-editor';
import { ModeNotice, ModuleNote, PageHead, ReadinessPill } from '@/components/bot/page-head';
import styles from '@/components/bot/bot.module.css';

type Props = { params: Promise<{ guildId: string; module: string }> };

export async function generateMetadata({ params }: Props) {
  const { module: moduleId } = await params;
  const mod = getModule(moduleId);
  return { title: mod ? `${mod.title} | Cloudy Bot` : 'Cloudy Bot', robots: { index: false, follow: false } };
}

export default async function ModulePage({ params }: Props) {
  const { guildId, module: moduleId } = await params;
  if (!MODULE_IDS.includes(moduleId)) notFound();
  const mod = getModule(moduleId)!;
  const context = await loadGuildContext(guildId);
  if (context.kind !== 'ok' && context.kind !== 'demo') return null;

  let mode = context.kind === 'demo' ? 'demo' as const : context.mode;
  let botError = context.kind === 'ok' && context.botError;
  let initial: { values: Record<string, unknown>; revision: string } | null = null;

  if (mod.sections.length) {
    if (context.kind === 'demo') {
      initial = { values: structuredClone(DEMO_VALUES[mod.id] || {}), revision: 'demo' };
    } else if (mode === 'live') {
      try {
        initial = await botApi.module(context.session.uid, context.guild.id, mod.id);
      } catch {
        mode = 'unlinked';
        botError = true;
      }
    }
  }

  return (
    <div className={styles.stack}>
      <PageHead guildId={context.guild.id} guildName={context.guild.name} crumb={mod.title} title={mod.title} summary={mod.summary}
        pills={<ReadinessPill readiness={mod.readiness} mode={mode} />} />
      {mod.sections.length ? <ModeNotice mode={mode} botError={botError} /> : null}
      {mod.note ? <ModuleNote text={mod.note} /> : null}
      {mod.access === 'owner-role' ? <ModuleNote text="Only members with the Owner role in this server can save these settings. Cloudy checks this itself." /> : null}

      {mod.sections.length ? (
        <ModuleEditor key={`${context.guild.id}-${mod.id}`} module={mod} initial={initial} />
      ) : (
        <section className={`${styles.panel} ${styles.readonlyCard}`} aria-label="Technical details">
          <strong style={{ fontSize: 15, fontWeight: 600 }}>What the dashboard needs here</strong>
          <p className={`${styles.small} ${styles.muted}`} style={{ margin: 0 }}>
            {mod.readiness === 'needs-bot-change'
              ? 'Cloudy does not store these settings per server yet. After an approved bot update they appear here with the same controls as the other modules.'
              : 'This module is shown read-only first, so posted Discord messages keep their exact identity. The listing arrives with the Dashboard API.'}
          </p>
          <dl>
            <dt>Stored in</dt><dd>{mod.storage}</dd>
            <dt>Bot code</dt><dd>{mod.service}</dd>
          </dl>
        </section>
      )}
    </div>
  );
}
