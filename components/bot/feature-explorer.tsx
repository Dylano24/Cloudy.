'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, CircleHelp, Search, SlidersHorizontal, X } from 'lucide-react';
import { ModuleIcon } from './module-icon';
import type { PublicFeature } from '@/lib/bot-dashboard/public-feature-catalog';
import styles from './feature-explorer.module.css';

type Group = { id: string; name: string };

const statusText = {
  settings: 'Website settings',
  discord: 'Discord-managed',
  integration: 'Website integration needed',
} as const;
type View = 'all' | 'settings' | 'discord' | 'integration';

export function FeatureExplorer({ items, groups }: { items: PublicFeature[]; groups: Group[] }) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('all');
  const [group, setGroup] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const available = items.filter(i => i.status !== 'integration').length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i =>
      (view === 'all' || i.status === view) &&
      (group === 'all' || i.group === group) &&
      (!q || (i.name + ' ' + i.summary + ' ' + i.explanation).toLowerCase().includes(q))
    );
  }, [group, items, search, view]);

  const displayGroups = group === 'all' ? groups : groups.filter(g => g.id === group);
  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.ambient} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.kicker}><span className={styles.dot} /> CLOUDY BOT / FEATURES</div>
          <h1>One bot.<br /><span>Every detail matters.</span></h1>
          <p>Discover the tools behind Cloudy, configure what's already connected, and see what still needs a website integration. No fake switches. No invented server statistics.</p>
          <div className={styles.heroActions}>
            <Link href="/bot" className={styles.primary}>Open dashboard <ArrowRight size={17} /></Link>
            <Link href="/bot#cloudy-demos" className={styles.secondary}>Try interactive previews</Link>
          </div>
          <div className={styles.metrics}>
            <div><strong>{available}</strong><span>Dashboard modules</span></div>
            <div><strong>{items.filter(i => i.status === 'settings').length}</strong><span>Settings editors</span></div>
            <div><strong>{items.filter(i => i.status === 'discord').length}</strong><span>Discord-managed views</span></div>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.introduction}>
          <span className={styles.kicker}><span className={styles.dot} /> EXPLORE CLOUDY</span>
          <h2>Built for your <span>community.</span></h2>
          <p>One consistent place to find your server tools. This catalog is generated from the current Cloudy dashboard registry, with future integrations labeled clearly.</p>
        </section>

        <section className={styles.browser} aria-label="Filter Cloudy features">
          <div className={styles.searchRow}>
            <label className={styles.searchBox}>
              <Search size={18} aria-hidden="true" />
              <span className={styles.srOnly}>Search features</span>
              <input type="search" placeholder="Search features, tools or settings..." value={search} onChange={e => setSearch(e.target.value)} />
              {search ? <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button> : null}
            </label>
            <div className={styles.count}><SlidersHorizontal size={15} aria-hidden="true" /> {visible.length} of {items.length} areas</div>
          </div>
          <div className={styles.filters} role="group" aria-label="Feature availability">
            {([
              ['all', 'Everything'],
              ['settings', 'Website settings'],
              ['discord', 'Discord-managed'],
              ['integration', 'Integration needed'],
            ] as const).map(([id, name]) =>
              <button type="button" key={id} className={view === id ? styles.filterActive : styles.filter} onClick={() => setView(id)} aria-pressed={view === id}>{name}</button>
            )}
          </div>
          <div className={styles.groups} role="group" aria-label="Feature category">
            <button type="button" className={group === 'all' ? styles.groupActive : styles.group} onClick={() => setGroup('all')}>All categories</button>
            {groups.map(g => <button type="button" key={g.id} className={group === g.id ? styles.groupActive : styles.group} onClick={() => setGroup(g.id)}>{g.name}</button>)}
          </div>
        </section>

        <div className={styles.sections}>
          {displayGroups.map(g => {
            const children = visible.filter(f => f.group === g.id);
            if (!children.length) return null;
            return <section className={styles.section} key={g.id} aria-labelledby={'cat-' + g.id}>
              <div className={styles.sectionHeading}>
                <div><span className={styles.groupIndex}>CLOUDY / {String(groups.findIndex(x => x.id === g.id) + 1).padStart(2, '0')}</span><h2 id={'cat-' + g.id}>{g.name}</h2></div>
                <span className={styles.sectionCount}>{children.length} {children.length === 1 ? 'area' : 'areas'}</span>
              </div>
              <div className={styles.cards}>
                {children.map(feature => {
                  const active = expanded === feature.id;
                  return <article className={styles.card} key={feature.id} data-state={feature.status}>
                    <div className={styles.cardUpper}>
                      <span className={styles.icon}><ModuleIcon name={feature.icon} size={22} /></span>
                      <span className={styles.status} data-state={feature.status}><span />{statusText[feature.status]}</span>
                    </div>
                    <h3>{feature.name}</h3>
                    <p>{feature.summary}</p>
                    <div className={styles.cardBottom}>
                      <button type="button" aria-expanded={active} aria-controls={'detail-' + feature.id} onClick={() => setExpanded(active ? null : feature.id)}>
                        How it works <ChevronDown size={15} className={active ? styles.rotate : ''} />
                      </button>
                      {feature.status === 'integration' ? <span className={styles.pending}>Not connected</span> :
                        <Link href="/bot">Open dashboard <ArrowRight size={15} /></Link>}
                    </div>
                    {active ? <div id={'detail-' + feature.id} className={styles.details}>
                      <CircleHelp size={15} aria-hidden="true" /><span>{feature.explanation}</span>
                    </div> : null}
                  </article>;
                })}
              </div>
            </section>;
          })}
          {!visible.length ? <div className={styles.empty}><Search size={24} /><strong>No matching tools</strong><p>Try another category or search term.</p><button type="button" onClick={() => { setSearch(''); setGroup('all'); setView('all'); }}>Reset filters</button></div> : null}
        </div>

        <aside className={styles.note}>
          <Check size={17} aria-hidden="true" />
          <div><strong>Built on real permissions.</strong><p>Settings can only be saved by a Discord server owner, administrator, or someone with Manage Server. Some tools require additional roles. Website-only integrations are not enabled until Cloudy's bot API can perform them safely.</p></div>
        </aside>
        <footer className={styles.bottomCta}>
          <span className={styles.kicker}><span className={styles.dot} /> TAKE CONTROL</span>
          <h2>Your server. Your way.</h2>
          <p>Manage the server you already run. No setup changes are made just by browsing.</p>
          <Link href="/bot" className={styles.primary}>Go to Cloudy dashboard <ArrowRight size={17} /></Link>
        </footer>
      </main>
    </div>
  );
}
