'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, CreditCard, Loader2 } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import type { Plan } from '@/lib/bot-dashboard/bot-api';
import { describePlan, formatPlanDate, PLAN_FEATURES, PLAN_NAME, PLAN_ORDER_URL, PLAN_TRIAL_DAYS, PRICE_LABEL, type PremiumCheckout } from '@/lib/bot-dashboard/plan';
import { openTip4ServCheckout, Tip4ServError } from '@/lib/tip4serv';
import { useDialogBehavior } from '@/hooks/use-dialog-behavior';
import { useDashboard } from './dashboard-context';
import styles from './bot.module.css';

const TONE = { good: styles.pillGreen, neutral: '', warn: styles.pillAmber } as const;
const ACTIVATION_POLL_MS = 4_000;
const ACTIVATION_WAIT_MS = 180_000;

type Activation = 'idle' | 'waiting' | 'done' | 'late';

/** After a payment: asks Cloudy for the plan until the payment shows as Premium. */
function useActivation(guildId: string, plan: Plan, setPlan: (plan: Plan) => void) {
  const [state, setState] = useState<Activation>('idle');
  const baseline = useRef<string | null>(null);
  const start = useCallback(() => {
    baseline.current = plan.status === 'premium' ? plan.until : null;
    setState('waiting');
  }, [plan.status, plan.until]);

  useEffect(() => {
    // Back from the Tip4Serv payment page.
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('paid') !== '1') return;
    url.searchParams.delete('paid');
    window.history.replaceState(null, '', url.toString());
    const timer = window.setTimeout(start, 0);
    return () => window.clearTimeout(timer);
    // Only on the first render after the redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== 'waiting') return;
    const startedAt = Date.now();
    let stopped = false;
    let timer = 0;
    const poll = async () => {
      try {
        const response = await fetch(`/api/bot/guilds/${guildId}/plan`, { cache: 'no-store' });
        const data = await response.json().catch(() => null) as { plan?: Plan | null } | null;
        const next = data?.plan;
        if (!stopped && next && next.status === 'premium' && next.until !== baseline.current) {
          setPlan(next);
          setState('done');
          return;
        }
      } catch { /* keep waiting */ }
      if (stopped) return;
      if (Date.now() - startedAt > ACTIVATION_WAIT_MS) { setState('late'); return; }
      timer = window.setTimeout(() => { void poll(); }, ACTIVATION_POLL_MS);
    };
    timer = window.setTimeout(() => { void poll(); }, 1_500);
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [state, guildId, setPlan]);

  return { activation: state, startActivation: start };
}

export function PlanPanel({ checkout = null }: { checkout?: PremiumCheckout | null }) {
  const { plan, guild, setPlan } = useDashboard();
  const info = describePlan(plan);
  const [ordering, setOrdering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const { activation, startActivation } = useActivation(guild.id, plan, setPlan);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeOrder = useCallback(() => setOrdering(false), []);
  useDialogBehavior(ordering, closeOrder, dialogRef);

  async function pay() {
    if (!checkout || paying) return;
    setPaying(true);
    setPayError('');
    const here = `${window.location.origin}/bot/${guild.id}/plan`;
    try {
      await openTip4ServCheckout({
        product: checkout.product,
        subscription: checkout.subscription,
        customFields: { [checkout.guildFieldId]: guild.id },
        successUrl: `${here}?paid=1`,
        cancelUrl: here,
      });
      setOrdering(false);
      startActivation();
    } catch (error) {
      if (!(error instanceof Error && error.message === 'Checkout cancelled')) {
        setPayError(error instanceof Tip4ServError || error instanceof Error ? error.message : 'The checkout could not be opened. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  }

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
        {activation !== 'idle' ? (
          <p className={styles.ownerResult} data-kind={activation === 'late' ? 'error' : 'ok'} role="status" aria-live="polite">
            {activation === 'waiting' ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : activation === 'done' ? <CheckCircle2 size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}
            {' '}{activation === 'waiting' ? 'Payment received. Cloudy is activating Premium for this server…'
              : activation === 'done' ? `Premium is active for ${guild.name}.`
              : 'Your payment is confirmed, but Premium is not showing yet. It can take a few minutes. If it does not appear, open a ticket in the Cloudy Discord with your server ID.'}
          </p>
        ) : null}
        {plan.renews && checkout?.manageUrl ? (
          <a className={`${styles.buttonGhost} ${styles.buttonSmall}`} href={checkout.manageUrl} target="_blank" rel="noopener noreferrer">Manage subscription</a>
        ) : null}
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
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="order-title" tabIndex={-1}>
            <h2 id="order-title">{PLAN_NAME} for {guild.name}</h2>
            {checkout ? (
              <p>{PRICE_LABEL}, paid securely on Cloudy Store. Premium is switched on for this server automatically as soon as your payment is confirmed{plan.status === 'premium' && plan.until ? `, and added to the time you have left (until ${formatPlanDate(plan.until)})` : ''}.</p>
            ) : (
              <p>{PRICE_LABEL}. Order in the Cloudy Discord: open a ticket and paste your server ID. Premium is switched on for this server as soon as your payment is confirmed{plan.status === 'premium' && plan.until ? `, and added to the time you have left (until ${formatPlanDate(plan.until)})` : ''}.</p>
            )}
            <div className={styles.orderId}>
              <code>{guild.id}</code>
              <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => void copyId()}>
                {copied ? <CheckCircle2 size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy server ID'}
              </button>
            </div>
            {payError ? <p className={styles.ownerResult} data-kind="error" role="alert"><AlertTriangle size={15} aria-hidden="true" /> {payError}</p> : null}
            <div className={styles.dialogActions}>
              <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => setOrdering(false)} autoFocus>Close</button>
              <a className={`${checkout ? styles.buttonGhost : styles.button} ${styles.buttonSmall}`} href={PLAN_ORDER_URL} target="_blank" rel="noopener noreferrer">
                <SiDiscord size={15} aria-hidden="true" /> Order on Discord
              </a>
              {checkout ? (
                <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => void pay()} disabled={paying} aria-busy={paying}>
                  {paying ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : <CreditCard size={15} aria-hidden="true" />} Pay now
                </button>
              ) : null}
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
