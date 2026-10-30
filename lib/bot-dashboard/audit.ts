import { randomUUID } from 'node:crypto';

// One structured line per dashboard change attempt, kept in Vercel's runtime
// logs. Only setting names are logged, never their values (messages can hold
// private text). Cloudy's Dashboard API keeps the durable per-server history.
export type AuditEvent = {
  actor: string;
  guild: string;
  module: string;
  action: 'update' | 'action' | 'login' | 'logout';
  keys?: string[];
  outcome: 'ok' | 'rejected' | 'failed';
  reason?: string;
};

export function auditDashboard(event: AuditEvent) {
  const entry = { type: 'cloudy-bot-dashboard-audit', id: randomUUID(), at: new Date().toISOString(), ...event, keys: event.keys?.slice(0, 80) };
  console.info(JSON.stringify(entry));
  return entry.id;
}
