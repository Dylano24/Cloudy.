'use client';

import { useState } from 'react';
import {
  Activity, ArrowRight, Check, ChevronRight, CircleHelp, Gift, LockKeyhole,
  RotateCcw, ShieldCheck, SlidersHorizontal, Ticket,
  Trophy, Zap,
} from 'lucide-react';
import styles from './showcase.module.css';

// Official Cloudy logo asset already used in the site header.
const CLOUDY_LOGO_URL = 'https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif';

function DemoShell({ channel, children, reset }: { channel: string; children: React.ReactNode; reset?: () => void }) {
  return (
    <div className={styles.demoShell}>
      <div className={styles.demoTop}>
        <span className={styles.demoChannel}><span className={styles.hash}>#</span>{channel}</span>
        <span className={styles.previewTag}>INTERACTIVE PREVIEW</span>
        {reset ? <button type="button" className={styles.resetButton} onClick={reset} aria-label={'Reset ' + channel + ' preview'}><RotateCcw size={15} /></button> : null}
      </div>
      {children}
    </div>
  );
}

function DemoMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.discordMessage}>
      <div className={styles.messageAvatarRed}><img src={CLOUDY_LOGO_URL} alt="" width={35} height={35} decoding="async" /></div>
      <div className={styles.messageBody}>
        <span className={styles.messageName}>Cloudy <small>BOT</small></span>
        <div>{children}</div>
      </div>
    </div>
  );
}

function ModerationPreview() {
  const [step, setStep] = useState(0);
  const events = [
    { name: 'Spam protection', detail: 'Repeated messages detected', action: 'Message removed', kind: 'Blocked' },
    { name: 'Invite filter', detail: 'Unapproved invite link', action: 'Message removed', kind: 'Blocked' },
    { name: 'Mention protection', detail: 'Mass mentions prevented', action: 'Member timed out', kind: 'Action taken' },
    { name: 'Safe message', detail: 'No rules triggered', action: 'Message allowed', kind: 'Allowed' },
  ];
  return (
    <DemoShell channel="moderation-log" reset={() => setStep(0)}>
      <div className={styles.miniStats}>
        <div><strong>{step}</strong><span>Checked</span></div>
        <div><strong>{Math.min(step, 3)}</strong><span>Protected</span></div>
        <div><strong>{step > 3 ? 1 : 0}</strong><span>Allowed</span></div>
      </div>
      <div className={styles.demoContent}>
        {step === 0 ? <div className={styles.demoEmpty}><ShieldCheck size={25} /> Cloudy is monitoring this channel.</div> : events.slice(0, step).map((event, index) => (
          <div className={styles.eventRow} key={event.name}>
            <span className={index === 3 ? styles.eventGood : styles.eventDanger}><ShieldCheck size={16} /></span>
            <div><strong>{event.name}</strong><span>{event.detail}</span></div>
            <span className={index === 3 ? styles.actionGood : styles.actionRed}>{event.kind}</span>
          </div>
        ))}
      </div>
      <div className={styles.demoBottom}>
        <span>{step === 0 ? 'Run a sample security check.' : events[step - 1].action}</span>
        <button className={styles.demoButton} type="button" onClick={() => setStep(step >= events.length ? 0 : step + 1)}>
          {step >= events.length ? 'Replay' : 'Test filter'} <ArrowRight size={14} />
        </button>
      </div>
    </DemoShell>
  );
}

function TicketsPreview() {
  const [mode, setMode] = useState<'button' | 'dropdown'>('button');
  const [stage, setStage] = useState<'ready' | 'open' | 'claimed' | 'closed'>('ready');
  return (
    <DemoShell channel={stage === 'ready' ? 'support' : 'ticket-preview'} reset={() => setStage('ready')}>
      <div className={styles.demoContent}>
        <div className={styles.embed}>
          <span className={styles.embedEyebrow}>CLOUDY SUPPORT</span>
          <h4>{stage === 'ready' ? 'Need a hand?' : stage === 'closed' ? 'Ticket closed' : 'Support ticket'}</h4>
          <p>{stage === 'ready' ? 'Choose a topic below and our team will help you in a private ticket.' : stage === 'closed' ? 'This ticket has been closed. A transcript can be saved by your team.' : stage === 'claimed' ? 'A staff member has claimed this ticket.' : 'Your private ticket is open. A staff member can claim it below.'}</p>
          {stage === 'ready' ? <div className={styles.embedActions}><button type="button" onClick={() => setStage('open')}><Ticket size={15} /> {mode === 'button' ? 'Open a ticket' : 'Select a topic'} <ChevronRight size={14} /></button></div> : (
            <div className={styles.embedActions}>
              {stage === 'open' ? <button type="button" onClick={() => setStage('claimed')}><Check size={15} /> Claim ticket</button> : null}
              {stage === 'claimed' ? <button type="button" onClick={() => setStage('closed')}><LockKeyhole size={15} /> Close ticket</button> : null}
              {stage === 'closed' ? <button type="button" onClick={() => setStage('ready')}><RotateCcw size={15} /> Start over</button> : null}
            </div>
          )}
        </div>
        {stage !== 'ready' ? <p className={styles.demoFootnote}>Preview state: {stage === 'closed' ? 'Closed' : stage === 'claimed' ? 'Claimed by staff' : 'Open'}</p> : null}
      </div>
      <div className={styles.demoBottom}>
        <span>Ticket panel type</span>
        <div className={styles.segment}>
          <button type="button" className={mode === 'button' ? styles.segmentActive : ''} onClick={() => { setMode('button'); setStage('ready'); }}>Buttons</button>
          <button type="button" className={mode === 'dropdown' ? styles.segmentActive : ''} onClick={() => { setMode('dropdown'); setStage('ready'); }}>Dropdown</button>
        </div>
      </div>
    </DemoShell>
  );
}

function GiveawaysPreview() {
  const [entered, setEntered] = useState(false);
  const [ended, setEnded] = useState(false);
  const [rerolled, setRerolled] = useState(false);
  const reset = () => { setEntered(false); setEnded(false); setRerolled(false); };
  return (
    <DemoShell channel="giveaways" reset={reset}>
      <div className={styles.demoContent}>
        <DemoMessage>
          <div className={styles.embed}>
            <span className={styles.embedEyebrow}><Gift size={14} /> CLOUDY GIVEAWAYS</span>
            <h4>{ended ? 'Giveaway ended' : 'Community giveaway'}</h4>
            <p>{ended ? 'A winner has been selected in this preview.' : 'Enter for a chance to win the community prize.'}</p>
            <div className={styles.giveawayStats}><div><span>Entries</span><strong>{248 + (entered ? 1 : 0)}</strong></div><div><span>Winners</span><strong>1</strong></div><div><span>Status</span><strong>{ended ? 'Finished' : 'Active'}</strong></div></div>
            {ended ? <div className={styles.winner}><Trophy size={16} /> {rerolled ? 'Rerolled winner selected' : 'Winner selected'}</div> : (
              <div className={styles.embedActions}><button type="button" onClick={() => setEntered(n => !n)}><Gift size={15} /> {entered ? 'Entered — leave' : 'Enter giveaway'}</button></div>
            )}
          </div>
        </DemoMessage>
      </div>
      <div className={styles.demoBottom}><span>{ended ? 'Drawing complete (sample data).' : entered ? 'You are entered in the preview.' : 'Join, draw and reroll.'}</span><button type="button" className={styles.demoButton} onClick={() => ended ? setRerolled(true) : setEnded(true)}>{ended ? 'Reroll winner' : 'Draw winner'} <ArrowRight size={14} /></button></div>
    </DemoShell>
  );
}

const features = [
  { eyebrow: '01 / Protection', title: 'Stay ahead of what happens.', body: 'Keep your community under control with Cloudy moderation, AutoMod and consistent staff actions.', details: ['Automatic filtering and moderation rules', 'Protected channels and permission checks', 'Clear actions your staff can follow'], icon: ShieldCheck, Demo: ModerationPreview },
  { eyebrow: '02 / Support', title: 'Every ticket. In the right hands.', body: 'Let members reach your team with ticket panels, private conversations and a clear support flow.', details: ['Custom support panels', 'Claim, close and reopen workflows', 'Private conversations and staff control'], icon: Ticket, Demo: TicketsPreview },
  { eyebrow: '03 / Events', title: 'Bring your community together.', body: 'Run giveaways and community events with simple controls and a clear participant experience.', details: ['Member entry and participation', 'Winner selection and rerolls', 'Consistent Discord interactions'], icon: Gift, Demo: GiveawaysPreview },
];

const dashboardTabs = [
  { name: 'Overview', icon: Activity, desc: 'Your server at a glance', a: 'Modules', av: 'Connected', b: 'Access', bv: 'Managed', c: 'Changes', cv: 'Logged' },
  { name: 'Moderation', icon: ShieldCheck, desc: 'Keep control of the community', a: 'AutoMod', av: 'Configured', b: 'Cases', bv: 'Organized', c: 'Rules', cv: 'Editable' },
  { name: 'Tickets', icon: Ticket, desc: 'Support workflows in one place', a: 'Panels', av: 'Customizable', b: 'Staff', bv: 'Assigned', c: 'Updates', cv: 'Instant' },
  { name: 'Leveling', icon: Trophy, desc: 'Build community engagement', a: 'XP', av: 'Configurable', b: 'Rewards', bv: 'Managed', c: 'Roles', cv: 'Synced' },
  { name: 'Giveaways', icon: Gift, desc: 'Manage community events', a: 'Entries', av: 'Tracked', b: 'Winners', bv: 'Selected', c: 'Events', cv: 'Organized' },
];

function DashboardPreview() {
  const [active, setActive] = useState(0);
  const tab = dashboardTabs[active];
  const Icon = tab.icon;
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLabel}>EXPLORE MODULES</div>
        {dashboardTabs.map((item, index) => {
          const TabIcon = item.icon;
          return <button key={item.name} className={index === active ? styles.sidebarActive : styles.sidebarLink} type="button" onClick={() => setActive(index)}><TabIcon size={16} /> {item.name}</button>;
        })}
        <div className={styles.sidebarFooter}><LockKeyhole size={14} /> Demo mode — read only</div>
      </aside>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardToolbar}><span><span className={styles.onlineDot} /> CLOUDY DASHBOARD</span><span className={styles.previewTag}>SAMPLE DATA</span></div>
        <div className={styles.dashboardHeading}><div><span className={styles.kicker}>SERVER MANAGEMENT / {tab.name.toUpperCase()}</span><h3>{tab.name}</h3><p>{tab.desc}. Switch sections to explore.</p></div><div className={styles.dashboardIcon}><Icon size={25} /></div></div>
        <div className={styles.dashboardCards}>
          {[{ label: tab.a, value: tab.av }, { label: tab.b, value: tab.bv }, { label: tab.c, value: tab.cv }].map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong><span className={styles.positive}><Check size={13} /> Ready</span></div>)}
        </div>
        <div className={styles.settingPanel}>
          <div className={styles.settingHead}><span><SlidersHorizontal size={17} /> {tab.name} settings</span><span>PREVIEW ONLY</span></div>
          <div className={styles.settingRow}><div><strong>Module controls</strong><p>Manage Cloudy settings for your server.</p></div><span className={styles.fakeToggle}><span /></span></div>
          <div className={styles.settingRow}><div><strong>Discord permissions</strong><p>All changes are subject to server permissions.</p></div><span className={styles.permissions}><ShieldCheck size={14} /> Protected</span></div>
          <div className={styles.settingRow}><div><strong>Instant updates</strong><p>Configure Cloudy through the real dashboard.</p></div><span className={styles.permissions}><Zap size={14} /> Connected</span></div>
        </div>
      </div>
    </div>
  );
}

export function BotShowcase() {
  return (
    <>
      <section id="cloudy-demos" className={styles.showcase} aria-labelledby="cloudy-showcase-heading">
        <div className={styles.content}>
          <div className={styles.intro}><span className={styles.kicker}><span className={styles.redDot} /> INSIDE CLOUDY</span><h2 id="cloudy-showcase-heading">All the tools.<br /><em>One powerful bot.</em></h2><p>Explore a few of Cloudy&apos;s core features. These interactive examples are simulated — no real server settings are changed.</p></div>
          <div className={styles.featureStack}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const Demo = feature.Demo;
              return <article className={styles.feature} key={feature.eyebrow}>
                <div className={styles.featureText}>
                  <span className={styles.kicker}><Icon size={17} /> {feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                  <ul>{feature.details.map(detail => <li key={detail}><Check size={16} />{detail}</li>)}</ul>
                </div>
                <div className={styles.featureVisual}><Demo /></div>
                <span className={styles.featureNumber}>0{index + 1}</span>
              </article>;
            })}
          </div>
        </div>
      </section>
      <section className={styles.dashboardSection} aria-labelledby="cloudy-dashboard-heading">
        <div className={styles.content}>
          <div className={styles.intro}><span className={styles.kicker}><span className={styles.redDot} /> THE CONTROL CENTER</span><h2 id="cloudy-dashboard-heading">Your server.<br /><em>Your rules.</em></h2><p>One place to configure Cloudy. Explore the sample dashboard to see how your modules fit together.</p></div>
          <DashboardPreview />
          <p className={styles.disclaimer}><CircleHelp size={15} /> Dashboard and Discord examples use illustrative data only. Sign-in and live changes remain available through the existing authenticated dashboard.</p>
        </div>
      </section>
    </>
  );
}
