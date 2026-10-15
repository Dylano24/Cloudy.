'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Search, Server, Package, Crosshair, Hammer, HeartPulse, Boxes, Wrench } from 'lucide-react';
import { previewKits, rustItems, type PreviewKit, type InventoryArea } from '@/lib/rust-kit-preview';
import styles from './rust-kit-preview.module.css';

const categories = ['All kits', 'Subscriptions', 'Claim once', 'Lifetime'] as const;
const kitIcons = { assault: Crosshair, tactical: Crosshair, builder: Hammer, resources: Boxes, medic: HeartPulse, components: Wrench };
const inventoryAreas: readonly { key: InventoryArea; name: string; slots: number }[] = [
  { key: 'wear', name: 'Wear', slots: 7 },
  { key: 'main', name: 'Main', slots: 12 },
  { key: 'belt', name: 'Belt', slots: 6 },
];
const quantity = new Intl.NumberFormat('en-GB');

export function KitInventory({ kit }: { kit: PreviewKit }) {
  return (
    <div className={styles.inventory} aria-label={`${kit.name} contents`}>
      {inventoryAreas.map(area => {
        const items = kit.items.filter(item => item.area === area.key);
        if (!items.length) return null;
        const visibleSlots = Math.ceil(items.length / 4) * 4;
        return (
          <section className={styles.inventoryArea} key={area.key} aria-label={area.name}>
            <h4>{area.name}</h4>
            <ul className={styles.slots}>
              {Array.from({ length: visibleSlots }, (_, index) => {
                const item = items[index];
                if (!item) return <li key={`empty-${index}`} className={styles.emptySlot} aria-hidden="true"><span /></li>;
                const data = rustItems[item.shortname];
                return (
                  <li key={item.shortname} className={styles.slot} title={`${data.name} × ${quantity.format(item.amount)}`}>
                    <span className={styles.slotImage}>
                      <Image src={data.image} alt="" width={80} height={80} sizes="(max-width: 700px) 70px, 80px" />
                      <strong>×{quantity.format(item.amount)}</strong>
                    </span>
                    <span className={styles.itemName}>{data.name}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function KitPreviewCard({ kit, server }: { kit: PreviewKit; server: string }) {
  const Icon = kitIcons[kit.id as keyof typeof kitIcons] ?? Package;
  return (
    <article className={`${styles.card} cloudy-traced-panel`} aria-labelledby={`title-${kit.id}`}>
      <div className={styles.artwork} aria-hidden="true">
        <Image src="/images/cloudy-rust-premium-4k.avif" alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 390px" className={styles.cardPhoto} />
        <div className={styles.artShade} />
        <span className={styles.kitSeal}><Icon size={26} strokeWidth={1.5} /></span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardKicker}><span>{kit.category}</span></div>
        <h3 id={`title-${kit.id}`}>{kit.name}</h3>
        <details className={styles.kitDetails}>
          <summary>View details<ChevronDown size={16} aria-hidden="true" /></summary>
          <KitInventory kit={kit} />
        </details>
        <div className={styles.priceRow}><span>Price</span><strong>{kit.price === null ? '—' : `€${kit.price.toFixed(2)}`}</strong></div>
        <div className={styles.cardServer}><Server size={13} aria-hidden="true" /><span>{server}</span></div>
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
    `${kit.name} ${kit.items.map(item => rustItems[item.shortname].name).join(' ')}`.toLowerCase().includes(search)
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/cloudy-rust-premium-4k.avif" alt="" aria-hidden="true" />
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <Link href="/shop" className={styles.back}><ArrowLeft size={14} />All games</Link>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><span />THE CLOUDY RUST EXPERIENCE</span>
            <h1>Rust store<span>.</span></h1>
          </div>
        </div>
      </section>

      <div className={styles.wrap}>
        <section className={styles.serverSection} aria-labelledby="server-title">
          <div className={styles.sectionTop}>
            <div><span className={styles.sectionNumber}>YOUR SERVER</span><h2 id="server-title">Where do you play?</h2><p>Choose the server for your kit selection.</p></div>
            <div className={styles.selection} role="status"><span>Selected server</span><strong><Server size={15} />{serverName}</strong></div>
          </div>
          <div className={styles.serverGrid} role="group" aria-label="Select your Rust server">
            {[1, 2, 3, 4, 5].map(number => <button key={number} type="button" aria-label={`Select Server ${number}`} aria-pressed={server === number} onClick={() => setServer(number)}>
              <span className={styles.serverIcon}><Server size={19} strokeWidth={1.5} /></span><span><small>CLOUDY RUST</small><strong>Server {number}</strong></span>{server === number && <span className={styles.serverCheck}><Check size={14} /></span>}
            </button>)}
          </div>
        </section>

        <section className={styles.collection} aria-labelledby="kits-title">
          <div className={styles.sectionTop}><div><h2 id="kits-title">Choose your kit</h2></div><span className={styles.kitCount}>06<span>KITS</span></span></div>
          <div className={styles.toolbar}>
            <div className={styles.filters} role="group" aria-label="Filter kits by category">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)}>{name}{name === 'All kits' && <span>6</span>}</button>)}</div>
            <div className={styles.search}><Search size={16} aria-hidden="true" /><input type="search" aria-label="Search kits" placeholder="Search kits" value={query} onChange={event => setQuery(event.target.value)} /></div>
          </div>
          <div className={styles.results} role="status"><span>{kits.length} {kits.length === 1 ? 'kit' : 'kits'}<i />{serverName}</span></div>
          {kits.length ? <div className={styles.kitGrid}>{kits.map(kit => <KitPreviewCard key={kit.id} kit={kit} server={serverName} />)}</div> : <div className={styles.empty}><Search size={28} /><h3>No kits found</h3><button type="button" onClick={() => { setQuery(''); setCategory('All kits'); }}>Reset filters<ArrowRight size={15} /></button></div>}
        </section>
      </div>
    </div>
  );
}
