import type { Plan } from './bot-api';

// The "Set up Cloudy" checklist on a server's overview. Each step reads real
// state from Cloudy; a step Cloudy could not check shows as not done, never as
// done.

export type SetupStep = { id: 'invite' | 'permissions' | 'logs' | 'welcome' | 'plan'; title: string; text: string; done: boolean; href?: string; external?: boolean; action?: string };
export type SetupInput = {
  guildId: string;
  missingPermissions: string[];
  inviteUrl: string | null;
  logging: Record<string, unknown> | null;
  welcome: Record<string, unknown> | null;
  plan: Plan;
  /** Where this server's dashboard lives (default /bot/<server id>). */
  base?: string;
};

const isId = (value: unknown) => typeof value === 'string' && /^\d{17,20}$/.test(value);

export function setupSteps({ guildId, missingPermissions, inviteUrl, logging, welcome, plan, base: basePath }: SetupInput): SetupStep[] {
  const base = basePath || `/bot/${guildId}`;
  const hasLogs = Boolean(logging && ['logging.channels.audit', 'logging.channels.applications', 'logging.channels.reports'].some(key => isId(logging[key])));
  const hasWelcome = Boolean(welcome && welcome.enabled === true && isId(welcome.channelId));
  const planDone = plan.status === 'premium' || plan.status === 'owner';
  return [
    { id: 'invite', title: 'Add Cloudy to your server', text: 'Cloudy is in this server and connected to the dashboard.', done: true },
    {
      id: 'permissions', title: 'Give Cloudy the permissions it needs',
      text: missingPermissions.length ? `Missing: ${missingPermissions.join(', ')}. Add Cloudy again to update its role.` : 'Cloudy has every permission its features use.',
      done: missingPermissions.length === 0,
      ...(missingPermissions.length && inviteUrl ? { href: inviteUrl, external: true, action: 'Update permissions' } : {}),
    },
    { id: 'logs', title: 'Choose your log channels', text: hasLogs ? 'Cloudy logs moderation and reports in your chosen channels.' : 'Pick where Cloudy posts audit logs, applications and reports.', done: hasLogs, href: `${base}/logging`, action: hasLogs ? 'Edit logs' : 'Set up logs' },
    { id: 'welcome', title: 'Welcome new members', text: hasWelcome ? 'New members get your welcome message.' : 'Choose a welcome channel and message for new members.', done: hasWelcome, href: `${base}/welcome`, action: hasWelcome ? 'Edit welcome' : 'Set up welcome' },
    {
      id: 'plan', title: 'Get Cloudy Bot Premium',
      text: plan.status === 'premium' || plan.status === 'owner' ? 'Premium is active for this server.' : plan.status === 'trial' ? 'Saving works for a few more days. Get Premium to keep saving changes.' : plan.status === 'expired' ? 'Your Premium has ended. Get Premium to save changes again.' : 'Saving changes needs Cloudy Bot Premium, €13 per month per server.',
      done: planDone, href: `${base}/plan`, action: planDone ? 'View plan' : 'Get Premium',
    },
  ];
}
