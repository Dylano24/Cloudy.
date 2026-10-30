import { Fragment, type ReactNode } from 'react';
import styles from './bot.module.css';

const CLOUDY_LOGO = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';

export type PreviewContext = { user: string; userTag: string; server: string; memberCount: number; level?: number; channelName: (id: string) => string | null };

/** Replaces Cloudy's placeholders with sample values for the preview only. */
export function fillPlaceholders(text: string, ctx: PreviewContext) {
  return text
    .replaceAll('{user.tag}', ctx.userTag)
    .replaceAll('{user}', `\u0000@${ctx.user}\u0000`)
    .replaceAll('{server}', ctx.server)
    .replaceAll('{memberCount}', String(ctx.memberCount))
    .replaceAll('{level}', String(ctx.level ?? 10))
    .replaceAll('{username}', ctx.user);
}

// A small, safe subset of Discord markdown rendered to React elements: never
// HTML strings, so text from settings cannot inject markup.
const INLINE = /(\u0000@[^\u0000]+\u0000|\[[^\]\n]{1,80}\]\(https:\/\/[^\s)]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|<#\d{17,20}>|#[a-z0-9-]{2,40})/g;

export function DiscordText({ text, ctx }: { text: string; ctx: PreviewContext }) {
  const parts = fillPlaceholders(text, ctx).split(INLINE);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        let node: ReactNode = part;
        if (part.startsWith('\u0000@')) node = <span className={styles.dMention}>{part.slice(1, -1)}</span>;
        else if (/^\[[^\]\n]{1,80}\]\(https:\/\//.test(part)) node = <span className={styles.dLink}>{part.slice(1, part.indexOf(']('))}</span>;
        else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) node = <strong>{part.slice(2, -2)}</strong>;
        else if (part.startsWith('__') && part.endsWith('__') && part.length > 4) node = <u>{part.slice(2, -2)}</u>;
        else if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) node = <s>{part.slice(2, -2)}</s>;
        else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) node = <em>{part.slice(1, -1)}</em>;
        else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) node = <code className={styles.dCode}>{part.slice(1, -1)}</code>;
        else if (/^<#\d{17,20}>$/.test(part)) node = <span className={styles.dChannel}>#{ctx.channelName(part.slice(2, -1)) || 'channel'}</span>;
        else if (/^#[a-z0-9-]{2,40}$/.test(part)) node = <span className={styles.dChannel}>{part}</span>;
        return <Fragment key={index}>{node}</Fragment>;
      })}
    </>
  );
}

export const CLOUDY_BANNER = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-dynamic-banner.gif';
export const CLOUDY_LOGO_URL = CLOUDY_LOGO;

export type PreviewEmbed = {
  title?: string; description?: string; color?: string; image?: string; footer?: string; footerIcon?: boolean;
  thumbnail?: string; fields?: { name: string; value: string; inline?: boolean }[]; timestamp?: boolean;
};

export function DiscordMessage({ content, embed, buttons, ctx }: {
  content?: string;
  embed?: PreviewEmbed | null;
  buttons?: { label: string; primary?: boolean }[];
  ctx: PreviewContext;
}) {
  const safeImage = embed?.image && /^https:\/\/[^\s"'<>]+$/.test(embed.image) ? embed.image : null;
  return (
    <div className={styles.discord} aria-label="Discord message preview">
      <div className={styles.dMessage}>
        <img className={styles.dAvatar} src={CLOUDY_LOGO} alt="" width={40} height={40} loading="lazy" decoding="async" />
        <div style={{ minWidth: 0 }}>
          <div className={styles.dHeader}>
            <span className={styles.dName}>Cloudy</span>
            <span className={styles.dApp}>APP</span>
            <span className={styles.dTime}>Today at 20:00</span>
          </div>
          {content ? <div className={styles.dContent}><DiscordText text={content} ctx={ctx} /></div> : null}
          {embed && (embed.title || embed.description || safeImage) ? (
            <div className={styles.dEmbed} style={{ borderLeftColor: embed.color && /^#[0-9a-f]{6}$/i.test(embed.color) ? embed.color : '#ffffff' }}>
              <div className={embed.thumbnail ? styles.dEmbedSplit : undefined}>
                <div style={{ minWidth: 0, display: 'grid', gap: 8 }}>
                  {embed.title ? <div className={styles.dEmbedTitle}><DiscordText text={embed.title} ctx={ctx} /></div> : null}
                  {embed.description ? <div className={styles.dEmbedText}><DiscordText text={embed.description} ctx={ctx} /></div> : null}
                  {embed.fields?.map(field => (
                    <div key={field.name} className={styles.dField}>
                      <div className={styles.dFieldName}>{field.name}</div>
                      <div className={styles.dEmbedText}><DiscordText text={field.value} ctx={ctx} /></div>
                    </div>
                  ))}
                </div>
                {embed.thumbnail ? <img className={styles.dThumb} src={embed.thumbnail} alt="" width={80} height={80} loading="lazy" decoding="async" /> : null}
              </div>
              {safeImage ? <img className={styles.dEmbedImage} src={safeImage} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : null}
              {embed.footer || embed.timestamp ? (
                <div className={styles.dEmbedFooter}>
                  {embed.footerIcon ? <img src={CLOUDY_LOGO} alt="" width={20} height={20} loading="lazy" decoding="async" /> : null}
                  <span>{[embed.footer ? fillPlaceholders(embed.footer, ctx).replaceAll('\u0000', '') : '', embed.timestamp ? 'Today at 20:00' : ''].filter(Boolean).join(' • ')}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          {buttons?.length ? (
            <div className={styles.dButtons}>
              {buttons.map(button => <span key={button.label} className={[styles.dButton, button.primary ? styles.dButtonPrimary : ''].join(' ')}>{button.label}</span>)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
