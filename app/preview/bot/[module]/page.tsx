import { notFound } from 'next/navigation';
import { getModule, MODULE_IDS } from '@/lib/bot-dashboard/modules';
import { DEMO_BASE, DEMO_GUILD, demoInsight, demoValues } from '@/lib/bot-dashboard/demo';
import { ModuleEditor } from '@/components/bot/module-editor';
import { InsightView } from '@/components/bot/insight-view';
import { ModuleNote, PageHead } from '@/components/bot/page-head';
import { PlanBanner } from '@/components/bot/plan-banner';
import styles from '@/components/bot/bot.module.css';

type Props = { params: Promise<{ module: string }> };

export default async function DemoModulePage({ params }: Props) {
  const { module: moduleId } = await params;
  if (!MODULE_IDS.includes(moduleId)) notFound();
  const mod = getModule(moduleId)!;
  const values = mod.kind === 'settings' ? demoValues(mod) : null;
  return (
    <div className={styles.stack}>
      <PageHead guildId={DEMO_GUILD.id} guildName={DEMO_GUILD.name} base={DEMO_BASE} crumb={mod.title} title={mod.title} summary={mod.summary} />
      {mod.kind === 'settings' ? <PlanBanner /> : null}
      {mod.note ? <ModuleNote text={mod.note} /> : null}
      {values ? <ModuleEditor key={`demo-${mod.id}`} module={mod} initial={{ values, revision: `demo-${mod.id}` }} /> : <InsightView insight={demoInsight(mod)} />}
    </div>
  );
}
