import { Clock3 } from 'lucide-react';
import { getBotHealth } from '@/lib/bot-dashboard/bot-api';
import styles from './bot.module.css';

export function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return days + 'd ' + hours + 'h';
  if (hours > 0) return hours + 'h ' + minutes + 'm';
  return Math.max(1, minutes) + 'm';
}

/** Live health, sourced exclusively from Cloudy's public health endpoint. */
export async function BotStatusPill() {
  const health = await getBotHealth();
  const degraded = health.online && health.databaseOk === false;
  return (
    <div className={styles.healthRail} role="status" data-tone={!health.online ? 'unavailable' : degraded ? 'degraded' : 'healthy'}>
      <span className={styles.healthBeacon} aria-hidden="true"><span /></span>
      <span className={styles.healthHeadline}>
        <span className={styles.healthEyebrow}>CLOUDY · LIVE STATUS</span>
        <strong>{!health.online ? 'Status unavailable' : degraded ? 'Partial disruption' : 'All systems operational'}</strong>
      </span>
      <span className={styles.healthDetails}>
        <span className={styles.healthDescription}>{!health.online ? 'Unable to reach Cloudy' : degraded ? 'Database connection issue' : 'Cloudy is online'}</span>
        {health.online && health.uptimeSeconds !== null ? (
          <span className={styles.healthDuration}><Clock3 size={13} aria-hidden="true" /> {formatUptime(health.uptimeSeconds)} <span>uptime</span></span>
        ) : null}
      </span>
    </div>
  );
}

export async function BotStatusTile() {
  const health = await getBotHealth();
  return (
    <div className={styles.panel + ' ' + styles.tile}>
      <span>Cloudy</span>
      <strong>{health.online ? 'Online' : 'Unavailable'}</strong>
      <p>
        {health.online
          ? 'Up ' + (health.uptimeSeconds !== null ? formatUptime(health.uptimeSeconds) : '—') + (health.databaseOk === false ? ' · database degraded' : '') + (health.version ? ' · build ' + health.version : '')
          : 'The public health check did not answer from this website.'}
      </p>
    </div>
  );
}

export function StatusPlaceholder({ tile = false }: { tile?: boolean }) {
  if (tile) {
    return (
      <div className={styles.panel + ' ' + styles.tile} aria-busy="true">
        <span>Cloudy</span><strong>Checking…</strong><p>Asking Cloudy for its status.</p>
      </div>
    );
  }
  return (
    <div className={styles.healthRail} data-tone="checking" aria-busy="true">
      <span className={styles.healthBeacon} aria-hidden="true"><span /></span>
      <span className={styles.healthHeadline}><span className={styles.healthEyebrow}>CLOUDY · LIVE STATUS</span><strong>Checking connection…</strong></span>
    </div>
  );
}
