import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight, CheckCircle2, Eye, LockKeyhole, ShieldCheck, Users, Wrench } from 'lucide-react';
import { loadGuildContext } from '@/lib/bot-dashboard/guild-context';
import { PageHead } from '@/components/bot/page-head';
import styles from '@/components/bot/bot.module.css';

export const metadata: Metadata = { title: 'Team access | Cloudy Bot', robots: { index: false, follow: false } };

const ACCESS = [
  {
    name: 'Server owner',
    description: 'The Discord server owner can access the dashboard.',
    key: 'owner',
  },
  {
    name: 'Administrator',
    description: 'Members with Discord Administrator permission can access the dashboard.',
    key: 'administrator',
  },
  {
    name: 'Manage Server',
    description: 'Members granted Discord Manage Server can access the dashboard.',
    key: 'manager',
  },
] as const;

const SETTINGS = [
  { title: 'Moderator role', text: 'Configure the server role Cloudy uses for moderation commands.', href: 'general' },
  { title: 'Ticket staff', text: 'Choose the support staff role used by your ticket system.', href: 'tickets' },
  { title: 'Application reviewers', text: 'Configure reviewer roles for staff applications.', href: 'applications' },
] as const;

export default async function TeamAccess({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const context = await loadGuildContext(guildId);
  if (context.kind !== 'ok') return null;
  const roleLabel = ACCESS.find(item => item.key === context.guild.role)?.name || 'Manage Server';

  return (
    <div className={styles.stack}>
      <PageHead
        guildId={context.guild.id}
        guildName={context.guild.name}
        crumb="Team & access"
        title="Team & access"
        summary="See who can open Cloudy's dashboard and where your staff permissions are configured."
      />

      <section className={styles.accessHero} aria-label="Your current access">
        <span className={styles.accessHeroIcon}><ShieldCheck size={29} aria-hidden="true" /></span>
        <div>
          <span className={styles.accessEyebrow}>YOUR DISCORD PERMISSIONS</span>
          <h2>{roleLabel}</h2>
          <p>Your access is verified with Discord when opening the server dashboard. This page never grants new permissions.</p>
        </div>
        <span className={styles.pill + ' ' + styles.pillGreen}>Access verified</span>
      </section>

      <section className={styles.panel + ' ' + styles.accessSection} aria-labelledby="access-rules">
        <div className={styles.accessSectionHead}>
          <span className={styles.accessSectionIcon}><LockKeyhole size={20} aria-hidden="true" /></span>
          <div><h2 id="access-rules">Who can open the dashboard?</h2><p>Cloudy checks the permissions on the Discord server, not a separate website staff list.</p></div>
        </div>
        <div className={styles.accessRoleGrid}>
          {ACCESS.map((item) => (
            <article key={item.key} className={styles.accessRole}>
              <div className={styles.accessRoleHeader}><CheckCircle2 size={17} aria-hidden="true" /><strong>{item.name}</strong></div>
              <p>{item.description}</p>
              {context.guild.role === item.key ? <span className={styles.accessCurrent}>Your current access</span> : null}
            </article>
          ))}
        </div>
        <div className={styles.accessNote}><Eye size={17} aria-hidden="true" /><p>Team members without these Discord permissions cannot open this server dashboard. They may still use commands in Discord according to their roles and Cloudy's command checks.</p></div>
      </section>

      <section className={styles.panel + ' ' + styles.accessSection} aria-labelledby="access-staff">
        <div className={styles.accessSectionHead}>
          <span className={styles.accessSectionIcon}><Users size={20} aria-hidden="true" /></span>
          <div><h2 id="access-staff">Staff roles already available</h2><p>These controls use Cloudy's existing settings. No team members or permissions are invented.</p></div>
        </div>
        <div className={styles.accessLinks}>
          {SETTINGS.map(item => (
            <Link key={item.href} href={`/bot/${context.guild.id}/${item.href}` as Route} className={styles.accessLink} prefetch={false}>
              <div><strong>{item.title}</strong><span>{item.text}</span></div><ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.accessUpcoming} aria-label="Advanced team permissions">
        <Wrench size={20} aria-hidden="true" />
        <div><strong>Advanced team management is not enabled yet.</strong><p>Custom web-only roles, inviting team members and fine-grained access require a verified backend permission system before they can be used safely. No simulated permission buttons are shown.</p></div>
      </section>
    </div>
  );
}
