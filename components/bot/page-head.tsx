import Link from 'next/link';
import type { Route } from 'next';
import { AlertTriangle, ChevronRight, Info } from 'lucide-react';
import styles from './bot.module.css';

export function PageHead({ guildId, guildName, title, summary, crumb }: {
  guildId: string; guildName: string; title: string; summary: string; crumb?: string;
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
    </header>
  );
}

export function ModuleNote({ text }: { text: string }) {
  return (
    <div className={`${styles.notice} ${styles.noticeNeutral}`} role="note">
      <Info size={18} aria-hidden="true" />
      <div>{text}</div>
    </div>
  );
}

export function LoadError({ text }: { text: string }) {
  return (
    <div className={styles.notice} role="alert">
      <AlertTriangle size={18} aria-hidden="true" />
      <div><strong>Cloudy did not answer</strong>{text}</div>
    </div>
  );
}
