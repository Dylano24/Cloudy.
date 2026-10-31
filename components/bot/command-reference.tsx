'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Code2, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { CommandEntry } from '@/lib/bot-dashboard/command-reference-data';
import styles from './feature-explorer.module.css';

const nice = (s: string) => s.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
function usage(c: CommandEntry) {
  if (c.subcommands.length) return '/' + c.name + ' ' + c.subcommands[0].name;
  return '/' + c.name + c.options.slice(0, 3).map(opt => opt.required ? ' <' + opt.name + '>' : ' [' + opt.name + ']').join('');
}

function Options({ options }: { options: CommandEntry['options'] }) {
  if (!options.length) return null;
  return (
    <div className={styles.commandOptionList}>
      {options.map((op, i) => (
        <div className={styles.commandOption} key={op.name + i}>
          <span className={styles.commandOptionName}>{op.name}</span>
          <span className={styles.commandOptionType}>{op.type}{op.required ? ' · required' : ' · optional'}</span>
          {op.description ? <span className={styles.commandOptionHelp}>{op.description}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function CommandReference({ commands }: { commands: CommandEntry[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => [...new Set(commands.map(c => c.category))].sort(), [commands]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return commands.filter(c => (category === 'all' || c.category === category) &&
      (!needle || (c.name + ' ' + c.description + ' ' + c.subcommands.map(s => s.name + ' ' + s.description).join(' ')).toLowerCase().includes(needle))
    );
  }, [commands, category, search]);

  return (
    <div className={styles.root}>
      <header className={styles.guideHero}>
        <div className={styles.container}>
          <span className={styles.kicker}><span className={styles.dot} /> CLOUDY BOT / COMMANDS</span>
          <h1>Every command.<br /><span>Clearly explained.</span></h1>
          <p>Explore slash commands defined in the Cloudy bot source. Search their names, required options and subcommands, then use the command in Discord.</p>
          <div className={styles.heroActions}>
            <Link href="/bot" className={styles.primary}>Open Cloudy dashboard <ArrowRight size={16} /></Link>
            <Link href="/bot/features" className={styles.secondary}>All features</Link>
          </div>
        </div>
      </header>
      <main className={styles.container}>
        <div className={styles.guideIntro}>
          <h2>Command reference</h2>
          <p>Choose a category and expand a command to inspect its arguments, subcommands, and default permission requirements.</p>
        </div>
        <div className={styles.browser}>
          <div className={styles.searchRow}>
            <label className={styles.searchBox}>
              <Search size={17} aria-hidden="true" />
              <span className={styles.srOnly}>Search slash commands</span>
              <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search /ban, /ticket, /give..." />
            </label>
            <span className={styles.count}><SlidersHorizontal size={15} /> {filtered.length} of {commands.length} commands</span>
          </div>
          <div className={styles.groups} role="group" aria-label="Command category">
            <button type="button" className={category === 'all' ? styles.groupActive : styles.group} onClick={() => setCategory('all')}>All</button>
            {categories.map(c => <button key={c} type="button" className={category === c ? styles.groupActive : styles.group} onClick={() => setCategory(c)}>{nice(c)}</button>)}
          </div>
        </div>
        <div className={styles.commandGrid}>
          {filtered.map(cmd => (
            <details className={styles.commandCard} key={cmd.name}>
              <summary>
                <div className={styles.commandTop}>
                  <span className={styles.commandIcon}><Code2 size={18}/></span>
                  <span className={styles.commandCategory}>{nice(cmd.category)}</span>
                  <ChevronDown className={styles.commandChevron} size={16}/>
                </div>
                <h3>/{cmd.name}</h3>
                <p>{cmd.description || 'Discord command defined in the Cloudy bot source.'}</p>
                <span className={styles.commandExpand}>How it works <ArrowRight size={14}/></span>
              </summary>
              <div className={styles.commandDetails}>
                <div className={styles.commandUsage}><span>EXAMPLE SYNTAX</span><code>{usage(cmd)}</code></div>
                {cmd.defaultPermission ? <div className={styles.commandPerm}><ShieldCheck size={15}/><span>Default Discord permission: {cmd.defaultPermission.replace(/PermissionFlagsBits\./g, '').replace(/[^a-zA-Z,| ]/g, ' ').trim() || 'Restricted'}</span></div> : null}
                <Options options={cmd.options}/>
                {cmd.subcommands.length ? (
                  <div className={styles.commandSubs}>
                    <h4>Subcommands</h4>
                    {cmd.subcommands.map((sub, i) => <div className={styles.commandSub} key={sub.name + i}>
                      <strong>/{cmd.name} {sub.name}</strong>
                      {sub.description ? <p>{sub.description}</p> : null}
                      <Options options={sub.options}/>
                    </div>)}
                  </div>
                ) : null}
                <p className={styles.commandSource}>Source snapshot: <code>{cmd.source}</code></p>
              </div>
            </details>
          ))}
          {!filtered.length ? <div className={styles.empty}><Search size={24}/><strong>No matching command</strong><p>Try a different keyword or category.</p></div> : null}
        </div>
        <aside className={styles.note}><ShieldCheck size={17}/><div><strong>Source-defined, not guaranteed active on every server.</strong><p>This reference is extracted from Cloudy's GitHub bot source and is not a live Discord command-registration check. Server settings, rollout status, command permissions, and bot deployment can affect availability. No bot commands or permissions are changed by reading this page.</p></div></aside>
      </main>
    </div>
  );
}
