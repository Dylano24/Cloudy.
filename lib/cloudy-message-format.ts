export type MessageInline = {
  kind: 'text' | 'strong' | 'emphasis' | 'code' | 'link';
  text: string;
  href?: string;
  // Preserve bold or italic emphasis when a known Cloudy page becomes a link.
  emphasis?: 'strong' | 'emphasis';
};
export type MessageBlock =
  | { kind: 'paragraph' | 'heading' | 'quote' | 'code'; content: string }
  | { kind: 'list'; ordered: boolean; items: string[] };

const INLINE_MARKUP = /(\*\*[^*\n]+\*\*|__[^_\n]+__|(?<!\w)\*[^*\n]+\*(?!\w)|`[^`\n]+`|\[[^\]\n]{1,120}\]\([^) \n]+\)|<https?:\/\/[^>\n]+>|https?:\/\/[^\s<>\n]+)/g;
const ALLOWED_PATH = /^\/(?:support|shop|appeal|cart|checkout|terms|terms-of-sale|privacy|link-account|account)\/?$/;
const DISCORD_INVITE = /^https:\/\/discord\.gg\/EGDVMmmSzF\/?$/i;
const CLOUDY_HOST = /^https:\/\/cloudy-store-vert\.vercel\.app(\/[a-z0-9/_-]*)?\/?$/i;
const KNOWN_PATH_LABELS: Record<string, string> = {
  '/support': 'Support & Help',
  '/shop': 'Cloudy Store',
  '/appeal': 'Appeal form',
  '/cart': 'Shopping basket',
  '/checkout': 'Checkout',
  '/terms': 'Terms of service',
  '/terms-of-sale': 'Terms of sale',
  '/privacy': 'Privacy policy',
  '/link-account': 'Link your account',
  '/account': 'My account',
};

export function safeAssistantHref(href: string): string | null {
  if (href === '/' || ALLOWED_PATH.test(href)) return href;
  if (DISCORD_INVITE.test(href) || CLOUDY_HOST.test(href)) return href;
  return null;
}

function friendlyLinkLabel(href: string): string {
  if (DISCORD_INVITE.test(href)) return 'Cloudy Discord';
  if (href.startsWith('/')) return KNOWN_PATH_LABELS[href.replace(/\/$/, '')] || href;
  try {
    const parsed = new URL(href);
    if (parsed.hostname === 'cloudy-store-vert.vercel.app') {
      return KNOWN_PATH_LABELS[parsed.pathname.replace(/\/$/, '')] || 'Cloudy website';
    }
    return parsed.hostname;
  } catch {
    return href;
  }
}

// Link only fixed, verified Cloudy destinations. Never trust model-generated
// links to arbitrary domains and never turn ordinary brand mentions into
// advertisements. Exact page names can appear in Dutch, French or English text.
const TRUSTED_MENTION = /\b(?:Cloudy Store|Cloudy Discord|Cloudy website|Support\s*&\s*Help|Appeal form|Terms of (?:service|sale)|Privacy policy|Link your account|Shopping basket|My account|Cloudy checkout|Cloudy winkel|Cloudy boutique)\b/gi;

export function trustedMentionHref(mention: string): string | null {
  const key = mention.toLowerCase().replace(/\s+/g, ' ').trim();
  const destinations: Record<string, string> = {
    'cloudy store': '/shop',
    'cloudy winkel': '/shop',
    'cloudy boutique': '/shop',
    'cloudy discord': 'https://discord.gg/EGDVMmmSzF',
    'cloudy website': '/',
    'support & help': '/support',
    'appeal form': '/appeal',
    'terms of service': '/terms',
    'terms of sale': '/terms-of-sale',
    'privacy policy': '/privacy',
    'link your account': '/link-account',
    'shopping basket': '/cart',
    'my account': '/account',
    'cloudy checkout': '/checkout',
  };
  return destinations[key] || null;
}

function linkifyTrustedMentions(text: string, emphasis?: 'strong' | 'emphasis'): MessageInline[] {
  const result: MessageInline[] = [];
  let offset = 0;
  for (const match of text.matchAll(TRUSTED_MENTION)) {
    const i = match.index ?? 0;
    if (i > offset) result.push({ kind: emphasis || 'text', text: text.slice(offset, i) });
    const href = trustedMentionHref(match[0]);
    if (href) result.push({ kind: 'link', text: match[0], href, ...(emphasis ? { emphasis } : {}) });
    else result.push({ kind: emphasis || 'text', text: match[0] });
    offset = i + match[0].length;
  }
  if (offset < text.length) result.push({ kind: emphasis || 'text', text: text.slice(offset) });
  return result;
}

/** Parse only a small, safe subset of Markdown. No HTML or scripts are interpreted. */
export function parseAssistantInline(text: string): MessageInline[] {
  const pieces: MessageInline[] = [];
  let from = 0;
  for (const match of text.matchAll(INLINE_MARKUP)) {
    const index = match.index ?? 0;
    if (index > from) pieces.push(...linkifyTrustedMentions(text.slice(from, index)));
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')
        || token.startsWith('__') && token.endsWith('__')) {
      pieces.push(...linkifyTrustedMentions(token.slice(2, -2), 'strong'));
    } else if (token.startsWith('*') && token.endsWith('*')) {
      pieces.push(...linkifyTrustedMentions(token.slice(1, -1), 'emphasis'));
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const value = token.slice(1, -1);
      const path = safeAssistantHref(value);
      pieces.push(path ? { kind: 'link', text: friendlyLinkLabel(value), href: path }
        : { kind: 'code', text: value });
    } else {
      let label = '';
      let href = '';
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        label = link[1];
        href = link[2];
      } else {
        href = token.startsWith('<') ? token.slice(1, -1) : token;
        // Do not include sentence punctuation as part of a plain URL.
        if (!token.startsWith('<')) {
          const clean = href.replace(/[.,;!?]+$/, '');
          if (clean.length !== href.length) {
            href = clean;
          }
        }
        label = friendlyLinkLabel(href);
      }
      const safe = safeAssistantHref(href);
      pieces.push(safe ? { kind: 'link', text: label, href: safe }
        : { kind: 'text', text: label });
      const suffix = token.startsWith('http') ? token.slice(href.length) : '';
      if (suffix) pieces.push({ kind: 'text', text: suffix });
    }
    from = index + token.length;
  }
  if (from < text.length) pieces.push(...linkifyTrustedMentions(text.slice(from)));
  return pieces;
}

const BULLET = /^\s*[-*•]\s+(.+)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.+)$/;

export function parseAssistantMessage(text: string): MessageBlock[] {
  const lines = String(text || '').replace(/\r\n?/g, '\n').trim().split('\n');
  const blocks: MessageBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index++; continue; }

    if (line.startsWith('```')) {
      const code: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index++]);
      }
      if (index < lines.length) index++;
      blocks.push({ kind: 'code', content: code.join('\n') });
      continue;
    }
    const heading = /^#{1,3}\s+(.+)$/.exec(line);
    if (heading) { blocks.push({ kind: 'heading', content: heading[1] }); index++; continue; }

    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        const next = (ordered ? NUMBERED : BULLET).exec(current);
        if (!next) break;
        items.push(next[1]);
        index++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }
    const quote = /^>\s*(.+)$/.exec(line);
    if (quote) { blocks.push({ kind: 'quote', content: quote[1] }); index++; continue; }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim()
      && !/^#{1,3}\s+/.test(lines[index].trim())
      && !BULLET.test(lines[index].trim())
      && !NUMBERED.test(lines[index].trim())
      && !lines[index].trim().startsWith('```')) {
      paragraph.push(lines[index].trim());
      index++;
    }
    blocks.push({ kind: 'paragraph', content: paragraph.join('\n') });
  }
  return blocks;
}


/** Verified URLs that are already clickable in the visible AI text. */
export function assistantInlineDestinationHrefs(text: string): Set<string> {
  const destinations = new Set<string>();
  for (const block of parseAssistantMessage(text)) {
    if (block.kind === 'code') continue;
    const segments = block.kind === 'list' ? block.items : [block.content];
    for (const segment of segments) {
      for (const piece of parseAssistantInline(segment)) {
        if (piece.kind === 'link' && piece.href) destinations.add(piece.href);
      }
    }
  }
  return destinations;
}
