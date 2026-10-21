import { z } from 'zod';
import { helpEntries, type HelpResult } from '@/components/help/cloudy-knowledge';
import type { AssistantReply } from '@/lib/cloudy-chat-context';
import { safeAssistantHref } from '@/lib/cloudy-message-format';

export type AssistantSessionMessage =
  | { role: 'visitor'; text: string }
  | { role: 'assistant'; result: HelpResult }
  | { role: 'assistant'; response: AssistantReply };
export type AssistantSession = { open?: boolean; question: string; messages: AssistantSessionMessage[]; activePhoneTopicId: string | null };
type TabStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const key = 'cloudy-assistant-session-v1';
const schema = z.object({
  version: z.literal(1), open: z.boolean().optional(), question: z.string().max(1000), activePhoneTopicId: z.string().max(100).nullable(),
  messages: z.array(z.union([
    z.object({ role: z.literal('visitor'), text: z.string().max(1000) }),
    z.object({ role: z.literal('assistant'), response: z.object({ answer: z.string().max(3500),
      links: z.array(z.object({ label: z.string().max(300), href: z.string().max(2000).refine(href => !!safeAssistantHref(href)) })).max(20),
      source: z.string().max(2000).optional() }) }),
    z.object({ role: z.literal('assistant'), result: z.object({ kind: z.enum(['answer', 'clarify', 'unknown']), entryIds: z.array(z.string().max(100)).max(10) }) }),
  ])).max(30),
});
function tabStorage(): TabStorage | undefined {
  try { return window.sessionStorage; } catch { return undefined; }
}

// Session storage belongs to this tab only. Closing the assistant keeps the
// conversation available; closing the tab ends the browser session.
export function readAssistantSession(storage = tabStorage()): AssistantSession | null {
  try {
    const raw = storage?.getItem(key);
    if (!raw || raw.length > 200_000) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { question, activePhoneTopicId } = parsed.data;
    const messages: AssistantSessionMessage[] = parsed.data.messages.map(message => {
      if ('result' in message) return { role: 'assistant', result: { kind: message.result.kind,
        entries: message.result.entryIds.flatMap(id => helpEntries.find(entry => entry.id === id) ?? []) } };
      return message;
    });
    return { ...(parsed.data.open !== undefined ? { open: parsed.data.open } : {}), question, messages, activePhoneTopicId };
  } catch { return null; }
}
export function saveAssistantSession(storage: TabStorage | undefined, session: AssistantSession): void {
  try {
    (storage ?? tabStorage())?.setItem(key, JSON.stringify({ version: 1, ...session,
      messages: session.messages.map(message => 'result' in message
        ? { role: 'assistant', result: { kind: message.result.kind, entryIds: message.result.entries.map(entry => entry.id) } }
        : message),
    }));
  } catch { /* Storage can be disabled; the current chat still works. */ }
}
export function clearAssistantSession(storage = tabStorage()): void {
  try { storage?.removeItem(key); } catch { /* Do not interrupt closing. */ }
}
