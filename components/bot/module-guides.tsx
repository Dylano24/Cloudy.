'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Info, Search, Settings2, ShieldCheck, TerminalSquare } from 'lucide-react';
import { ModuleIcon } from './module-icon';
import styles from './feature-explorer.module.css';

export type GuideEntry = {
  id: string;
  name: string;
  summary: string;
  group: string;
  icon: string;
  kind: 'settings' | 'insight';
  access: 'manage-server' | 'owner-role';
  note?: string;
  sections: { title: string; description?: string; fields: { label: string; type: string; help?: string }[] }[];
};

export function ModuleGuides({ modules, groups }: { modules: GuideEntry[]; groups: { id: string; name: string }[] }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const filtered = useMemo(() => modules.filter(m =>
    (group === 'all' || m.group === group) &&
    (!query.trim() || (m.name + ' ' + m.summary + ' ' + m.sections.map(s => s.title + ' ' + s.fields.map(f => f.label).join(' ')).join(' ')).toLowerCase().includes(query.trim().toLowerCase()))
  ), [group, modules, query]);

  return (
    <div className={styles.root}>
      <header className={styles.guideHero}>
        <div className={styles.container}>
          <span className={styles.kicker}><span className={styles.dot} /> CLOUDY BOT / DOCUMENTATION</span>
          <h1>Know every <span>setting.</span></h1>
          <p>Practical reference for the modules Cloudy's website currently exposes. Descriptions and setting names come from the dashboard's module registry — not another bot's command list.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/bot">Open your dashboard <ArrowRight size={16} /></Link>
            <Link className={styles.secondary} href="/bot/features">Browse features</Link>
          </div>
        </div>
      </header>
      <main className={styles.container}>
        <div className={styles.guideIntro}><h2>Configuration guide</h2><p>Expand a module to see the fields on its current website page. To save real changes, sign in and choose a Discord server.</p></div>
        <div className={styles.browser}>
          <label className={styles.searchBox}>
            <Search size={17} />
            <span className={styles.srOnly}>Search module documentation</span>
            <input value={query} onChange={e => setQuery(e.target.value)} type="search" placeholder="Search modules and setting names..." />
          </label>
          <div className={styles.groups} role="group" aria-label="Filter guide by category">
            <button type="button" className={group === 'all' ? styles.groupActive : styles.group} onClick={() => setGroup('all')}>All</button>
            {groups.map(g => <button key={g.id} type="button" className={group === g.id ? styles.groupActive : styles.group} onClick={() => setGroup(g.id)}>{g.name}</button>)}
          </div>
        </div>
        <div className={styles.guideCount}>{filtered.length} module guides</div>
        <div className={styles.guideList}>
          {filtered.map(module => (
            <details id={module.id} key={module.id} className={styles.guideItem}>
              <summary>
                <span className={styles.icon}><ModuleIcon name={module.icon} size={21} /></span>
                <span className={styles.guideSummary}><strong>{module.name}</strong><small>{module.summary}</small></span>
                <span className={styles.guideStatus}>{module.kind === 'settings' ? 'Website editor' : 'Discord-managed'}</span>
                <ChevronDown size={17} className={styles.guideChevron} />
              </summary>
              <div className={styles.guideBody}>
                <div className={styles.guideAccess}>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{module.access === 'owner-role' ? 'Restricted owner-role module. The bot enforces access.' : 'Server Owner, Administrator or Manage Server access. Additional Discord checks may apply.'}</span>
                </div>
                {module.note ? <p className={styles.guideNote}><Info size={15} aria-hidden="true" /> {module.note}</p> : null}
                {module.kind === 'insight' ? (
                  <div className={styles.guideInsight}><TerminalSquare size={19} /><div><strong>Discord-managed view</strong><p>This module currently displays information from Cloudy. It has no editable website fields in the existing registry. Bot actions stay in Discord until a real integration is added.</p></div></div>
                ) : (
                  module.sections.map(section => (
                    <section className={styles.guideSection} key={section.title}>
                      <h3>{section.title}</h3>
                      {section.description ? <p>{section.description}</p> : null}
                      <div className={styles.guideFields}>
                        {section.fields.map(field => (
                          <div className={styles.guideField} key={field.label + field.type}>
                            <div><strong>{field.label}</strong><span>{field.help || 'Configured in the Cloudy dashboard.'}</span></div>
                            <code>{field.type}</code>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))
                )}
                <div className={styles.guideFooter}><Settings2 size={15} /><span>Cloudy only writes settings after an authorized Save in the authenticated dashboard.</span><Link href="/bot">Choose server <ArrowRight size={14} /></Link></div>
              </div>
            </details>
          ))}
          {!filtered.length && <div className={styles.empty}><Search size={24} /><strong>No module matches</strong><p>Try another search or category.</p></div>}
        </div>
        <aside className={styles.note}><Info size={17} /><div><strong>Not a slash-command registry.</strong><p>Module configuration is documented here. Per-command arguments, cooldowns and permission rules must be verified against Cloudy's actual registered Discord commands before a separate command reference can accurately list them.</p></div></aside>
      </main>
    </div>
  );
}
