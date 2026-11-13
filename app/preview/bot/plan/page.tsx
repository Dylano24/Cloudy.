import { PageHead } from '@/components/bot/page-head';
import { PlanPanel } from '@/components/bot/plan-panel';
import { DEMO_BASE, DEMO_GUILD } from '@/lib/bot-dashboard/demo';
import styles from '@/components/bot/bot.module.css';

export default function DemoPlanPage() {
  return (
    <div className={styles.stack}>
      <PageHead guildId={DEMO_GUILD.id} guildName={DEMO_GUILD.name} base={DEMO_BASE} crumb="Plan" title="Plan" summary="Cloudy Bot Premium for this server." />
      <PlanPanel checkout={null} />
    </div>
  );
}
