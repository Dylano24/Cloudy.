'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Command, Gift, LockKeyhole, Play, RefreshCcw, ShieldCheck, Sparkles, Terminal, Ticket, X } from 'lucide-react';
import type { CommandEntry } from '@/lib/bot-dashboard/command-reference-data';
import styles from './command-lab.module.css';

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
  const [showEditor,setShowEditor] = useState(false);
  const [title,setTitle] = useState('Welcome to Cloudy');
  const [description,setDescription] = useState('Your community. Your rules. Everything in one place.');
  const [draftTitle,setDraftTitle] = useState(title);
  const [draftDescription,setDraftDescription] = useState(description);
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
      setStage('fresh'); setShowEditor(false); setShowHelp(false);
      setInvocations(x=>x+1); setRevision(1); setShowPalette(false);
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
    setStage('fresh');setRevision(1);setShowHelp(false);setShowEditor(false);
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
  const statusLabel = isTicket ? (stage==='fresh' ? 'Create your support request' : ticketClosed ? 'Ticket closed' : 'Ticket opened')
    : isGiveaway ? (giveawayFinished ? 'Giveaway ended' : 'Community giveaway')
    : isVerify ? (stage==='verified' ? 'Verification complete' : 'Verify your account')
    : isPoll ? 'Community poll'
    : isBlackjack ? (blackjackDone ? 'Round complete' : 'Blackjack')
    : isBaccarat ? (baccaratDone ? 'Round complete' : 'Baccarat')
    : title;

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
            <div className={styles.notice} role="status" aria-live="polite"><span className={styles.noticeDot}/>{notice}</div>
          </div>
        </section>

        <section className={styles.discord} aria-label="Interactive Discord reply preview">
          <div className={styles.discordTop}>
            <div className={styles.channel}><span className={styles.hash}>#</span>{chosen.channel}<small> <ChevronDown size={13}/></small></div>
            <div className={styles.liveLabel}><span/>LIVE PREVIEW</div>
          </div>
          <div className={styles.discordBody}>
            <div className={styles.systemLine}><span>COMMAND INVOKED</span><code>{command}</code></div>
            <div className={styles.chat}>
              <div className={styles.avatar}><img src={logo} width={39} height={39} alt="Cloudy logo" decoding="async"/></div>
              <div className={styles.chatMain}>
                <div className={styles.author}>Cloudy <span>APP</span> <small>Preview #{invocations}</small></div>
                <div className={styles.embed}>
                  <div className={styles.embedEyebrow}>{isTicket?'CLOUDY SUPPORT':isGiveaway?'CLOUDY GIVEAWAYS':isVerify?'CLOUDY VERIFICATION':isPoll?'CLOUDY COMMUNITY':isBlackjack||isBaccarat?'GAMES & ECONOMY':'CLOUDY EMBED BUILDER'}</div>
                  <h2>{statusLabel}</h2>
                  <p className={styles.embedDescription}>
                    {isTicket ? (stage==='fresh'?'Open a private ticket to contact our support team.':ticketClosed?'Your support request is closed.':'Your private ticket is ready. Staff can manage it from here.')
                    :isGiveaway ? (giveawayFinished?'A sample winner has been selected. This result is not a real Discord giveaway.':'Enter the giveaway and see what happens when a winner is drawn.')
                    :isVerify ? (stage==='verified'?'You have received the verified role in this demonstration.':'Complete verification to unlock the community.')
                    :isPoll ? 'Which Cloudy feature would you use most?'
                    :isBlackjack ? (blackjackDone?'The sample hand is finished. No currency was won or lost.':'Try a sample hand with hit, stand or double down.')
                    :isBaccarat ? (baccaratDone?'The sample round is complete. No money was wagered.':'Choose player, banker or tie to see a sample result.')
                    :description}
                  </p>
                  {isTicket&&stage!=='fresh'&&<div className={styles.infoRow}><div><span>Status</span><strong>{ticketClosed?'Closed':stage==='ticket_claimed'?'Claimed':'Open'}</strong></div><div><span>Staff</span><strong>{stage==='ticket_claimed'||ticketClosed?'Assigned':'Unassigned'}</strong></div></div>}
                  {isGiveaway&&<div className={styles.infoRow}><div><span>Entries</span><strong>{stage==='giveaway_joined'||giveawayFinished?'249':'248'}</strong></div><div><span>Winners</span><strong>{giveawayFinished?'Selected':'Pending'}</strong></div></div>}
                  {isPoll&&<div className={styles.pollResults}><div>Moderation <strong>{stage==='poll_c1'?'62%':'50%'}</strong><span style={{width:stage==='poll_c1'?'62%':'50%'}}/></div><div>Giveaways <strong>{stage==='poll_c2'?'62%':'50%'}</strong><span style={{width:stage==='poll_c2'?'62%':'50%'}}/></div></div>}
                  {isBlackjack&&<div className={styles.cards}><div><span>Dealer</span><strong>{blackjackDone?'10 · 8':'10 · ?'}</strong></div><div><span>Your hand</span><strong>{stage==='blackjack_hit'?'10 · 7 · 3':stage==='blackjack_double'?'10 · 7 · 4':'10 · 7'}</strong></div></div>}
                  {isBaccarat&&<div className={styles.infoRow}><div><span>Player</span><strong>{baccaratDone?'7':'—'}</strong></div><div><span>Banker</span><strong>{baccaratDone?'5':'—'}</strong></div><div><span>Result</span><strong>{baccaratDone?'Player wins':'Ready'}</strong></div></div>}
                  {isEmbed&&<div className={styles.embedPreviewExtra}>Cloudy preview · Revision {revision}</div>}
                  {showHelp&&(isBlackjack||isBaccarat)&&<div className={styles.help}>{isBlackjack?'Hit takes another card. Stand ends your turn. Double down takes one final card.':'Choose player, banker or tie. The side closest to nine wins. This preview is deterministic and does not accept bets.'}</div>}
                  <div className={styles.actions}>
                    {isTicket&&(stage==='fresh'?<DemoButton onClick={()=>action('ticket_open','Ticket created in this preview only.')}><Ticket size={15}/> Open a ticket</DemoButton>:ticketClosed?<DemoButton onClick={()=>action('ticket_reopened','Ticket reopened in the preview.')}><RefreshCcw size={15}/> Reopen</DemoButton>:<>
                      {ticketOpen&&stage!=='ticket_claimed'&&<DemoButton onClick={()=>action('ticket_claimed','Preview ticket claimed by staff.')}><Check size={15}/> Claim</DemoButton>}
                      <DemoButton neutral onClick={()=>action('ticket_closed','Preview ticket closed.')}><LockKeyhole size={15}/> Close</DemoButton>
                    </>)}
                    {isGiveaway&&(!giveawayFinished?<><DemoButton onClick={()=>action(stage==='giveaway_joined'?'fresh':'giveaway_joined',stage==='giveaway_joined'?'Entry removed in preview.':'You joined this sample giveaway.')}><Gift size={15}/>{stage==='giveaway_joined'?'Leave giveaway':'Enter giveaway'}</DemoButton><DemoButton neutral onClick={()=>action('giveaway_ended','A sample winner was drawn.')}>Draw winner</DemoButton></>:<DemoButton onClick={()=>action('giveaway_rerolled','A different sample winner was drawn.')}>Reroll winner</DemoButton>)}
                    {isVerify&&<DemoButton onClick={()=>action('verified','Verification succeeded in the sandbox. No Discord roles were granted.')} disabled={stage==='verified'}><ShieldCheck size={15}/>{stage==='verified'?'Verified':'Verify'}</DemoButton>}
                    {isPoll&&<><DemoButton onClick={()=>action('poll_c1','You voted for Moderation in the sandbox.')}>Moderation</DemoButton><DemoButton neutral onClick={()=>action('poll_c2','You voted for Giveaways in the sandbox.')}>Giveaways</DemoButton></>}
                    {isBlackjack&&<><DemoButton disabled={blackjackDone} onClick={()=>action('blackjack_hit','You drew another card. Score: 20.')}>Hit</DemoButton><DemoButton neutral disabled={blackjackDone} onClick={()=>action('blackjack_stand','You stood. Dealer: 18. Preview hand finished.')}>Stand</DemoButton><DemoButton neutral disabled={blackjackDone} onClick={()=>action('blackjack_double','Double down simulated. No balance changed.')}>Double down</DemoButton><DemoButton neutral onClick={()=>setShowHelp(x=>!x)}>How to play</DemoButton></>}
                    {isBaccarat&&<><DemoButton disabled={baccaratDone} onClick={()=>action('baccarat_player','Player won this example round. Nothing was wagered.')}>Player</DemoButton><DemoButton neutral disabled={baccaratDone} onClick={()=>action('baccarat_banker','Player won this example round. Banker selection was not successful.')}>Banker</DemoButton><DemoButton neutral disabled={baccaratDone} onClick={()=>action('baccarat_tie','Player won this example round. Tie selection was not successful.')}>Tie</DemoButton><DemoButton neutral onClick={()=>setShowHelp(x=>!x)}>How to play</DemoButton></>}
                    {isEmbed&&<DemoButton onClick={()=>{setDraftTitle(title);setDraftDescription(description);setShowEditor(true);}}>Edit embed</DemoButton>}
                  </div>
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
    {showEditor&&<div className={styles.modalOverlay} role="presentation" onClick={()=>setShowEditor(false)}>
      <div role="dialog" aria-modal="true" aria-labelledby="embed-editor-heading" className={styles.modal} onClick={e=>e.stopPropagation()}>
        <div className={styles.modalTop}><h2 id="embed-editor-heading">Edit sample embed</h2><button type="button" onClick={()=>setShowEditor(false)} aria-label="Close editor"><X size={19}/></button></div>
        <label>Embed title<input maxLength={120} value={draftTitle} onChange={e=>setDraftTitle(e.target.value)}/></label>
        <label>Description<textarea maxLength={1500} rows={5} value={draftDescription} onChange={e=>setDraftDescription(e.target.value)}/></label>
        <div className={styles.modalActions}><DemoButton neutral onClick={()=>setShowEditor(false)}>Cancel</DemoButton><DemoButton onClick={()=>{setTitle(draftTitle.trim()||'Untitled preview');setDescription(draftDescription);setShowEditor(false);action('embed_saved','Saved to local preview state. No Discord message was edited.');}}>Save preview</DemoButton></div>
      </div>
    </div>}
  </div>;
}
