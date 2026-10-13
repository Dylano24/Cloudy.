'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, ArrowUpRight, MessageCircle, RotateCcw, X } from 'lucide-react';
import { findHelp, helpEntries, type HelpEntry, type HelpResult } from './cloudy-knowledge';
import styles from './cloudy-help.module.css';

type Message =
  | { role: 'visitor'; text: string }
  | { role: 'assistant'; result: HelpResult };

const shortcuts = ['missing-delivery', 'store', 'appeal', 'support', 'faq', 'sale-introduction'];

export function CloudyHelp() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [allTopics, setAllTopics] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      launcherRef.current?.focus();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);

  useEffect(() => {
    if (open && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const fitViewport = () => {
      const dock = dockRef.current;
      if (!dock) return;
      dock.style.setProperty('--help-available-height', `${viewport.height}px`);
      dock.style.setProperty('--help-keyboard-inset', `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`);
    };
    fitViewport();
    viewport.addEventListener('resize', fitViewport);
    viewport.addEventListener('scroll', fitViewport);
    return () => {
      viewport.removeEventListener('resize', fitViewport);
      viewport.removeEventListener('scroll', fitViewport);
    };
  }, []);

  function choose(entry: HelpEntry) {
    setMessages(previous => [...previous, { role: 'visitor' as const, text: entry.title }, { role: 'assistant' as const, result: { kind: 'answer' as const, entries: [entry] } }].slice(-30));
    setAllTopics(false);
    inputRef.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || text.length > 1000) return;
    const result = findHelp(text);
    setMessages(previous => [...previous, { role: 'visitor' as const, text }, { role: 'assistant' as const, result }].slice(-30));
    setQuestion('');
  }

  function reset() {
    setMessages([]);
    setQuestion('');
    setAllTopics(false);
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className={styles.dock} ref={dockRef}>
      {open && (
        <section id="cloudy-help-panel" className={styles.panel} role="dialog" aria-modal="false" aria-labelledby="cloudy-help-title">
          <header className={styles.header}>
            <span className={styles.brandIcon}><MessageCircle size={21} aria-hidden="true" /></span>
            <div className={styles.brandCopy}>
              <h2 id="cloudy-help-title">Cloudy help</h2>
              <p>Website &amp; purchase help</p>
            </div>
            <button type="button" className={styles.iconButton} onClick={reset} aria-label="Start a new chat" title="Start a new chat"><RotateCcw size={17} aria-hidden="true" /></button>
            <button type="button" className={styles.iconButton} onClick={close} aria-label="Close Cloudy help"><X size={20} aria-hidden="true" /></button>
          </header>

          <div className={styles.body} ref={logRef}>
            <div className={styles.welcome}>
              <span className={styles.eyebrow}>HOW CAN WE HELP?</span>
              <h3>Welcome to <span>Cloudy.</span></h3>
              <p>Ask about the website, purchases or support. Choose a topic or type your question below.</p>
            </div>
            <div className={styles.topics} aria-label="Help topics">
              {(allTopics ? helpEntries : helpEntries.filter(entry => shortcuts.includes(entry.id))).map(entry => (
                <button type="button" key={entry.id} onClick={() => choose(entry)}>{entry.title}<ArrowUpRight size={13} aria-hidden="true" /></button>
              ))}
            </div>
            <button className={styles.browse} type="button" aria-expanded={allTopics} onClick={() => setAllTopics(value => !value)}>{allTopics ? 'Show fewer topics' : 'Browse all topics'}</button>

            <div className={styles.conversation} role="log" aria-label="Support conversation" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => message.role === 'visitor' ? (
                <p key={index} className={styles.visitor}>{message.text}</p>
              ) : (
                <div key={index} className={styles.answer}>
                  <span className={styles.sender}>Cloudy help</span>
                  {message.result.kind === 'answer' ? message.result.entries.map(entry => (
                    <div key={entry.id}>
                      <h3>{entry.title}</h3>
                      <p>{entry.answer}</p>
                      <div className={styles.links}>
                        {entry.links.map(link => <a key={link.href} href={link.href} {...(link.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}
                      </div>
                      <small className={styles.source}>Source: {entry.source}</small>
                    </div>
                  )) : message.result.kind === 'clarify' ? (
                    <>
                      <p>Which of these topics do you mean? Choose one, or give me a little more detail.</p>
                      <div className={styles.topics}>{message.result.entries.map(entry => <button key={entry.id} type="button" onClick={() => choose(entry)}>{entry.title}<ArrowUpRight size={13} aria-hidden="true" /></button>)}</div>
                    </>
                  ) : (
                    <>
                      <p>I don’t have an approved answer for that question. Try a more specific question or choose a help topic. For details that are not available here, contact Cloudy support.</p>
                      <div className={styles.links}><a href="/support">Contact support<ArrowUpRight size={14} aria-hidden="true" /></a></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.srOnly} htmlFor="cloudy-help-question">Your question</label>
            <input ref={inputRef} id="cloudy-help-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder="How can we help?" autoComplete="off" />
            <button type="submit" disabled={!question.trim()} aria-label="Send question"><ArrowUp size={19} aria-hidden="true" /></button>
          </form>
        </section>
      )}
      <button ref={launcherRef} type="button" className={styles.launcher} aria-label="Cloudy help" aria-expanded={open} aria-controls="cloudy-help-panel" onClick={() => open ? close() : setOpen(true)}>
        {open ? <X size={21} aria-hidden="true" /> : <MessageCircle size={23} aria-hidden="true" />}
        <span>Cloudy help</span>
      </button>
    </div>
  );
}
