import { BotApiError, signedBotCall } from './bot-dashboard/bot-api';
import type { EntitlementAction, EntitlementProblem } from './store-entitlements';

export type ActionOutcome = { type: EntitlementAction['type']; ref: string; status: 'applied' | 'rejected'; result?: string; code?: string };
export type DispatchResult =
  | { retry: false; outcomes: ActionOutcome[]; problems: EntitlementProblem[] }
  | { retry: true; outcomes: ActionOutcome[]; problems: EntitlementProblem[]; reason: string };

const ROUTES: Record<EntitlementAction['type'], string> = {
  premium: '/billing/premium',
  'rust-order': '/billing/rust/orders',
  'rust-refund': '/billing/rust/refunds',
};

function actorFor(action: EntitlementAction) {
  if (action.type === 'premium') return action.body.buyerDiscordId || action.body.guildId;
  if (action.type === 'rust-order' && action.body.discordId) return action.body.discordId;
  return null;
}

/**
 * Sends each action to Cloudy. Every action is idempotent on the bot, so a
 * retry of the whole webhook is always safe. Cloudy unreachable, starting or
 * without its database -> retry (Tip4Serv resends for up to four days). A
 * permanent refusal (invalid data, kit delivery off) -> no retry; the outcome
 * is stored for staff.
 */
export async function dispatchEntitlements(actions: EntitlementAction[], problems: EntitlementProblem[], { fallbackActor, call = signedBotCall }: { fallbackActor: string; call?: typeof signedBotCall }): Promise<DispatchResult> {
  const outcomes: ActionOutcome[] = [];
  for (const action of actions) {
    const ref = action.type === 'premium' ? action.body.eventKey : action.type === 'rust-order' ? action.body.orderKey : action.body.orderRef;
    try {
      const result = await call<{ result?: string }>('POST', ROUTES[action.type], actorFor(action) || fallbackActor, action.body);
      outcomes.push({ type: action.type, ref, status: 'applied', ...(typeof result?.result === 'string' ? { result: result.result } : {}) });
    } catch (error) {
      const status = error instanceof BotApiError ? error.status : 0;
      const code = error instanceof BotApiError ? error.code : 'unknown';
      // Invalid data (4xx) or kit delivery switched off: retrying cannot help, staff can see it.
      // Everything else (Cloudy offline or starting, rate limited, missing secret, 5xx) is retried.
      const permanent = code === 'not_enabled' || (status >= 400 && status < 500 && status !== 429);
      if (!permanent) return { retry: true, outcomes, problems, reason: code };
      outcomes.push({ type: action.type, ref, status: 'rejected', code });
    }
  }
  return { retry: false, outcomes, problems };
}
