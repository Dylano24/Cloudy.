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
    <div className={styles.healthCard} role="status">
      <span className={styles.healthIcon} data-status={!health.online ? 'unknown' : degraded ? 'degraded' : 'online'}>
        <span />
      </span>
      <span className={styles.healthCopy}>
        <strong>{!health.online ? 'Status unavailable' : degraded ? 'Cloudy is online' : 'Cloudy is operational'}</strong>
        <small>{!health.online ? 'Health check could not confirm the connection' : degraded ? 'Database connection requires attention' : 'Discord bot connected'}</small>
      </span>
      {health.online && health.uptimeSeconds !== null ? (
        <span className={styles.healthUptime}><small>UPTIME</small><strong>{formatUptime(health.uptimeSeconds)}</strong></span>
      ) : null}
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
    <div className={styles.healthCard} aria-busy="true">
      <span className={styles.healthIcon} data-status="unknown"><span /></span>
      <span className={styles.healthCopy}><strong>Checking Cloudy</strong><small>Retrieving live bot status</small></span>
    </div>
  );
}
