export type MessageInline = {
  kind: 'text' | 'strong' | 'emphasis' | 'code' | 'link';
  text: string;
  href?: string;
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
  if (ALLOWED_PATH.test(href)) return href;
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

/** Parse only a small, safe subset of Markdown. No HTML or scripts are interpreted. */
export function parseAssistantInline(text: string): MessageInline[] {
  const pieces: MessageInline[] = [];
  let from = 0;
  for (const match of text.matchAll(INLINE_MARKUP)) {
    const index = match.index ?? 0;
    if (index > from) pieces.push({ kind: 'text', text: text.slice(from, index) });
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')
        || token.startsWith('__') && token.endsWith('__')) {
      pieces.push({ kind: 'strong', text: token.slice(2, -2) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      pieces.push({ kind: 'emphasis', text: token.slice(1, -1) });
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
  if (from < text.length) pieces.push({ kind: 'text', text: text.slice(from) });
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
