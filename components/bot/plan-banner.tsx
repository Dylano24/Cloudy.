'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Gem } from 'lucide-react';
import { describePlan, PRICE_LABEL } from '@/lib/bot-dashboard/plan';
import { useDashboard } from './dashboard-context';
import styles from './bot.module.css';

const PILL_TONE = { good: styles.pillGreen, neutral: '', warn: styles.pillAmber } as const;

/** Small plan label next to "Plan" in the sidebar. */
export function PlanNavPill() {
  const { plan } = useDashboard();
  const short = plan.status === 'owner' ? 'Owner' : plan.status === 'premium' ? 'Premium' : plan.status === 'expired' ? 'Locked' : 'Trial';
  return <span className={styles.navPlan} data-tone={describePlan(plan).tone}>{short}</span>;
}

/** Plan strip shown on the overview and on every module page. */
export function PlanBanner() {
  const { plan, guild } = useDashboard();
  const info = describePlan(plan);
  if (plan.status === 'owner' || plan.status === 'premium') return null;
  return (
    <div className={`${styles.panel} ${styles.planStrip}`} data-tone={info.tone}>
      <Gem size={18} aria-hidden="true" />
      <div>
        <span className={`${styles.pill} ${PILL_TONE[info.tone]}`}>{info.label}</span>
        <p>{info.text}</p>
      </div>
      <Link href={`/bot/${guild.id}/plan` as Route} className={`${styles.button} ${styles.buttonSmall}`}>
        Get Premium · {PRICE_LABEL}
      </Link>
    </div>
  );
}
