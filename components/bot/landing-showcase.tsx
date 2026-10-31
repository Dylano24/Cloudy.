'use client';

import { useState } from 'react';
import { Activity, Check, CircleHelp, Gift, LockKeyhole, ShieldCheck, SlidersHorizontal, Ticket, Zap } from 'lucide-react';
import styles from './showcase.module.css';

const dashboardTabs = [
  { name: 'Overview', icon: Activity, desc: 'Your server at a glance', a: 'Modules', av: 'Connected', b: 'Access', bv: 'Managed', c: 'Changes', cv: 'Logged' },
  { name: 'Moderation', icon: ShieldCheck, desc: 'Keep control of the community', a: 'AutoMod', av: 'Configured', b: 'Cases', bv: 'Organized', c: 'Rules', cv: 'Editable' },
  { name: 'Tickets', icon: Ticket, desc: 'Support workflows in one place', a: 'Panels', av: 'Customizable', b: 'Staff', bv: 'Assigned', c: 'Updates', cv: 'Instant' },
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
      <section id="cloudy-dashboard" className={styles.dashboardSection} aria-labelledby="cloudy-dashboard-heading">
        <div className={styles.content}>
          <div className={styles.intro}><span className={styles.kicker}><span className={styles.redDot} /> THE CONTROL CENTER</span><h2 id="cloudy-dashboard-heading">Your server.<br /><em>Your rules.</em></h2><p>One place to configure Cloudy. Explore the sample dashboard to see how your modules fit together.</p></div>
          <DashboardPreview />
          <p className={styles.disclaimer}><CircleHelp size={15} /> Dashboard and Discord examples use illustrative data only. Sign-in and live changes remain available through the existing authenticated dashboard.</p>
        </div>
      </section>
    </>
  );
}
