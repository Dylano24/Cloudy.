import type { HelpEntry, HelpResult } from '../components/help/cloudy-knowledge';

export type AssistantTurn = { role: 'user' | 'assistant'; content: string };
export type AssistantReply = {
  answer: string;
  links: { label: string; href: string }[];
  source?: string;
};

export function sanitizeAssistantHistory(value: unknown): AssistantTurn[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((turn): AssistantTurn[] => {
    if (!turn || typeof turn !== 'object') return [];
    const candidate = turn as Record<string, unknown>;
    if (candidate.role !== 'user' && candidate.role !== 'assistant') return [];
    if (typeof candidate.content !== 'string' || !candidate.content.trim()) return [];
    return [{ role: candidate.role, content: candidate.content.trim().slice(0, 550) }];
  }).slice(-8);
}

function normalizeIntent(value: string): string {
  return value.toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[!?.,:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const FOLLOW_UP_STEPS = /^(?:(?:and|en|et)\s+)?(?:what (?:should|can) i do(?: (?:next|now))?|what (?:happens|comes) next|wat (?:moet|kan) ik(?: (?:nu|daarna))? doen|wat is de volgende stap|que dois-je faire(?: (?:maintenant|ensuite))?|quelle est la prochaine etape)$/;
const FOLLOW_UP_LINK = /^(?:(?:and|en|et)\s+)?(?:where (?:can|do) i (?:find|read|access) (?:that|this|it)|(?:can|could) you send me (?:that|the link)|waar (?:kan|kun) ik (?:dat|dit) (?:vinden|lezen)|(?:kun|kan) je (?:die|de) link sturen|ou (?:puis-je|peux-tu) (?:trouver|lire) (?:cela|ca))$/;
const FOLLOW_UP_LANGUAGE = '(?:english|dutch|french|nederlands|engels|frans|anglais|neerlandais|francais)';
const FOLLOW_UP_POLITENESS = "(?:please|alsjeblieft|s['’]il te plait)";
const FOLLOW_UP_EXPLANATION = new RegExp(
  "^(?:(?:and|en|et)\\s+)?(?:(?:can|could) you (?:explain|clarify|repeat|summarize) (?:that|this|it)|(?:explain|clarify|repeat|summarize) (?:that|this|it)|(?:kun|kan) (?:je|jij|u) (?:dat|dit) (?:uitleggen|herhalen|samenvatten)|(?:peux|pourrais)-tu (?:expliquer|clarifier|repeter|resumer) (?:cela|ca)|(?:explique|repete|resume) (?:cela|ca))"
  + '(?:\\s+(?:in|en)(?: het)?\\s+' + FOLLOW_UP_LANGUAGE + ')?'
  + '(?:\\s+' + FOLLOW_UP_POLITENESS + ')?$',
);
const FOLLOW_UP_TRANSLATION = new RegExp(
  '^(?:(?:can|could) you translate (?:that|this|it) (?:into|to)|translate (?:that|this|it) (?:into|to)|(?:kun|kan) (?:je|jij|u) (?:dat|dit) (?:in|vertalen naar)(?: het)?|(?:peux|pourrais)-tu traduire (?:cela|ca) en|traduis (?:cela|ca) en|(?:in|en)(?: het)?)\\s+'
  + FOLLOW_UP_LANGUAGE + '(?:\\s+vertalen)?(?:\\s+' + FOLLOW_UP_POLITENESS + ')?$',
);

function isTopicFollowUp(question: string): boolean {
  const q = normalizeIntent(question);
  return FOLLOW_UP_STEPS.test(q) || FOLLOW_UP_LINK.test(q)
    || FOLLOW_UP_EXPLANATION.test(q) || FOLLOW_UP_TRANSLATION.test(q);
}

/** A broad request for help is the beginning of a conversation, not a request for support links. */
export function isVagueHelpRequest(question: string): boolean {
  const q = normalizeIntent(question);
  return /^(?:(?:hallo|hoi|hey|hello|hi|hey cloudy|beste cloudy)\s+)?(?:ik (?:heb|zoek|wil|kan wel wat) (?:wat |een beetje |graag )?(?:hulp|help|support|ondersteuning|assistentie)(?: nodig)?|(?:i|we) (?:need|want|could use) (?:some |a bit of )?(?:help|support|assistance)|(?:can|could) you help me|(?:kun|kan) (?:je|jij|u) (?:me|mij) helpen|help me|help|support|hulp|help alsjeblieft|help please)$/.test(q);
}

function isContactOrLinkRequest(question: string): boolean {
  const q = normalizeIntent(question);
  return /\b(?:link|linkje|url|website|pagina|page|open|openen|bezoek|visit|stuur|send|show me|take me|go to|ga naar|contact|contact opnemen|bereiken|reach|spreken met|talk to|join|uitnodiging|invite|waar vind ik|where (?:can|do|is)|hoe (?:kom ik|vind ik|bereik ik)|how (?:can i find|do i reach|to access))\b/.test(q);
}

function wantsDirectCloudySupport(question: string): boolean {
  const q = normalizeIntent(question);
  if (isVagueHelpRequest(q)) return false;
  return /\b(?:contact|contact opnemen|bereik|medewerker|staff|helpdesk|support team|support pagina|support page|support link|supportlink|ticket|tickets|discord support|spreken met|talk to|reach support|where is support|waar is support)\b/.test(q)
    || /\b(?:link|pagina|page|url|website|waar|where|open|openen)\b/.test(q)
      && /\b(?:support|hulp|help)\b/.test(q);
}

function hasActionableDeliveryIssue(question: string): boolean {
  const q = normalizeIntent(question);
  return /\b(?:niet ontvangen|niet gekregen|niet geleverd|not received|never arrived|not delivered|missing product|purchase is missing|where is my order|waar is mijn bestelling)\b/.test(q)
    && /\b(?:wat moet|what should|wat kan|what can|hoe los|how do|support|contact|help|hulp)\b/.test(q);
}

function allowContextForEntry(entry: HelpEntry, question: string): boolean {
  if (entry.id !== 'support') return true;
  return wantsDirectCloudySupport(question);
}

function showLinksForEntry(entry: HelpEntry, question: string): boolean {
  if (entry.id === 'support') return wantsDirectCloudySupport(question);
  return isContactOrLinkRequest(question) || entry.id === 'missing-delivery' && hasActionableDeliveryIssue(question);
}

function relevantLinksForEntry(entry: HelpEntry, question: string): AssistantReply['links'] {
  if (!showLinksForEntry(entry, question)) return [];
  const q = normalizeIntent(question);
  // Prefer exactly the requested destination. Do not dump a list of generic
  // Support, Discord, terms, shop and checkout links below every answer.
  const preferred = /\bdiscord\b/.test(q) ? 'discord.gg'
    : /\b(?:voorwaarden|terms|privacy|beleid)\b/.test(q) ? '/terms'
    : /\b(?:support|hulp|contact|staff|ticket)\b/.test(q) ? '/support'
    : /\b(?:afrekenen|checkout)\b/.test(q) ? '/checkout'
    : /\b(?:winkelmand|basket|cart)\b/.test(q) ? '/cart'
    : '';
  const match = preferred ? entry.links.find(link => link.href.includes(preferred)) : null;
  return match ? [match] : entry.links.slice(0, 1);
}

export function assistantKnowledge(
  question: string,
  history: AssistantTurn[],
  lookup: (question: string) => HelpResult,
): { evidence: string; links: AssistantReply['links']; source?: string } {
  const vagueHelp = isVagueHelpRequest(question);
  let result: HelpResult = vagueHelp ? { kind: 'unknown', entries: [] } : lookup(question);
  let topicQuestion = question;

  // Follow-ups may ask for the next step without repeating the original issue.
  // Keep the earlier topic only when the current message is genuinely a follow-up.
  if (!vagueHelp && result.kind === 'unknown' && isTopicFollowUp(question)) {
    const previous = [...history].reverse().find(turn => turn.role === 'user');
    if (previous && !isVagueHelpRequest(previous.content)) {
      result = lookup(previous.content);
      topicQuestion = previous.content + ' ' + question;
    }
  }

  const entries = result.entries
    .filter(entry => allowContextForEntry(entry, topicQuestion))
    .slice(0, 2);
  const links = entries.flatMap(entry => relevantLinksForEntry(entry, topicQuestion))
    .filter((link, index, all) => all.findIndex(item => item.href === link.href) === index)
    .slice(0, 2);
  // Source notes add value for policy/delivery facts, not generic chat or
  // navigation. Avoid redundant "Source: Support & Help page" labels.
  const sourcedEntries = entries.filter(entry =>
    entry.id.startsWith('sale-') || entry.id.startsWith('service-')
    || ['missing-delivery', 'discord-rules', 'zorp'].includes(entry.id));
  const source = sourcedEntries.length
    ? sourcedEntries.map(entry => entry.source).join(' · ').slice(0, 200)
    : undefined;

  // The website controls sources and link buttons, not the model. In particular,
  // "Ik heb support nodig" has no verified-navigation evidence or automatic links.
  const evidence = JSON.stringify({
    site: 'Cloudy Inc.',
    verifiedWebsiteInformation: entries.map(entry => ({
      title: entry.title,
      answer: entry.answer.slice(0, 1050),
      source: entry.source,
      // Never feed support/Discord URLs to the model unless the visitor asked
      // for a specific resource. The site renders verified buttons separately.
      ...(showLinksForEntry(entry, topicQuestion) ? { links: relevantLinksForEntry(entry, topicQuestion) } : {}),
    })),
    navigationRequested: links.length > 0,
    limitations: 'No access to visitor accounts, order status, payment records, refund decisions, live web data or private Discord messages. Talk naturally about general questions. Never direct a visitor to the support page or Discord without a specific request. Do not invent private Cloudy facts.',
  });
  return { evidence, links, source };
}
