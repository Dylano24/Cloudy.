import Link from 'next/link';
import type { Route } from 'next';
import { ChevronRight, FlaskConical, Info } from 'lucide-react';
import type { BotReadiness } from '@/lib/bot-dashboard/modules';
import { LockedNotice } from './module-editor';
import styles from './bot.module.css';

export type HeadMode = 'demo' | 'live' | 'unlinked';

export function ReadinessPill({ readiness, mode }: { readiness: BotReadiness; mode: HeadMode }) {
  if (readiness === 'needs-bot-change') return <span className={`${styles.pill} ${styles.pillAmber}`}>Needs a bot update</span>;
  if (readiness === 'read-only') return <span className={styles.pill}>Overview planned</span>;
  if (mode === 'unlinked') return <span className={styles.pill}>Ready once connected</span>;
  return <span className={`${styles.pill} ${styles.pillGreen}`}>{mode === 'demo' ? 'Editable in demo' : 'Live'}</span>;
}

export function PageHead({ guildId, guildName, title, summary, pills, crumb }: {
  guildId: string; guildName: string; title: string; summary: string; pills?: React.ReactNode; crumb?: string;
}) {
  return (
    <header className={styles.pageHead}>
      <div>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href={'/bot' as Route}>Servers</Link>
          <ChevronRight size={13} aria-hidden="true" />
          {crumb ? <><Link href={`/bot/${guildId}` as Route}>{guildName}</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{crumb}</span></> : <span aria-current="page">{guildName}</span>}
        </nav>
        <h1 className={`${styles.display} ${styles.pageTitle}`}>{title}</h1>
        <p className={styles.pageSummary}>{summary}</p>
      </div>
      {pills ? <div className={styles.headPills}>{pills}</div> : null}
    </header>
  );
}

export function ModeNotice({ mode, botError }: { mode: HeadMode; botError?: boolean }) {
  if (mode === 'demo') {
    return (
      <div className={styles.notice} role="note">
        <FlaskConical size={18} aria-hidden="true" />
        <div><strong>Demo mode</strong>Sample server and sample data. Changes stay in this browser tab and are never sent to Discord or Cloudy.</div>
      </div>
    );
  }
  if (mode === 'unlinked') return <LockedNotice reason={botError ? 'unavailable' : 'unlinked'} />;
  return null;
}

export function ModuleNote({ text }: { text: string }) {
  return (
    <div className={`${styles.notice} ${styles.noticeNeutral}`} role="note">
      <Info size={18} aria-hidden="true" />
      <div>{text}</div>
    </div>
  );
}
