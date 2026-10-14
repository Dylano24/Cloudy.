'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { ArrowUp, ArrowUpRight, Bot, RotateCcw, X } from 'lucide-react';
import { findHelp, helpEntries, type HelpEntry, type HelpResult } from './cloudy-knowledge';
import { assistantKnowledge, type AssistantReply, type AssistantTurn } from '@/lib/cloudy-chat-context';
import { CloudyMessage } from './cloudy-message';
import { assistantInlineDestinationHrefs } from '@/lib/cloudy-message-format';
import styles from './cloudy-help.module.css';

type Message =
  | { role: 'visitor'; text: string }
  | { role: 'assistant'; result: HelpResult }
  | { role: 'assistant'; response: AssistantReply };

const shortcuts = ['missing-delivery', 'store', 'appeal', 'support', 'sale-introduction'];

// A verified destination shown as a blue inline link should not also appear
// as a bulky duplicate navigation card under the same assistant answer.
function extraReplyLinks(response: AssistantReply): AssistantReply['links'] {
  const inline = assistantInlineDestinationHrefs(response.answer);
  return response.links.filter(link => !inline.has(link.href));
}

export function CloudyHelp() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [activePhoneTopic, setActivePhoneTopic] = useState<HelpEntry | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const requestGeneration = useRef(0);

  useEffect(() => () => { requestRef.current?.abort(); }, []);

  function stopPendingReply() {
    requestGeneration.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    setPending(false);
  }

  function clearConversation() {
    // Closing the assistant ends this session. Clear both visible messages and
    // any draft/topic, and invalidate pending replies so they cannot reappear.
    stopPendingReply();
    setActivePhoneTopic(null);
    setMessages([]);
    setQuestion('');
  }

  function close() {
    clearConversation();
    setOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    // Do not trigger the phone keyboard when the assistant first opens:
    // visitors should see the full intro and shortcuts straight away.
    if (!window.matchMedia('(max-width: 480px)').matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (!open || !log) return;
    if (activePhoneTopic && window.matchMedia('(max-width: 480px)').matches) {
      log.scrollTop = 0;
      return;
    }
    if (window.matchMedia('(max-width: 480px)').matches && messages.length) {
      // Present the newest answer at its beginning on the first tap.
      // Scrolling to the very bottom previously hid the answer heading.
      const latest = log.querySelector<HTMLElement>('[data-latest-answer="true"]');
      if (latest) {
        const delta = latest.getBoundingClientRect().top - log.getBoundingClientRect().top;
        log.scrollTop += delta - 8;
        return;
      }
    }
    log.scrollTop = log.scrollHeight;
  }, [messages, open, activePhoneTopic, pending]);

  useLayoutEffect(() => {
    if (activePhoneTopic && open && logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [activePhoneTopic, open]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const fitViewport = () => {
      const dock = dockRef.current;
      if (!dock) return;
      // Use the actual visible part of the screen, not 100vh. On iPhone
      // the software keyboard changes visualViewport independently.
      dock.style.setProperty('--help-available-height', `${Math.round(viewport.height)}px`);
      dock.style.setProperty('--help-viewport-top', `${Math.round(viewport.offsetTop)}px`);
      const covered = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      dock.style.setProperty('--help-keyboard-inset', `${covered > 140 ? covered : 0}px`);
    };
    let animationFrame = 0;
    const scheduleFit = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(fitViewport);
    };
    fitViewport();
    viewport.addEventListener('resize', scheduleFit);
    viewport.addEventListener('scroll', scheduleFit);
    window.addEventListener('resize', scheduleFit);
    document.addEventListener('focusin', scheduleFit);
    return () => {
      cancelAnimationFrame(animationFrame);
      viewport.removeEventListener('resize', scheduleFit);
      viewport.removeEventListener('scroll', scheduleFit);
      window.removeEventListener('resize', scheduleFit);
      document.removeEventListener('focusin', scheduleFit);
    };
  }, []);

  // Lock the background page while the assistant is open on a phone.
  // Safari otherwise scrolls the entire website to focus the input,
  // which visually collapses or jumps the fixed chat panel.
  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 480px)').matches) return;
    const scrollTop = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollTop}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      window.scrollTo(0, scrollTop);
    };
  }, [open]);

  function choose(entry: HelpEntry) {
    stopPendingReply();
    setMessages(previous => [...previous, { role: 'visitor' as const, text: entry.title }, { role: 'assistant' as const, result: { kind: 'answer' as const, entries: [entry] } }].slice(-30));
    if (window.matchMedia('(max-width: 480px)').matches) {
      // Display the complete selected answer directly. On iPhone the prior
      // chat/scroll transition could hide the reply until another tap.
      setActivePhoneTopic(entry);
      inputRef.current?.blur();
      return;
    }
    inputRef.current?.focus({ preventScroll: true });
  }

  function preserveShortcutPosition(event: PointerEvent<HTMLButtonElement>) {
    if (event.button === 0 && window.matchMedia('(max-width: 480px)').matches) {
      // Keep input focus until the click lands, so Safari cannot move its target.
      event.preventDefault();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || text.length > 1000 || requestRef.current) return;

    const history: AssistantTurn[] = [];
    for (const message of messages) {
      if (message.role === 'visitor') {
        history.push({ role: 'user', content: message.text });
      } else if ('response' in message) {
        history.push({ role: 'assistant', content: message.response.answer });
      } else if (message.result.kind === 'answer') {
        history.push({
          role: 'assistant',
          content: message.result.entries.map(entry => entry.answer).join('\n'),
        });
      }
    }
    const recentHistory = history.slice(-8);

    const controller = new AbortController();
    const generation = ++requestGeneration.current;
    requestRef.current = controller;
    setPending(true);
    setActivePhoneTopic(null);
    setMessages(previous => [...previous, { role: 'visitor' as const, text }].slice(-30));
    setQuestion('');

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, history: recentHistory }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data?.answer !== 'string' || !data.answer.trim()) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Assistant temporarily unavailable.');
      }
      if (requestGeneration.current !== generation) return;
      setMessages(previous => [...previous, {
        role: 'assistant' as const,
        response: {
          answer: data.answer.trim(),
          links: Array.isArray(data.links) ? data.links : [],
          source: typeof data.source === 'string' ? data.source : undefined,
        },
      }].slice(-30));
    } catch {
      if (controller.signal.aborted || requestGeneration.current !== generation) return;
      const fallback = findHelp(text);
      const context = assistantKnowledge(text, recentHistory, findHelp);
      const dutch = /\b(?:ik|een|mijn|jij|kun|kan|wat|waar|hoe|nodig|wil|niet|met|hulp)\b/i.test(text);
      const unavailable = dutch
        ? 'De AI is even niet bereikbaar. Probeer het zo opnieuw.'
        : 'The AI is temporarily unavailable. Please try again shortly.';
      if (context.source && fallback.kind === 'answer' && fallback.entries[0]) {
        const entry = fallback.entries[0];
        setMessages(previous => [...previous, {
          role: 'assistant' as const,
          response: {
            answer: `${unavailable}\n\n${entry.answer}`,
            links: context.links,
            source: context.source,
          },
        }].slice(-30));
      } else {
        setMessages(previous => [...previous, {
          role: 'assistant' as const,
          response: { answer: unavailable, links: [] },
        }].slice(-30));
      }
    } finally {
      if (requestGeneration.current === generation) {
        requestRef.current = null;
        setPending(false);
      }
    }
  }

  function reset() {
    clearConversation();
    if (window.matchMedia('(max-width: 480px)').matches) {
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  return (
    <div className={styles.dock} data-open={open ? "true" : "false"} data-has-messages={messages.length > 0 ? "true" : "false"} data-active-phone-topic={activePhoneTopic ? "true" : "false"} ref={dockRef}>
      {open && (
        <section id="cloudy-help-panel" className={styles.panel} role="dialog" aria-modal="false" aria-labelledby="cloudy-help-title">
          <header className={styles.header}>
            <span className={styles.brandIcon}><Bot size={21} aria-hidden="true" /></span>
            <div className={styles.brandCopy}>
              <h2 id="cloudy-help-title">Cloudy assistant</h2>
              <p>Your AI assistant</p>
            </div>
            <button type="button" className={styles.iconButton} onClick={reset} aria-label="Start a new chat" title="Start a new chat"><RotateCcw size={17} aria-hidden="true" /></button>
            <button type="button" className={styles.iconButton} onClick={close} aria-label="Close Cloudy assistant"><X size={20} aria-hidden="true" /></button>
          </header>

          <div className={styles.body} ref={logRef}>
            <div className={styles.welcome}>
              <span className={styles.eyebrow}>HOW CAN WE HELP?</span>
              <h3>Chat with our assistant.</h3>
              <p>Ask me anything or choose a topic below. Don’t share passwords or payment details in chat.</p>
            </div>
            <div className={styles.topics} aria-label="Help topics">
              {helpEntries.filter(entry => shortcuts.includes(entry.id)).map(entry => (
                <button type="button" key={entry.id} onPointerDown={preserveShortcutPosition} onClick={() => choose(entry)}><span className={styles.topicLabel}>{entry.title}</span><ArrowUpRight size={13} aria-hidden="true" /></button>
              ))}
            </div>

            {activePhoneTopic && (
              <section className={styles.phoneTopicDetail} role="region" aria-label={activePhoneTopic.title} aria-live="polite">
                <span className={styles.sender}>Cloudy assistant</span>
                <h3>{activePhoneTopic.title}</h3>
                <p>{activePhoneTopic.answer}</p>
                <div className={styles.links}>
                  {activePhoneTopic.links.map(link => (
                    <a key={link.href} href={link.href} {...(link.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      <span className={styles.linkLabel}>{link.label}</span><ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <small className={styles.source}>Source: {activePhoneTopic.source}</small>
              </section>
            )}

            <div className={styles.conversation} role="log" aria-label="Support conversation" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => message.role === 'visitor' ? (
                <p key={index} className={styles.visitor}>{message.text}</p>
              ) : (
                <div key={index} className={styles.answer} data-latest-answer={index === messages.length - 1 ? "true" : undefined}>
                  <span className={styles.sender}>Cloudy assistant</span>
                  {'response' in message ? (
                    <>
                      <CloudyMessage text={message.response.answer} />
                      {extraReplyLinks(message.response).length > 0 && (
                        <div className={styles.links}>
                          {extraReplyLinks(message.response).map(link => <a key={link.href} href={link.href} {...(link.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><span className={styles.linkLabel}>{link.label}</span><ArrowUpRight size={14} aria-hidden="true" /></a>)}
                        </div>
                      )}
                      {message.response.source && <small className={styles.source}>Source: {message.response.source}</small>}
                    </>
                  ) : message.result.kind === 'answer' ? message.result.entries.map(entry => (
                    <div key={entry.id}>
                      <h3>{entry.title}</h3>
                      <p>{entry.answer}</p>
                      <div className={styles.links}>
                        {entry.links.map(link => <a key={link.href} href={link.href} {...(link.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><span className={styles.linkLabel}>{link.label}</span><ArrowUpRight size={14} aria-hidden="true" /></a>)}
                      </div>
                      <small className={styles.source}>Source: {entry.source}</small>
                    </div>
                  )) : message.result.kind === 'clarify' ? (
                    <>
                      <p>Which of these topics do you mean? Choose one, or give me a little more detail.</p>
                      <div className={styles.topics}>{message.result.entries.map(entry => <button key={entry.id} type="button" onPointerDown={preserveShortcutPosition} onClick={() => choose(entry)}><span className={styles.topicLabel}>{entry.title}</span><ArrowUpRight size={13} aria-hidden="true" /></button>)}</div>
                    </>
                  ) : (
                    <>
                      <p>I don’t have an approved answer for that question. Try a more specific question or choose a help topic. For details that are not available here, contact Cloudy support.</p>
                      <div className={styles.links}><a href="/support">Contact support<ArrowUpRight size={14} aria-hidden="true" /></a></div>
                    </>
                  )}
                </div>
              ))}
              {pending && (
                <div className={styles.answer} data-latest-answer="true" role="status">
                  <span className={styles.sender}>Cloudy assistant</span>
                  <p>Thinking…</p>
                </div>
              )}
            </div>
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.srOnly} htmlFor="cloudy-help-question">Your question</label>
            <input ref={inputRef} id="cloudy-help-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder="Type your question" autoComplete="off" />
            <button type="submit" disabled={!question.trim() || pending} aria-label="Send question"><ArrowUp size={19} aria-hidden="true" /></button>
          </form>
        </section>
      )}
      <button ref={launcherRef} type="button" className={styles.launcher} aria-label="Assistant" aria-expanded={open} aria-controls="cloudy-help-panel" onClick={() => open ? close() : setOpen(true)}>
        <Bot size={23} aria-hidden="true" />
        <span>Assistant</span>
      </button>
    </div>
  );
}
