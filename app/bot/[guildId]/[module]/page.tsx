import { notFound } from 'next/navigation';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { getModule, MODULE_IDS } from '@/lib/bot-dashboard/modules';
import { botApi, BotApiError, type Insight, type ModuleSnapshot } from '@/lib/bot-dashboard/bot-api';
import { ModuleEditor } from '@/components/bot/module-editor';
import { InsightView } from '@/components/bot/insight-view';
import { LoadError, ModuleNote, PageHead } from '@/components/bot/page-head';
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
  if (context.kind !== 'ok') return null;

  let settings: ModuleSnapshot | null = null;
  let insight: Insight | null = null;
  let error: string | null = null;
  try {
    if (mod.kind === 'settings') settings = await botApi.module(context.session.uid, context.guild.id, mod.id);
    else insight = await botApi.insight(context.session.uid, context.guild.id, mod.id);
  } catch (caught) {
    error = caught instanceof BotApiError && caught.status === 403
      ? caught.message
      : 'Cloudy could not load this page right now. Nothing was changed; reload in a moment.';
  }

  return (
    <div className={styles.stack}>
      <PageHead guildId={context.guild.id} guildName={context.guild.name} crumb={mod.title} title={mod.title} summary={mod.summary} />
      {mod.note ? <ModuleNote text={mod.note} /> : null}
      {error ? <LoadError text={error} /> : null}
      {settings ? <ModuleEditor key={`${context.guild.id}-${mod.id}`} module={mod} initial={settings} /> : null}
      {insight ? <InsightView insight={insight} /> : null}
    </div>
  );
}
