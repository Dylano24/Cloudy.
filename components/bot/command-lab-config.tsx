'use client';

import { useState } from 'react';
import { ChevronDown, CirclePlus, Image as ImageIcon, Layers3, Minus, Palette, RotateCcw, Settings2, SlidersHorizontal, Trash2 } from 'lucide-react';
import styles from './command-lab.module.css';

export type FeatureId = 'ticket' | 'giveaway' | 'verify' | 'poll' | 'blackjack' | 'baccarat' | 'embedbuilder';
export type EmbedField = { id: string; name: string; value: string; inline: boolean };
export type PreviewButton = { id: string; label: string; style: 'primary' | 'secondary' | 'success' | 'danger'; response: string };
export type LabConfig = {
  sideColor: string;
  showLogo: boolean;
  logoUrl: string;
  bannerUrl: string;
  thumbnailUrl: string;
  author: string;
  title: string;
  description: string;
  showFooter: boolean;
  footer: string;
  showButtons: boolean;
  fields: EmbedField[];
  buttons: PreviewButton[];
  labels: Record<string, string>;
  channel: string;
  staffRole: string;
  ticketMode: 'buttons' | 'dropdown';
  ticketCategory: string;
  giveawayPrize: string;
  giveawayDuration: string;
  giveawayWinners: number;
  verificationRole: string;
  pollOne: string;
  pollTwo: string;
  wager: number;
};

export const presets: Record<FeatureId, { name: string; keys: { key: string; fallback: string }[] }> = {
  ticket: { name: 'Ticket panel', keys: [
    {key:'ticketOpen',fallback:'Open a ticket'}, {key:'ticketClaim',fallback:'Claim'}, {key:'ticketClose',fallback:'Close'}, {key:'ticketReopen',fallback:'Reopen'},
  ]},
  giveaway: { name: 'Giveaway', keys: [
    {key:'giveawayJoin',fallback:'Enter giveaway'}, {key:'giveawayLeave',fallback:'Leave giveaway'}, {key:'giveawayDraw',fallback:'Draw winner'}, {key:'giveawayReroll',fallback:'Reroll winner'},
  ]},
  verify: { name:'Verification', keys:[{key:'verify',fallback:'Verify'}] },
  poll: { name:'Community poll', keys:[] },
  blackjack: { name:'Blackjack', keys:[{key:'hit',fallback:'Hit'}, {key:'stand',fallback:'Stand'}, {key:'double',fallback:'Double down'}, {key:'help',fallback:'How to play'}] },
  baccarat: { name:'Baccarat', keys:[{key:'player',fallback:'Player'}, {key:'banker',fallback:'Banker'}, {key:'tie',fallback:'Tie'}, {key:'help',fallback:'How to play'}] },
  embedbuilder: { name:'Embed Builder', keys:[] },
};

export function createDefaultConfig(id: FeatureId): LabConfig {
  const channels: Record<FeatureId,string> = {
    ticket:'support', giveaway:'giveaways', verify:'verification', poll:'polls',
    blackjack:'games', baccarat:'games', embedbuilder:'embeds',
  };
  return {
    sideColor:'#ed2344', showLogo:true, logoUrl:'', bannerUrl:'', thumbnailUrl:'',
    author:'', title:'', description:'', showFooter:true, footer:'Cloudy Inc. · Preview only',
    showButtons:true, fields:[], buttons:id==='embedbuilder'
      ? [{ id:'default',label:'Explore Cloudy',style:'primary',response:'The sample button was pressed.' }]
      : [], labels:{}, channel:channels[id], staffRole:'Support team',
    ticketMode:'buttons', ticketCategory:'Support', giveawayPrize:'Cloudy Premium',
    giveawayDuration:'24 hours', giveawayWinners:1, verificationRole:'Verified',
    pollOne:'Moderation',pollTwo:'Giveaways',wager:100,
  };
}

export function safeImageSrc(url: string) {
  const candidate = url.trim();
  if (!candidate || candidate.length > 2000) return '';
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' && !!parsed.hostname ? parsed.href : '';
  } catch { return ''; }
}
export const goodHex = (value: string) => /^#[\da-fA-F]{6}$/.test(value) ? value : '#ed2344';

function Control({ title, description, children, defaultOpen = false }: { title: string; description?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return <details className={styles.configSection} open={defaultOpen || undefined}>
    <summary><span>{title}<small>{description}</small></span><ChevronDown size={16}/></summary>
    <div className={styles.configSectionBody}>{children}</div>
  </details>;
}

export function LabConfigurator({ id, value, onChange, onReset }: {
  id:FeatureId;
  value:LabConfig;
  onChange:(next:LabConfig)=>void;
  onReset:()=>void;
}) {
  const [sequence, setSequence] = useState(1);
  const change = <K extends keyof LabConfig>(key:K, next:LabConfig[K]) => onChange({ ...value, [key]:next });
  const updateField = (uid:string, patch:Partial<EmbedField>) => change('fields',value.fields.map(f => f.id===uid ? {...f,...patch} : f));
  const updateButton = (uid:string, patch:Partial<PreviewButton>) => change('buttons',value.buttons.map(b=>b.id===uid?{...b,...patch}:b));
  const label = (key:string,val:string) => change('labels',{...value.labels,[key]:val});
  const addField = () => {
    if(value.fields.length>=6) return;
    const next=sequence+1;setSequence(next);
    change('fields',[...value.fields,{id:'f'+next,name:'New field',value:'Field value',inline:true}]);
  };
  const addButton = () => {
    if(value.buttons.length>=5)return;
    const next=sequence+1;setSequence(next);
    change('buttons',[...value.buttons,{id:'b'+next,label:'New button',style:'secondary',response:'Sample button pressed.'}]);
  };

  return <section className={styles.configPanel} aria-label="Customize this preview">
    <div className={styles.configHeading}>
      <div><span className={styles.configKicker}><SlidersHorizontal size={14}/> LIVE CONTROLS</span><h2>Customize {presets[id].name}</h2><p>Changes update the sample embed immediately and remain in this browser session.</p></div>
      <button type="button" className={styles.configReset} onClick={onReset} title="Restore the original configuration for this module"><RotateCcw size={15}/> Reset</button>
    </div>

    <Control title="Appearance" description="Side color, Cloudy logo, thumbnail and banner" defaultOpen>
      <div className={styles.configColorRow}>
        <label className={styles.configInput}>Side color
          <span className={styles.colorPair}><input type="color" aria-label="Select side color" value={goodHex(value.sideColor)} onChange={e=>change('sideColor',e.target.value)}/><input type="text" maxLength={7} value={value.sideColor} onChange={e=>change('sideColor',e.target.value)} aria-label="Side color hex" placeholder="#ed2344"/></span>
        </label>
        <div className={styles.colorSwatches} aria-label="Quick accent colors">
          {['#ed2344','#18d39c','#5865f2','#f59e0b','#ffffff','#9b5de5'].map(c=><button type="button" key={c} aria-label={'Set color '+c} title={c} className={styles.swatch} style={{background:c}} onClick={()=>change('sideColor',c)}/>)}
        </div>
      </div>
      <label className={styles.configToggle}><input type="checkbox" checked={value.showLogo} onChange={e=>change('showLogo',e.target.checked)}/> Show Cloudy logo <span>Displayed beside the bot message</span></label>
      <label className={styles.configInput}>Custom logo URL <small>Optional. Leave blank for the original Cloudy logo.</small><input type="url" value={value.logoUrl} placeholder="https://example.com/logo.png" onChange={e=>change('logoUrl',e.target.value)} /></label>
      <label className={styles.configInput}>Thumbnail URL <small>Small image inside the embed</small><input type="url" value={value.thumbnailUrl} placeholder="https://example.com/thumbnail.png" onChange={e=>change('thumbnailUrl',e.target.value)}/></label>
      <label className={styles.configInput}>Banner / GIF URL <small>Media stays inside the embed</small><input type="url" value={value.bannerUrl} placeholder="https://example.com/banner.gif" onChange={e=>change('bannerUrl',e.target.value)}/></label>
      {(value.logoUrl&&!safeImageSrc(value.logoUrl))||(value.thumbnailUrl&&!safeImageSrc(value.thumbnailUrl))||(value.bannerUrl&&!safeImageSrc(value.bannerUrl))?<div className={styles.configNote}>Only valid HTTPS image URLs appear in the preview.</div>:null}
    </Control>

    <Control title="Text and footer" description="Author, title, description and lower text">
      <label className={styles.configInput}>Author line<input type="text" maxLength={120} value={value.author} onChange={e=>change('author',e.target.value)} placeholder="Automatic Cloudy category label"/></label>
      <label className={styles.configInput}>Embed title <small>Leave empty to follow the interactive result automatically</small><input type="text" maxLength={256} value={value.title} onChange={e=>change('title',e.target.value)} placeholder="Automatic title"/></label>
      <label className={styles.configInput}>Description <small>Leave empty to show the current command response</small><textarea maxLength={4096} rows={4} value={value.description} onChange={e=>change('description',e.target.value)} placeholder="Automatic command description"/></label>
      <label className={styles.configToggle}><input type="checkbox" checked={value.showFooter} onChange={e=>change('showFooter',e.target.checked)}/> Show footer</label>
      {value.showFooter&&<label className={styles.configInput}>Footer text<input type="text" maxLength={200} value={value.footer} onChange={e=>change('footer',e.target.value)} placeholder="Cloudy Inc."/></label>}
      <label className={styles.configInput}>Preview channel <input type="text" maxLength={36} value={value.channel} onChange={e=>change('channel',e.target.value.replace(/[^a-z0-9-_]/gi,'-').toLowerCase())}/></label>
    </Control>

    <Control title="Custom fields" description="Up to six rich embed fields">
      <div className={styles.configActionsRow}><span>{value.fields.length} / 6 fields</span><button type="button" onClick={addField} disabled={value.fields.length>=6}><CirclePlus size={15}/> Add field</button></div>
      {value.fields.map((f,i)=><div className={styles.configField} key={f.id}>
        <div className={styles.configFieldHeading}><strong>Field {i+1}</strong><button aria-label={'Delete field '+(i+1)} type="button" onClick={()=>change('fields',value.fields.filter(x=>x.id!==f.id))}><Trash2 size={15}/></button></div>
        <label className={styles.configInput}>Name<input type="text" maxLength={256} value={f.name} onChange={e=>updateField(f.id,{name:e.target.value})}/></label>
        <label className={styles.configInput}>Value<textarea maxLength={1024} rows={2} value={f.value} onChange={e=>updateField(f.id,{value:e.target.value})}/></label>
        <label className={styles.configToggle}><input type="checkbox" checked={f.inline} onChange={e=>updateField(f.id,{inline:e.target.checked})}/> Inline field</label>
      </div>)}
      {!value.fields.length&&<p className={styles.configEmpty}>No additional fields. Add one to see it appear inside the embed.</p>}
    </Control>

    <Control title="Module settings" description="Change the values used by this command preview" defaultOpen>
      {id==='ticket'&&<>
        <label className={styles.configInput}>Panel style<select value={value.ticketMode} onChange={e=>change('ticketMode',e.target.value as LabConfig['ticketMode'])}><option value="buttons">Buttons</option><option value="dropdown">Dropdown</option></select></label>
        <label className={styles.configInput}>Staff role<input type="text" maxLength={60} value={value.staffRole} onChange={e=>change('staffRole',e.target.value)}/></label>
        <label className={styles.configInput}>Ticket category<input type="text" maxLength={60} value={value.ticketCategory} onChange={e=>change('ticketCategory',e.target.value)}/></label>
      </>}
      {id==='giveaway'&&<>
        <label className={styles.configInput}>Prize<input type="text" maxLength={100} value={value.giveawayPrize} onChange={e=>change('giveawayPrize',e.target.value)}/></label>
        <label className={styles.configInput}>Duration<input type="text" maxLength={40} value={value.giveawayDuration} onChange={e=>change('giveawayDuration',e.target.value)}/></label>
        <label className={styles.configInput}>Winners<input type="number" min={1} max={10} value={value.giveawayWinners} onChange={e=>change('giveawayWinners',Math.min(10,Math.max(1,Number(e.target.value)||1)))}/></label>
      </>}
      {id==='verify'&&<label className={styles.configInput}>Role granted on verification<input type="text" maxLength={60} value={value.verificationRole} onChange={e=>change('verificationRole',e.target.value)}/></label>}
      {id==='poll'&&<>
        <label className={styles.configInput}>First poll option<input type="text" maxLength={70} value={value.pollOne} onChange={e=>change('pollOne',e.target.value)}/></label>
        <label className={styles.configInput}>Second poll option<input type="text" maxLength={70} value={value.pollTwo} onChange={e=>change('pollTwo',e.target.value)}/></label>
      </>}
      {(id==='blackjack'||id==='baccarat')&&<label className={styles.configInput}>Sample stake <small>No money or currency is ever deducted</small><input type="number" min={0} max={9999999} value={value.wager} onChange={e=>change('wager',Math.min(9999999,Math.max(0,Number(e.target.value)||0)))}/></label>}
      {id==='embedbuilder'&&<div className={styles.configNote}>The Embed Builder uses appearance, text, footer, media, fields and custom buttons above and below. Edits are local and update the same preview card.</div>}
    </Control>

    <Control title="Buttons and interactions" description="Control labels and try the responses">
      <label className={styles.configToggle}><input type="checkbox" checked={value.showButtons} onChange={e=>change('showButtons',e.target.checked)}/> Show interactive buttons</label>
      {presets[id].keys.map(({key,fallback})=><label className={styles.configInput} key={key}>{fallback} label<input type="text" maxLength={80} value={value.labels[key] ?? fallback} onChange={e=>label(key,e.target.value)}/></label>)}
      {id==='embedbuilder'&&<>
        <div className={styles.configActionsRow}><span>{value.buttons.length} / 5 custom buttons</span><button type="button" disabled={value.buttons.length>=5} onClick={addButton}><CirclePlus size={15}/> Add button</button></div>
        {value.buttons.map((button,i)=><div className={styles.configField} key={button.id}>
          <div className={styles.configFieldHeading}><strong>Button {i+1}</strong><button type="button" aria-label={'Delete button '+(i+1)} onClick={()=>change('buttons',value.buttons.filter(b=>b.id!==button.id))}><Trash2 size={15}/></button></div>
          <label className={styles.configInput}>Label<input maxLength={80} value={button.label} onChange={e=>updateButton(button.id,{label:e.target.value})}/></label>
          <label className={styles.configInput}>Style<select value={button.style} onChange={e=>updateButton(button.id,{style:e.target.value as PreviewButton['style']})}><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="success">Success</option><option value="danger">Danger</option></select></label>
          <label className={styles.configInput}>Click response<input maxLength={150} value={button.response} onChange={e=>updateButton(button.id,{response:e.target.value})}/></label>
        </div>)}
      </>}
      <p className={styles.configNote}>Buttons work inside this browser session. They do not register Discord components or alter bot permissions.</p>
    </Control>
  </section>;
}
