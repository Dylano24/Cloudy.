import type { HelpEntry, HelpResult } from '../components/help/cloudy-knowledge';

export type AssistantTurn = { role: 'user' | 'assistant'; content: string };
export type AssistantReply = {
  answer: string;
  links: { label: string; href: string }[];
  source?: string;
};

export function sanitizeAssistantHistory(value: unknown): AssistantTurn[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-8).flatMap((turn): AssistantTurn[] => {
    if (!turn || typeof turn !== 'object') return [];
    const candidate = turn as Record<string, unknown>;
    if (candidate.role !== 'user' && candidate.role !== 'assistant') return [];
    if (typeof candidate.content !== 'string' || !candidate.content.trim()) return [];
    return [{ role: candidate.role, content: candidate.content.trim().slice(0, 550) }];
  });
}

export function assistantKnowledge(
  question: string,
  history: AssistantTurn[],
  lookup: (question: string) => HelpResult,
): { evidence: string; links: AssistantReply['links']; source?: string } {
  let result = lookup(question);
  if (result.kind === 'unknown') {
    const previous = [...history].reverse().find(turn => turn.role === 'user');
    if (previous) result = lookup(previous.content);
  }

  const entries: HelpEntry[] = result.entries.slice(0, 2);
  const links = entries.flatMap(entry => entry.links)
    .filter((link, index, all) => all.findIndex(item => item.href === link.href) === index)
    .slice(0, 3);
  const source = entries.length ? entries.map(entry => entry.source).join(' · ').slice(0, 200) : undefined;

  // Only the server-controlled, already approved knowledge base is supplied as
  // evidence. Never fetch private orders, arbitrary URLs or Discord channels.
  const evidence = JSON.stringify({
    site: 'Cloudy Inc.',
    verifiedWebsiteInformation: entries.map(entry => ({
      title: entry.title,
      answer: entry.answer.slice(0, 1050),
      source: entry.source,
      links: entry.links.slice(0, 3),
    })),
    limitations: 'No access to visitor accounts, order status, payment records, refund decisions, live web data or private Discord messages. For unavailable Cloudy details refer visitors to official support; do not invent information.',
  });
  return { evidence, links, source };
}
