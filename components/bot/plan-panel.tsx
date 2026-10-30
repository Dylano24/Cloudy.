'use client';

import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import type { Plan } from '@/lib/bot-dashboard/bot-api';
import { describePlan, formatPlanDate, PLAN_FEATURES, PLAN_NAME, PLAN_ORDER_URL, PLAN_TRIAL_DAYS, PRICE_LABEL } from '@/lib/bot-dashboard/plan';
import { useDashboard } from './dashboard-context';
import styles from './bot.module.css';

const TONE = { good: styles.pillGreen, neutral: '', warn: styles.pillAmber } as const;

export function PlanPanel() {
  const { plan, guild } = useDashboard();
  const info = describePlan(plan);
  const [ordering, setOrdering] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(guild.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.stack}>
      <section className={`${styles.panel} ${styles.card}`} aria-labelledby="plan-status">
        <header className={styles.cardHead}>
          <h2 id="plan-status">This server</h2>
          <p>{guild.name}</p>
        </header>
        <div className={styles.planStatus}>
          <span className={`${styles.pill} ${TONE[info.tone]}`}>{info.label}</span>
          <p>{info.text}</p>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.priceCard}`} aria-labelledby="plan-price">
        <div className={styles.priceHead}>
          <span className={styles.eyebrow}>{PLAN_NAME}</span>
          <h2 id="plan-price" className={styles.price}>{PRICE_LABEL.replace(' / month', '')}<small>/ month per server</small></h2>
          <p>{PLAN_TRIAL_DAYS} days free first. Every setting stays visible after the trial, so you can try changes before you buy.</p>
        </div>
        <ul className={styles.featureList}>
          {PLAN_FEATURES.map(feature => <li key={feature}><Check size={16} aria-hidden="true" /> {feature}</li>)}
        </ul>
        {plan.status === 'owner' ? (
          <p className={styles.muted} style={{ margin: 0, fontSize: 13 }}>You own Cloudy, so you never pay for your own servers.</p>
        ) : (
          <button type="button" className={styles.button} onClick={() => setOrdering(true)}>
            {plan.status === 'premium' ? 'Extend Premium' : 'Buy Premium'} · {PRICE_LABEL}
          </button>
        )}
      </section>

      {plan.status === 'owner' ? <OwnerTools defaultGuildId={guild.id} /> : null}

      {ordering ? (
        <div className={styles.dialogBackdrop} onClick={event => { if (event.target === event.currentTarget) setOrdering(false); }}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="order-title"
            onKeyDown={event => { if (event.key === 'Escape') setOrdering(false); }}>
            <h2 id="order-title">{PLAN_NAME} for {guild.name}</h2>
            <p>{PRICE_LABEL}. Order in the Cloudy Discord: open a ticket and paste your server ID. Premium is switched on for this server as soon as your payment is confirmed{plan.status === 'premium' && plan.until ? `, and added to the time you have left (until ${formatPlanDate(plan.until)})` : ''}.</p>
            <div className={styles.orderId}>
              <code>{guild.id}</code>
              <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => void copyId()}>
                {copied ? <CheckCircle2 size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy server ID'}
              </button>
            </div>
            <div className={styles.dialogActions}>
              <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => setOrdering(false)} autoFocus>Close</button>
              <a className={`${styles.button} ${styles.buttonSmall}`} href={PLAN_ORDER_URL} target="_blank" rel="noopener noreferrer">
                <SiDiscord size={15} aria-hidden="true" /> Order on Discord
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const MONTH_OPTIONS = [1, 3, 6, 12];

/** Only shown to Cloudy's owner. Cloudy checks the owner again before changing anything. */
function OwnerTools({ defaultGuildId }: { defaultGuildId: string }) {
  const { csrf } = useDashboard();
  const [guildId, setGuildId] = useState('');
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function submit(turnOff: boolean) {
    const target = guildId.trim();
    if (!/^\d{17,20}$/.test(target)) { setResult({ kind: 'error', text: 'Enter the server ID (17 to 20 digits).' }); return; }
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/bot/plans/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cloudy-csrf': csrf },
        body: JSON.stringify({ guildId: target, months: turnOff ? 0 : months }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string; guild?: { name: string }; plan?: Plan };
      if (response.ok && data.plan && data.guild) {
        setResult({ kind: 'ok', text: turnOff ? `Premium is off for ${data.guild.name}.` : `Premium is on for ${data.guild.name} until ${formatPlanDate(data.plan.until)}.` });
      } else {
        setResult({ kind: 'error', text: data.error || 'Cloudy could not change Premium.' });
      }
    } catch {
      setResult({ kind: 'error', text: 'No connection. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.card}`} aria-labelledby="owner-tools">
      <header className={styles.cardHead}>
        <h2 id="owner-tools">Owner: activate Premium</h2>
        <p>After a customer pays, switch Premium on for their server. Months are added to the time they have left.</p>
      </header>
      <div className={styles.ownerForm}>
        <label className={styles.fieldLabel} htmlFor="grant-guild">Server ID</label>
        <input id="grant-guild" className={styles.input} inputMode="numeric" autoComplete="off" placeholder={defaultGuildId}
          value={guildId} onChange={event => setGuildId(event.target.value.replace(/[^\d]/g, '').slice(0, 20))} disabled={busy} />
        <label className={styles.fieldLabel} htmlFor="grant-months">Months</label>
        <select id="grant-months" className={styles.select} value={months} onChange={event => setMonths(Number(event.target.value))} disabled={busy}>
          {MONTH_OPTIONS.map(option => <option key={option} value={option}>{option} {option === 1 ? 'month' : 'months'}</option>)}
        </select>
        <div className={styles.ownerActions}>
          <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => void submit(false)} disabled={busy}>
            {busy ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : null} Turn Premium on
          </button>
          <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => void submit(true)} disabled={busy}>Turn off</button>
        </div>
        {result ? (
          <p className={styles.ownerResult} data-kind={result.kind} role={result.kind === 'ok' ? 'status' : 'alert'}>
            {result.kind === 'ok' ? <CheckCircle2 size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />} {result.text}
          </p>
        ) : null}
      </div>
    </section>
  );
}
