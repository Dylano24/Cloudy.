import styles from './bot.module.css';

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words.slice(0, 2).map(word => word[0]).join('') : (words[0] || '?').slice(0, 2)).toUpperCase();
}

export function GuildIcon({ name, url, large = false }: { name: string; url: string | null; large?: boolean }) {
  return (
    <span className={[styles.guildIcon, large ? styles.guildIconLarge : ''].join(' ')} aria-hidden="true">
      {url ? <img src={url} alt="" width={large ? 72 : 52} height={large ? 72 : 52} loading="lazy" decoding="async" /> : initials(name)}
    </span>
  );
}
