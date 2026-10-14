import { parseAssistantInline, parseAssistantMessage, type MessageInline } from '@/lib/cloudy-message-format';
import styles from './cloudy-help.module.css';

function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseAssistantInline(text).map((piece: MessageInline, index) => {
        if (piece.kind === 'strong') return <strong key={index}>{piece.text}</strong>;
        if (piece.kind === 'emphasis') return <em key={index}>{piece.text}</em>;
        if (piece.kind === 'code') return <code key={index}>{piece.text}</code>;
        if (piece.kind === 'link' && piece.href) {
          return (
            <a
              key={index}
              href={piece.href}
              {...(piece.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {piece.emphasis === 'strong'
                ? <strong>{piece.text}</strong>
                : piece.emphasis === 'emphasis'
                  ? <em>{piece.text}</em>
                  : piece.text}
            </a>
          );
        }
        return <span key={index}>{piece.text}</span>;
      })}
    </>
  );
}

/** Never inject model-produced HTML. All rich text is rendered as React text nodes. */
export function CloudyMessage({ text }: { text: string }) {
  return (
    <div className={styles.richText}>
      {parseAssistantMessage(text).map((block, index) => {
        if (block.kind === 'heading') {
          return <h3 key={index}><InlineText text={block.content} /></h3>;
        }
        if (block.kind === 'quote') {
          return <blockquote key={index}><InlineText text={block.content} /></blockquote>;
        }
        if (block.kind === 'code') {
          return <pre key={index}><code>{block.content}</code></pre>;
        }
        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}><InlineText text={item} /></li>
              ))}
            </ListTag>
          );
        }
        return <p key={index}><InlineText text={block.content} /></p>;
      })}
    </div>
  );
}
