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
  const tone = !health.online ? 'unavailable' : health.databaseOk === false ? 'degraded' : 'healthy';
  const label = !health.online
    ? 'Cloudy status unavailable'
    : health.databaseOk === false
      ? 'Cloudy is online with a database issue'
      : 'Cloudy is online and operational';
  return <span className={styles.healthSingleDot} data-tone={tone} role="status" aria-label={label} title={label} />;
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
  return <span className={styles.healthSingleDot} data-tone="checking" role="status" aria-label="Checking Cloudy status" aria-busy="true" />;
}
