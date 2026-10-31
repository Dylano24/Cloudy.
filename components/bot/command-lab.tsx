'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Command, Gift, LockKeyhole, Play, RefreshCcw, ShieldCheck, Sparkles, Terminal, Ticket, X } from 'lucide-react';
import type { CommandEntry } from '@/lib/bot-dashboard/command-reference-data';
import styles from './command-lab.module.css';
import { createDefaultConfig, goodHex, LabConfigurator, safeImageSrc, type LabConfig } from './command-lab-config';

type Stage = 'fresh' | 'ticket_open' | 'ticket_claimed' | 'ticket_closed' | 'ticket_reopened' | 'giveaway_joined' | 'giveaway_ended' | 'giveaway_rerolled' | 'verified' | 'poll_c1' | 'poll_c2' | 'blackjack_hit' | 'blackjack_stand' | 'blackjack_double' | 'baccarat_player' | 'baccarat_banker' | 'baccarat_tie' | 'embed_edit' | 'embed_saved';
type FeatureId = 'ticket' | 'giveaway' | 'verify' | 'poll' | 'blackjack' | 'baccarat' | 'embedbuilder';
type Feature = { id: FeatureId; slash: string; name: string; topic: string; description: string; channel: string };
const FEATURES: Feature[] = [
  { id: 'ticket', slash: '/ticket setup', name: 'Ticket panel', topic: 'Support', description: 'Open, claim, close and reopen a ticket.', channel: 'support' },
  { id: 'giveaway', slash: '/gcreate', name: 'Giveaway', topic: 'Community', description: 'Join, draw a winner and reroll.', channel: 'giveaways' },
  { id: 'verify', slash: '/verification setup', name: 'Verification', topic: 'Security', description: 'Try the verification button.', channel: 'verification' },
  { id: 'poll', slash: '/poll', name: 'Community poll', topic: 'Utility', description: 'Vote and see the results update.', channel: 'polls' },
  { id: 'blackjack', slash: '/blackjack', name: 'Blackjack', topic: 'Economy', description: 'Play a simulated hand with buttons.', channel: 'games' },
  { id: 'baccarat', slash: '/baccarat', name: 'Baccarat', topic: 'Economy', description: 'Choose a side in a simulated round.', channel: 'games' },
  { id: 'embedbuilder', slash: '/embedbuilder', name: 'Embed Builder', topic: 'Tools', description: 'Edit a mock embed and preview its saved state.', channel: 'embeds' },
];
const lookup = Object.fromEntries(FEATURES.map(x => [x.id,x])) as Record<FeatureId, Feature>;
const logo = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';
const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g,' ');
const INITIAL = '/ticket setup';
const commandsForSlash = (command: string) => command.trim().replace(/^\//, '').split(/\s+/)[0]?.toLowerCase();

function DemoButton({ children, onClick, neutral = false, disabled = false }: { children: React.ReactNode; onClick: () => void; neutral?: boolean; disabled?: boolean }) {
  return <button type="button" className={neutral ? styles.controlNeutral : styles.controlPrimary} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function CommandLab({ commands }: { commands: CommandEntry[] }) {
  const [input,setInput] = useState(INITIAL);
  const [active,setActive] = useState<FeatureId>('ticket');
  const [command,setCommand] = useState(INITIAL);
  const [stage,setStage] = useState<Stage>('fresh');
  const [revision,setRevision] = useState(1);
  const [invocations,setInvocations] = useState(1);
  const [entry,setEntry] = useState('');
  const [showHelp,setShowHelp] = useState(false);
  const [configurations, setConfigurations] = useState<Record<FeatureId, LabConfig>>(() => Object.fromEntries(FEATURES.map(f => [f.id, createDefaultConfig(f.id)])) as Record<FeatureId, LabConfig>);
  const config = configurations[active];
  const updateConfig = (next: LabConfig) => setConfigurations(previous => ({ ...previous, [active]:next }));
  const resetConfig = () => setConfigurations(previous => ({ ...previous, [active]: createDefaultConfig(active) }));
  const btn = (key:string, fallback:string) => config.labels[key]?.trim() || fallback;

  const [notice,setNotice] = useState('Choose a button in the preview to see how the interaction changes.');
  const [showPalette,setShowPalette] = useState(false);
  const formRef = useRef<HTMLInputElement>(null);
  const chosen=lookup[active];

  const filtered = useMemo(() => {
    const query = clean(input).replace(/^\//,'');
    return FEATURES.filter(f => f.slash.toLowerCase().includes(query) || f.name.toLowerCase().includes(query)).slice(0,7);
  },[input]);

  const commandInfo = useMemo(() => commands.find(c => c.name === commandsForSlash(command)),[command,commands]);
  const options = commandInfo?.subcommands?.length ? commandInfo.subcommands.slice(0,5).map(s => s.name) : (commandInfo?.options||[]).slice(0,5).map(o=>o.name);

  function launch(value: string) {
    const normalized = clean(value);
    const found = FEATURES.find(f => clean(f.slash) === normalized) || FEATURES.find(f=>clean(f.slash).split(' ')[0]===normalized);
    if (found) {
      setActive(found.id);
      setCommand(found.slash);
      setInput(found.slash);
      setStage('fresh'); setShowHelp(false);
      setInvocations(x=>x+1); setRevision(1); setShowPalette(false); setEntry('');
      setNotice('Preview started. Interact with Cloudy below.');
      return;
    }
    // Only the seven explicitly designed scenarios have interactive outputs.
    // Never fabricate a Discord response for another command.
    setNotice('This sandbox has seven interactive scenarios. Pick one from the command palette.');
    setShowPalette(true);
    setEntry('Choose a supported preview command. No real Discord action was attempted.');
  }

  function reset() {
    setStage('fresh');setRevision(1);setShowHelp(false);
    setNotice('Simulation reset. You can run the command again or try the buttons.');
    setEntry('');
  }
  function action(next: Stage, explanation: string) {
    setStage(next);setRevision(v=>v+1);setEntry(explanation);
  }

  const isTicket = active === 'ticket',isGiveaway = active === 'giveaway', isVerify=active==='verify',isPoll=active==='poll',isBlackjack=active==='blackjack',isBaccarat=active==='baccarat',isEmbed=active==='embedbuilder';
  const ticketOpen=stage==='ticket_open'||stage==='ticket_claimed'||stage==='ticket_reopened';
  const ticketClosed=stage==='ticket_closed';
  const giveawayFinished=stage==='giveaway_ended'||stage==='giveaway_rerolled';
  const blackjackDone=stage==='blackjack_stand'||stage==='blackjack_double';
  const baccaratDone=stage.startsWith('baccarat_');
  const dynamicLabel = isTicket ? (stage==='fresh' ? 'Create your support request' : ticketClosed ? 'Ticket closed' : 'Ticket opened')
    : isGiveaway ? (giveawayFinished ? 'Giveaway ended' : 'Community giveaway')
    : isVerify ? (stage==='verified' ? 'Verification complete' : 'Verify your account')
    : isPoll ? 'Community poll'
    : isBlackjack ? (blackjackDone ? 'Round complete' : 'Blackjack')
    : isBaccarat ? (baccaratDone ? 'Round complete' : 'Baccarat')
    : 'Welcome to Cloudy';
  const statusLabel = config.title.trim() || dynamicLabel;
  const appearanceColor = goodHex(config.sideColor);
  const banner = safeImageSrc(config.bannerUrl);
  const thumbnail = safeImageSrc(config.thumbnailUrl);
  const previewLogo = safeImageSrc(config.logoUrl) || logo;

  return <div className={styles.root}>
    <div className={styles.ambient} aria-hidden="true" />
    <div className={styles.container}>
      <nav className={styles.breadcrumb}><Link href="/bot"><ArrowLeft size={15}/> Back to Cloudy Bot</Link><span>/</span><span>Preview session</span></nav>
      <header className={styles.heading}>
        <div className={styles.eyebrow}><Sparkles size={15}/> CLOUDY / INTERACTIVE LAB</div>
        <h1>Try it.<br/><span>Before you use it.</span></h1>
        <p>Run a sample Cloudy slash command, see a Discord-style embed appear and press real interactive demo buttons. Experiment without touching your server.</p>
        <div className={styles.safety}><ShieldCheck size={16}/><span>Local preview session · Sample data only · Nothing is sent to Discord</span></div>
      </header>
      <div className={styles.workspace}>
        <section className={styles.terminal}>
          <div className={styles.panelHeader}><span><Terminal size={17}/> Command console</span><span className={styles.mode}>INTERACTIVE SANDBOX</span></div>
          <div className={styles.consoleBody}>
            <div className={styles.consoleIntro}>Pick a supported command or type its slash name. The preview responds instantly and stays on this page.</div>
            <form className={styles.commandEntry} onSubmit={e=>{e.preventDefault();launch(input);}}>
              <span className={styles.prompt} aria-hidden="true"><Command size={17}/></span>
              <input ref={formRef} autoCapitalize="none" autoComplete="off" spellCheck={false} aria-label="Slash command" value={input} onChange={v=>{setInput(v.target.value);setShowPalette(true);}} onFocus={()=>setShowPalette(true)} placeholder="/ticket setup" />
              <button type="submit" className={styles.run}><Play size={16} fill="currentColor"/> Run</button>
            </form>
            {showPalette && <div className={styles.palette} role="group" aria-label="Choose a supported preview command">
              {(filtered.length ? filtered : FEATURES).map(f=><button key={f.id} type="button" onClick={()=>launch(f.slash)}>
                <span className={styles.slashLabel}>{f.slash}</span><span>{f.topic}</span>
              </button>)}
            </div>}
            <div className={styles.categoryLabel}>START A SESSION</div>
            <div className={styles.scenarios}>
              {FEATURES.map(f=><button type="button" className={active===f.id?styles.scenarioActive:styles.scenario} key={f.id} aria-pressed={active===f.id} onClick={()=>launch(f.slash)}>
                <span className={styles.scenarioSlash}>{f.slash}</span>
                <span className={styles.scenarioName}>{f.name}</span>
              </button>)}
            </div>
            <div className={styles.commandNotes}>
              <div className={styles.notesTitle}><CircleHelp size={16}/> Selected: <strong>{chosen.name}</strong></div>
              <p>{chosen.description}</p>
              {options.length>0&&<p className={styles.arguments}>Source-defined command options: {options.join(', ')}.</p>}
            </div>
            <LabConfigurator id={active} value={config} onChange={updateConfig} onReset={resetConfig}/>
            <div className={styles.notice} role="status" aria-live="polite"><span className={styles.noticeDot}/>{notice}</div>
          </div>
        </section>

        <section className={styles.discord} aria-label="Interactive Discord reply preview">
          <div className={styles.discordTop}>
            <div className={styles.channel}><span className={styles.hash}>#</span>{config.channel || chosen.channel}<small> <ChevronDown size={13}/></small></div>
            <div className={styles.liveLabel}><span/>LIVE PREVIEW</div>
          </div>
          <div className={styles.discordBody}>
            <div className={styles.systemLine}><span>COMMAND INVOKED</span><code>{command}</code></div>
            <div className={styles.chat}>
              {config.showLogo ? <div className={styles.avatar}><img src={previewLogo} width={39} height={39} alt="Cloudy logo" decoding="async"/></div> : null}
              <div className={styles.chatMain}>
                <div className={styles.author}>Cloudy <span>APP</span> <small>Preview #{invocations}</small></div>
                <div className={styles.embed} style={{borderLeftColor: appearanceColor}}>
                  <div className={styles.embedEyebrow} style={{color:appearanceColor}}>{config.author.trim() || (isTicket?'CLOUDY SUPPORT':isGiveaway?'CLOUDY GIVEAWAYS':isVerify?'CLOUDY VERIFICATION':isPoll?'CLOUDY COMMUNITY':isBlackjack||isBaccarat?'GAMES & ECONOMY':'CLOUDY EMBED BUILDER')}</div>
                  {thumbnail ? <img className={styles.embedThumbnail} src={thumbnail} alt="Custom embed thumbnail" loading="lazy" /> : null}
                  <h2>{statusLabel}</h2>
                  <p className={styles.embedDescription}>
                    {config.description.trim() || (isTicket ? (stage==='fresh'?'Open a private ticket to contact our support team.':ticketClosed?'Your support request is closed.':'Your private ticket is ready. Staff can manage it from here.')
                    :isGiveaway ? (giveawayFinished?'A sample winner has been selected. This result is not a real Discord giveaway.':'Enter the giveaway and see what happens when a winner is drawn.')
                    :isVerify ? (stage==='verified'?'You have received the verified role in this demonstration.':'Complete verification to unlock the community.')
                    :isPoll ? 'Which Cloudy feature would you use most?'
                    :isBlackjack ? (blackjackDone?'The sample hand is finished. No currency was won or lost.':'Try a sample hand with hit, stand or double down.')
                    :isBaccarat ? (baccaratDone?'The sample round is complete. No money was wagered.':'Choose player, banker or tie to see a sample result.')
                    :'Your community. Your rules. Everything in one place.')}
                  </p>
                  {isTicket&&<div className={styles.infoRow}><div><span>Category</span><strong>{config.ticketCategory || 'Support'}</strong></div><div><span>Status</span><strong>{stage==='fresh'?'Ready':ticketClosed?'Closed':stage==='ticket_claimed'?'Claimed':'Open'}</strong></div><div><span>Staff</span><strong>{config.staffRole || 'Support team'}</strong></div></div>}
                  {isGiveaway&&<><div className={styles.giveawayPrize}><Gift size={15} /> {config.giveawayPrize || 'Cloudy Premium'} <small>· {config.giveawayDuration || '24 hours'}</small></div><div className={styles.infoRow}><div><span>Entries</span><strong>{stage==='giveaway_joined'||giveawayFinished?'249':'248'}</strong></div><div><span>Winners</span><strong>{giveawayFinished?config.giveawayWinners:'Pending'}</strong></div></div></>}
                  {isPoll&&<div className={styles.pollResults}><div>{config.pollOne || 'Option 1'} <strong>{stage==='poll_c1'?'62%':'50%'}</strong><span style={{width:stage==='poll_c1'?'62%':'50%',background:appearanceColor}}/></div><div>{config.pollTwo || 'Option 2'} <strong>{stage==='poll_c2'?'62%':'50%'}</strong><span style={{width:stage==='poll_c2'?'62%':'50%',background:appearanceColor}}/></div></div>}
                  {isBlackjack&&<div className={styles.cards}><div><span>Dealer</span><strong>{blackjackDone?'10 · 8':'10 · ?'}</strong></div><div><span>Your hand</span><strong>{stage==='blackjack_hit'?'10 · 7 · 3':stage==='blackjack_double'?'10 · 7 · 4':'10 · 7'}</strong></div></div>}
                  {isBaccarat&&<div className={styles.infoRow}><div><span>Player</span><strong>{baccaratDone?'7':'—'}</strong></div><div><span>Banker</span><strong>{baccaratDone?'5':'—'}</strong></div><div><span>Result</span><strong>{baccaratDone?'Player wins':'Ready'}</strong></div></div>}
                  {(isBlackjack || isBaccarat) && <div className={styles.gameStake}>Sample stake: {config.wager.toLocaleString('en-US')} · No balance changes</div>}
                  {isVerify&&<div className={styles.gameStake}>Role: {config.verificationRole || 'Verified'}</div>}
                  {isEmbed&&<div className={styles.embedPreviewExtra}>Cloudy preview · Revision {revision}</div>}
                  {config.fields.length>0 && <div className={styles.embedFields}>{config.fields.map(field=><div key={field.id} className={field.inline?styles.embedFieldInline:styles.embedField}><strong>{field.name || 'Field'}</strong><span>{field.value || 'Value'}</span></div>)}</div>}
                  {banner && <img className={styles.embedBanner} src={banner} alt="Embed banner or GIF" loading="lazy" />}
                  {config.showFooter && config.footer && <div className={styles.embedFooter}>{config.footer}</div>}
                  {showHelp&&(isBlackjack||isBaccarat)&&<div className={styles.help}>{isBlackjack?'Hit takes another card. Stand ends your turn. Double down takes one final card.':'Choose player, banker or tie. The side closest to nine wins. This preview is deterministic and does not accept bets.'}</div>}
                  {config.showButtons && <div className={styles.actions}>
                    {isTicket&&(stage==='fresh'?config.ticketMode==='dropdown'
                      ? <select className={styles.previewSelect} aria-label="Select ticket type" defaultValue="" onChange={e=>{if(e.target.value)action('ticket_open','A ' + config.ticketCategory + ' ticket was opened in the preview.');}}>
                          <option value="" disabled>Select a ticket type</option>
                          <option value="ticket">{config.ticketCategory || 'Support'} ticket</option>
                        </select>
                      : <DemoButton onClick={()=>action('ticket_open','Ticket created in this preview only.')}><Ticket size={15}/>{btn('ticketOpen','Open a ticket')}</DemoButton>:ticketClosed?<DemoButton onClick={()=>action('ticket_reopened','Ticket reopened in the preview.')}><RefreshCcw size={15}/>{btn('ticketReopen','Reopen')}</DemoButton>:<>
                      {ticketOpen&&stage!=='ticket_claimed'&&<DemoButton onClick={()=>action('ticket_claimed','Preview ticket claimed by ' + (config.staffRole || 'Support team') + '.')}><Check size={15}/>{btn('ticketClaim','Claim')}</DemoButton>}
                      <DemoButton neutral onClick={()=>action('ticket_closed','Preview ticket closed.')}><LockKeyhole size={15}/>{btn('ticketClose','Close')}</DemoButton>
                    </>)}
                    {isGiveaway&&(!giveawayFinished?<><DemoButton onClick={()=>action(stage==='giveaway_joined'?'fresh':'giveaway_joined',stage==='giveaway_joined'?'Entry removed in preview.':'You joined this sample giveaway.')}><Gift size={15}/>{stage==='giveaway_joined'?btn('giveawayLeave','Leave giveaway'):btn('giveawayJoin','Enter giveaway')}</DemoButton><DemoButton neutral onClick={()=>action('giveaway_ended','A sample winner was drawn.')}>{btn('giveawayDraw','Draw winner')}</DemoButton></>:<DemoButton onClick={()=>action('giveaway_rerolled','A different sample winner was drawn.')}>{btn('giveawayReroll','Reroll winner')}</DemoButton>)}
                    {isVerify&&<DemoButton onClick={()=>action('verified','Verification succeeded in the sandbox. No Discord roles were granted.')} disabled={stage==='verified'}><ShieldCheck size={15}/>{stage==='verified'?'Verified':btn('verify','Verify')}</DemoButton>}
                    {isPoll&&<><DemoButton onClick={()=>action('poll_c1','You voted for ' + (config.pollOne || 'Option 1') + ' in the sandbox.')}>{config.pollOne || 'Option 1'}</DemoButton><DemoButton neutral onClick={()=>action('poll_c2','You voted for ' + (config.pollTwo || 'Option 2') + ' in the sandbox.')}>{config.pollTwo || 'Option 2'}</DemoButton></>}
                    {isBlackjack&&<><DemoButton disabled={blackjackDone} onClick={()=>action('blackjack_hit','You drew another card. Score: 20.')}>{btn('hit','Hit')}</DemoButton><DemoButton neutral disabled={blackjackDone} onClick={()=>action('blackjack_stand','You stood. Dealer: 18. Preview hand finished.')}>{btn('stand','Stand')}</DemoButton><DemoButton neutral disabled={blackjackDone} onClick={()=>action('blackjack_double','Double down simulated. No balance changed.')}>{btn('double','Double down')}</DemoButton><DemoButton neutral onClick={()=>setShowHelp(x=>!x)}>{btn('help','How to play')}</DemoButton></>}
                    {isBaccarat&&<><DemoButton disabled={baccaratDone} onClick={()=>action('baccarat_player','Player won this example round. Nothing was wagered.')}>{btn('player','Player')}</DemoButton><DemoButton neutral disabled={baccaratDone} onClick={()=>action('baccarat_banker','Player won this example round. Banker selection was not successful.')}>{btn('banker','Banker')}</DemoButton><DemoButton neutral disabled={baccaratDone} onClick={()=>action('baccarat_tie','Player won this example round. Tie selection was not successful.')}>{btn('tie','Tie')}</DemoButton><DemoButton neutral onClick={()=>setShowHelp(x=>!x)}>{btn('help','How to play')}</DemoButton></>}
                    {isEmbed&&config.buttons.map(button => <button key={button.id} type="button" className={button.style==='secondary'?styles.controlNeutral:button.style==='success'?styles.controlSuccess:button.style==='danger'?styles.controlDanger:styles.controlPrimary} onClick={()=>{setEntry(button.response || 'Sample button clicked.');setRevision(value=>value+1);}}>{button.label || 'Button'}</button>)}
                  </div>}
                </div>
                {entry&&<div className={styles.interactionFeedback} role="status"><Check size={14}/>{entry}</div>}
              </div>
            </div>
          </div>
          <div className={styles.discordFooter}><div><span className={styles.footerDot}/>NO LIVE DISCORD CONNECTION</div><button type="button" onClick={reset}><RefreshCcw size={15}/> Reset session</button></div>
        </section>
      </div>
      <div className={styles.bottom}><span><ShieldCheck size={15}/> These are interactive illustrations, not exact live Discord replies.</span><Link href="/bot/command-reference">Explore source-defined commands <ArrowRight size={15}/></Link></div>
    </div>

  </div>;
}
