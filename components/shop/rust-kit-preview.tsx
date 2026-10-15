'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Backpack, Box, Boxes, Check, ChevronDown, CircleHelp,
  Crosshair, Hammer, HeartPulse, Layers3, Leaf, Mountain, Package,
  Pickaxe, Search, Server, Settings2, ShieldCheck, Shirt, Timer, Trees, Wrench,
} from 'lucide-react';
import { previewKits, type PreviewKit, type ItemSymbol } from '@/lib/rust-kit-preview';
import styles from './rust-kit-preview.module.css';

const kitIcons = { explorer: Backpack, builder: Hammer, ranger: Crosshair, medic: HeartPulse, resources: Layers3, workshop: Wrench };
const itemIcons: Record<ItemSymbol, typeof Trees> = {
  wood: Trees, stone: Mountain, metal: Layers3, cloth: Shirt, tool: Pickaxe,
  medical: HeartPulse, food: Leaf, gear: Settings2, bow: Crosshair,
};
const categories = ['All kits', 'Essentials', 'Resources', 'Support'] as const;
const money = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

function KitArtwork({ kit }: { kit: PreviewKit }) {
  const Icon = kitIcons[kit.symbol];
  const fillId = `crate-${kit.id}`;
  return (
    <div className={`${styles.artwork} ${styles[kit.symbol]}`} aria-hidden="true">
      <span className={styles.artNumber}>{kit.number}</span>
      <span className={styles.artLabel}>CLOUDY / SUPPLY SERIES</span>
      <div className={styles.artGrid} />
      <div className={styles.orbit} />
      <svg className={styles.crate} viewBox="0 0 400 240" fill="none">
        <defs>
          <linearGradient id={fillId} x1="110" y1="72" x2="300" y2="210" gradientUnits="userSpaceOnUse">
            <stop stopColor="#292b2e" /><stop offset="1" stopColor="#101113" />
          </linearGradient>
        </defs>
        <ellipse cx="207" cy="215" rx="118" ry="13" fill="#000" opacity=".6" />
        <path d="M88 86 189 40 313 83 214 132Z" fill="#323437" stroke="#55575b" />
        <path d="M88 86 214 132 214 217 88 169Z" fill={`url(#${fillId})`} stroke="#55575b" />
        <path d="M214 132 313 83 313 169 214 217Z" fill="#111214" stroke="#44464a" />
        <path d="M109 77 234 123M167 50 292 93M113 95 113 177M190 123 190 207M235 123 235 207M292 94 292 179" stroke="#606267" strokeWidth="7" />
        <path d="M109 77 234 123M167 50 292 93" stroke="#8e8f92" strokeWidth="1" />
        <path d="M88 111 214 157 313 108" stroke="#e51b2e" strokeWidth="4" />
        <path d="M90 143 213 190M216 190 312 143" stroke="#404246" />
        <path d="m121 151 58 21 0 22-58-21Z" fill="#08090a" stroke="#4c4e52" />
        <path d="m129 162 41 15" stroke="#939599" strokeWidth="2" strokeDasharray="2 3" />
        <path d="m260 117 16-8 0 16-16 8Z" fill="#e51b2e" />
      </svg>
      <div className={styles.kitSeal}><Icon size={29} strokeWidth={1.5} /></div>
      <span className={styles.artCaption}>{kit.category} / {kit.number}</span>
    </div>
  );
}

export function KitPreviewCard({ kit, server }: { kit: PreviewKit; server: string }) {
  return (
    <article className={styles.card} aria-labelledby={`title-${kit.id}`}>
      <KitArtwork kit={kit} />
      <div className={styles.cardBody}>
        <div className={styles.cardKicker}><span>{kit.category}</span><span>Kit {kit.number}</span></div>
        <h3 id={`title-${kit.id}`}>{kit.name}</h3>
        <p className={styles.subtitle}>{kit.subtitle}</p>
        <div className={styles.contentsHeading}><Package size={13} /><h4>What&apos;s inside</h4><span>{kit.items.length} items</span></div>
        <ul className={styles.items}>
          {kit.items.map(item => {
            const Icon = itemIcons[item.symbol];
            return <li key={item.name}><span className={styles.itemIcon}><Icon size={17} strokeWidth={1.5} aria-hidden="true" /></span><span>{item.name}<strong>× {item.amount}</strong></span></li>;
          })}
        </ul>
        <div className={styles.priceRow}><div><span>Suggested price</span><strong>{money.format(kit.price)}</strong></div><span className={styles.proposal}>Proposed kit</span></div>
        <details className={styles.details}>
          <summary>Kit details<ChevronDown size={16} aria-hidden="true" /></summary>
          <div><p>{kit.note}</p><p className={styles.limit}><Timer size={14} />Suggested limit: one claim per wipe, for one player on the selected server.</p></div>
        </details>
        <div className={styles.cardServer}><Server size={13} aria-hidden="true" /><span>{server}</span><span>Preview only</span></div>
      </div>
    </article>
  );
}

export default function RustKitPreview() {
  const [server, setServer] = useState(1);
  const [category, setCategory] = useState<(typeof categories)[number]>('All kits');
  const [query, setQuery] = useState('');
  const serverName = `Server ${server}`;
  const search = query.trim().toLowerCase();
  const kits = previewKits.filter(kit =>
    (category === 'All kits' || kit.category === category) &&
    `${kit.name} ${kit.subtitle} ${kit.items.map(item => item.name).join(' ')}`.toLowerCase().includes(search)
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        {/* Existing approved Rust artwork is preserved. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/cloudy-rust-premium-4k.avif" alt="" aria-hidden="true" />
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <Link href="/shop" className={styles.back}><ArrowLeft size={14} />All games</Link>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><span />THE CLOUDY RUST EXPERIENCE</span>
            <h1>Rust store<span>.</span></h1>
            <p>A little support for your next adventure.<br />Choose your server. Find your kit. Make it yours.</p>
          </div>
          <div className={styles.heroIndex}><span>RUST / COLLECTION 01</span><Box size={18} /><strong>Built for<br />the experience.</strong></div>
        </div>
      </section>

      <div className={styles.wrap}>
        <aside className={styles.previewNote} aria-label="Collection preview">
          <span>COLLECTION PREVIEW</span><p>Proposed kit contents and prices. Purchases are not enabled.</p><CircleHelp size={16} aria-hidden="true" />
        </aside>

        <section className={styles.serverSection} aria-labelledby="server-title">
          <div className={styles.sectionTop}>
            <div><span className={styles.sectionNumber}>01 / YOUR SERVER</span><h2 id="server-title">Where do you play?</h2><p>Choose the server for your kit selection.</p></div>
            <div className={styles.selection} role="status"><span>Selected server</span><strong><Server size={15} />{serverName}</strong></div>
          </div>
          <div className={styles.serverGrid} role="group" aria-label="Select your Rust server">
            {[1, 2, 3, 4, 5].map(number => <button key={number} type="button" aria-label={`Select Server ${number}`} aria-pressed={server === number} onClick={() => setServer(number)}>
              <span className={styles.serverIcon}><Server size={19} strokeWidth={1.5} /></span><span><small>CLOUDY RUST</small><strong>Server {number}</strong></span><span className={styles.serverCheck}>{server === number ? <Check size={14} /> : <ArrowRight size={14} />}</span>
            </button>)}
          </div>
        </section>

        <section className={styles.collection} aria-labelledby="kits-title">
          <div className={styles.sectionTop}><div><span className={styles.sectionNumber}>02 / THE COLLECTION</span><h2 id="kits-title">A kit for your next move.</h2><p>Every item listed. Nothing hidden behind a click.</p></div><span className={styles.kitCount}>06<span>PROPOSED KITS</span></span></div>
          <div className={styles.toolbar}>
            <div className={styles.filters} role="group" aria-label="Filter kits by category">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)}>{name}{name === 'All kits' && <span>6</span>}</button>)}</div>
            <div className={styles.search}><Search size={16} aria-hidden="true" /><input type="search" aria-label="Search kits or materials" placeholder="Search kits or materials..." value={query} onChange={event => setQuery(event.target.value)} /></div>
          </div>
          <div className={styles.results} role="status"><span>{kits.length} {kits.length === 1 ? 'kit' : 'kits'}<i />{serverName}</span><span>Suggested contents · one claim per wipe</span></div>
          {kits.length ? <div className={styles.kitGrid}>{kits.map(kit => <KitPreviewCard key={kit.id} kit={kit} server={serverName} />)}</div> : <div className={styles.empty}><Search size={28} /><h3>No kits found</h3><p>Try another kit name, material or category.</p><button type="button" onClick={() => { setQuery(''); setCategory('All kits'); }}>Reset filters<ArrowRight size={15} /></button></div>}
        </section>

        <section className={styles.principles} aria-label="About this collection">
          <div><ShieldCheck size={24} strokeWidth={1.5} /><h3>Support your experience.</h3><p>Modest supplies and practical equipment, with room for your own progression.</p></div>
          <div><Boxes size={24} strokeWidth={1.5} /><h3>Know what you get.</h3><p>See every proposed item and quantity directly on the kit card.</p></div>
          <div><Server size={24} strokeWidth={1.5} /><h3>Your server. Your choice.</h3><p>Five server options. One clear selection throughout the collection.</p></div>
        </section>
        <div className={styles.bottomLine}><span>CLOUDY INC.</span><p>Quality. Precision. Experience.</p><Link href="/support">Need a hand?<ArrowRight size={14} /></Link></div>
      </div>
    </div>
  );
}
