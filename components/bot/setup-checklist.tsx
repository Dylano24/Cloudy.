import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight, Check } from 'lucide-react';
import type { SetupStep } from '@/lib/bot-dashboard/setup';
import styles from './bot.module.css';

/** "Set up Cloudy" steps on a server's overview, with real state from Cloudy. */
export function SetupChecklist({ steps }: { steps: SetupStep[] }) {
  const done = steps.filter(step => step.done).length;
  const complete = done === steps.length;
  return (
    <section className={`${styles.panel} ${styles.setup}`} aria-labelledby="setup-title">
      <header className={styles.setupHead}>
        <div>
          <h2 id="setup-title" className="cloudy-card-title">{complete ? 'Cloudy is set up' : 'Set up Cloudy'}</h2>
          <p className="cloudy-copy">{complete ? 'Every essential step is done. Fine-tune any module below.' : 'A few steps and Cloudy runs this server for you.'}</p>
        </div>
        <span className={styles.setupCount} aria-label={`${done} of ${steps.length} steps done`}><b>{done}</b>/{steps.length}</span>
      </header>
      <div className={styles.setupBar} role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label="Setup progress"><span style={{ width: `${(done / steps.length) * 100}%` }} /></div>
      <ol className={styles.setupList}>
        {steps.map(step => (
          <li key={step.id} className={styles.setupStep} data-done={step.done}>
            <span className={styles.setupMark} aria-hidden="true">{step.done ? <Check size={14} strokeWidth={3} /> : null}</span>
            <div className={styles.setupText}>
              <strong>{step.title}<span className="sr-only">{step.done ? ' (done)' : ' (to do)'}</span></strong>
              <p>{step.text}</p>
            </div>
            {step.href && step.action ? (
              step.external
                ? <a className={`${step.done ? styles.buttonGhost : styles.button} ${styles.buttonSmall}`} href={step.href} target="_blank" rel="noopener noreferrer">{step.action}</a>
                : <Link className={`${step.done ? styles.buttonGhost : styles.button} ${styles.buttonSmall}`} href={step.href as Route} prefetch={false}>{step.action} <ArrowRight size={14} aria-hidden="true" /></Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
