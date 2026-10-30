import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { PageHead } from '@/components/bot/page-head';
import { PlanPanel } from '@/components/bot/plan-panel';
import styles from '@/components/bot/bot.module.css';

export const metadata = { title: 'Plan | Cloudy Bot', robots: { index: false, follow: false } };

export default async function PlanPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);
  if (context.kind !== 'ok') return null;
  return (
    <div className={styles.stack}>
      <PageHead guildId={context.guild.id} guildName={context.guild.name} crumb="Plan" title="Plan" summary="Cloudy Bot Premium for this server." />
      <PlanPanel />
    </div>
  );
}
