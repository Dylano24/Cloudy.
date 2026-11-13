'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import { useDialogBehavior } from '@/hooks/use-dialog-behavior';
import { actionsFor, STATUS_LABEL, type Delivery, type DeliveryAction, type DeliveryOverview, type DeliveryStatus } from '@/lib/delivery-admin';
import styles from './delivery-admin.module.css';

const TONE: Record<DeliveryStatus, 'good' | 'warn' | 'bad' | 'info' | 'muted'> = {
  delivered: 'good', queued: 'info', delivering: 'info', awaiting_verification: 'info', needs_review: 'warn', failed: 'bad', cancelled: 'muted', refunded_after_delivery: 'warn',
};
const ACTION_LABEL: Record<DeliveryAction, string> = { retry: 'Retry', cancel: 'Cancel', 'mark-delivered': 'Mark delivered' };
const ACTION_HELP: Record<DeliveryAction, string> = {
  retry: 'Cloudy sends the kit again on the next run. Check in game first that the player did not receive it.',
  cancel: 'The kit will not be delivered. Refund the customer in Tip4Serv if needed.',
  'mark-delivered': 'Confirm that you checked in game and the player has the kit.',
};
const FILTERS: (DeliveryStatus | 'all')[] = ['all', 'needs_review', 'failed', 'awaiting_verification', 'queued', 'delivered', 'refunded_after_delivery', 'cancelled'];
const time = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' });
const when = (value?: string) => { const ms = Date.parse(value || ''); return Number.isFinite(ms) ? time.format(ms) : '—'; };

class LoadError extends Error { constructor(message: string, readonly status: number) { super(message); } }

async function load(status: DeliveryStatus | 'all'): Promise<DeliveryOverview> {
  const response = await fetch(`/api/admin/deliveries${status === 'all' ? '' : `?status=${status}`}`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({})) as DeliveryOverview & { error?: string };
  if (!response.ok) throw new LoadError(data.error || 'Cloudy could not load the deliveries.', response.status);
  return data;
}

export function DeliveryAdmin() {
  const [filter, setFilter] = useState<DeliveryStatus | 'all'>('all');
  const queryClient = useQueryClient();
  const { data, error, isPending, isFetching, refetch } = useQuery({ queryKey: ['admin', 'deliveries', filter], queryFn: () => load(filter), refetchInterval: 30_000, retry: false });
  const [confirm, setConfirm] = useState<{ delivery: Delivery; action: DeliveryAction } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { if (!busy) setConfirm(null); }, [busy]);
  useDialogBehavior(Boolean(confirm), close, dialogRef);

  async function run() {
    if (!confirm) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch(`/api/admin/deliveries/${confirm.delivery.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: confirm.action }) });
      const body = await response.json().catch(() => ({})) as { delivery?: Delivery; error?: string };
      if (!response.ok || !body.delivery) throw new Error(body.error || 'Cloudy could not change this delivery.');
      setResult({ tone: 'good', text: `${confirm.delivery.kit} for ${confirm.delivery.gamertag}: ${STATUS_LABEL[body.delivery.status]}.` });
      setConfirm(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'deliveries'] });
    } catch (failure) {
      setResult({ tone: 'bad', text: failure instanceof Error ? failure.message : 'Cloudy could not change this delivery.' });
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <div>
          <span className="cloudy-label">Cloudy · Staff</span>
          <h1 className="cloudy-title">Kit deliveries</h1>
          <p className="cloudy-copy">Rust Console kits bought on Cloudy Store. Cloudy delivers each kit once; anything it could not confirm waits here for you.</p>
        </div>
        {data ? (
          <div className={styles.mode} aria-label="Delivery status">
            <span className={styles.pill} data-tone={data.mode === 'live' ? 'good' : data.mode === 'mock' ? 'info' : 'muted'}>{data.mode === 'live' ? 'Live delivery' : data.mode === 'mock' ? 'Test mode (no real server)' : 'Delivery switched off'}</span>
            {data.servers.length ? <span className={styles.pill} data-tone="muted">{data.servers.length} {data.servers.length === 1 ? 'server' : 'servers'}: {data.servers.join(', ')}</span> : null}
            {data.requireVerification ? <span className={styles.pill} data-tone="muted">Gamertag check on</span> : null}
          </div>
        ) : null}
      </header>

      {error ? (
        <section className={`${styles.panel} ${styles.notice}`} data-tone="bad" role="alert">
          <h2 className="cloudy-card-title">{(error as LoadError).status === 401 ? 'Sign in to continue' : (error as LoadError).status === 403 ? 'No access' : 'Deliveries could not be loaded'}</h2>
          <p className="cloudy-copy">{error.message}</p>
          <div className={styles.actions}>
            {(error as LoadError).status === 401 ? <Link href="/account" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }}>Sign in</Link> : <button type="button" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }} onClick={() => void refetch()}>Try again</button>}
          </div>
        </section>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.filters} role="group" aria-label="Filter by status">
              {FILTERS.map(option => (
                <button key={option} type="button" className={styles.filter} aria-pressed={filter === option} onClick={() => setFilter(option)}>
                  {option === 'all' ? 'All' : STATUS_LABEL[option]}
                  <b>{option === 'all' ? Object.values(data?.counts || {}).reduce((sum, n) => sum + (n || 0), 0) : data?.counts?.[option] || 0}</b>
                </button>
              ))}
            </div>
            <button type="button" className={styles.action} onClick={() => void refetch()} disabled={isFetching} aria-busy={isFetching}>
              {isFetching ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={13} aria-hidden="true" />} Refresh
            </button>
          </div>
          {result ? <p className={`${styles.status} cloudy-copy`} role="status" style={{ color: result.tone === 'good' ? '#4fe0a9' : '#ff8a98' }}>{result.text}</p> : null}

          <section className={styles.panel} aria-label="Deliveries">
            {isPending ? (
              <div className={styles.empty} aria-busy="true"><Loader2 size={18} className="animate-spin" aria-hidden="true" /><p className="cloudy-copy">Loading deliveries…</p></div>
            ) : data?.mode === 'off' ? (
              <div className={styles.empty}><h2 className="cloudy-card-title">Kit delivery is switched off</h2><p className="cloudy-copy">No kits are sold or delivered until it is turned on in Cloudy (RUST_CONSOLE_FULFILLMENT) and real-money kit sales are approved.</p></div>
            ) : !data?.deliveries.length ? (
              <div className={styles.empty}><h2 className="cloudy-card-title">Nothing here</h2><p className="cloudy-copy">No deliveries with this status.</p></div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th scope="col">Bought</th><th scope="col">Player</th><th scope="col">Kit</th><th scope="col">Server</th><th scope="col">Status</th><th scope="col">Attempts</th><th scope="col">Last problem</th><th scope="col">Actions</th></tr></thead>
                  <tbody>
                    {data.deliveries.map(delivery => (
                      <tr key={delivery.id}>
                        <td className={styles.num}>{when(delivery.createdAt)}{delivery.paymentMode === 'test' ? <div className={styles.muted}>Test payment</div> : null}</td>
                        <td><div className={styles.player}><strong>{delivery.gamertag}</strong><small>{delivery.platform === 'xbox' ? 'Xbox' : 'PlayStation'}</small></div></td>
                        <td>{delivery.label || delivery.kit}<div className={styles.muted}>{delivery.kit}</div></td>
                        <td>{delivery.server}</td>
                        <td>
                          <span className={styles.pill} data-tone={TONE[delivery.status]}>{STATUS_LABEL[delivery.status]}</span>
                          {delivery.waitingForPlayer ? <div className={styles.muted}>Waiting for the player to come online</div> : null}
                          {delivery.history?.length ? (
                            <details className={styles.history}>
                              <summary>History</summary>
                              <ol>{delivery.history.map((entry, index) => <li key={index}>{when(entry.at)} · {STATUS_LABEL[entry.status as DeliveryStatus] || entry.status}{entry.note ? ` · ${entry.note}` : ''}</li>)}</ol>
                            </details>
                          ) : null}
                        </td>
                        <td className={styles.num}>{delivery.attempts}</td>
                        <td>{delivery.lastError ? <span className={styles.error}>{delivery.lastError}</span> : <span className={styles.muted}>—</span>}</td>
                        <td>
                          <div className={styles.actions}>
                            {actionsFor(delivery.status).map((action, index) => (
                              <button key={action} type="button" className={styles.action} data-kind={index === 0 ? 'primary' : undefined} onClick={() => setConfirm({ delivery, action })}>{ACTION_LABEL[action]}</button>
                            ))}
                            {!actionsFor(delivery.status).length ? <span className={styles.muted}>—</span> : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <p className="cloudy-copy" style={{ opacity: .85 }}>Statuses refresh every 30 seconds. Every action is checked by Cloudy and written to its audit log.</p>
        </>
      )}

      {confirm ? (
        <div className={styles.backdrop} onClick={event => { if (event.target === event.currentTarget) close(); }}>
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delivery-confirm-title" aria-describedby="delivery-confirm-text" tabIndex={-1}>
            <h2 id="delivery-confirm-title" className="cloudy-card-title">{ACTION_LABEL[confirm.action]}: {confirm.delivery.kit} for {confirm.delivery.gamertag}?</h2>
            <p id="delivery-confirm-text" className="cloudy-copy">{ACTION_HELP[confirm.action]}</p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.action} onClick={close} disabled={busy} data-autofocus>Keep as is</button>
              <button type="button" className={styles.action} data-kind="primary" onClick={() => void run()} disabled={busy} aria-busy={busy}>
                {busy ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : null} {ACTION_LABEL[confirm.action]}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

