'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronsUpDown, Gem, LogOut, Menu, TerminalSquare, UsersRound, X } from 'lucide-react';
import styles from './bot.module.css';
import { DashboardProvider, type DashboardData } from './dashboard-context';
import { GuildIcon } from './guild-icon';
import { ModuleIcon } from './module-icon';
import { PlanNavPill } from './plan-banner';

export type NavModule = { id: string; title: string; group: string; icon: string };
export type NavGroup = { id: string; label: string };
type SwitchServer = { id: string; name: string; iconUrl: string | null };
type ShellUser = { name: string; username: string; avatarUrl: string };

export function DashboardShell({ data, user, servers, groups, modules, children }: {
  data: DashboardData;
  user: ShellUser;
  servers: SwitchServer[];
  groups: NavGroup[];
  modules: NavModule[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const base = `/bot/${data.guild.id}`;

  // Restore per-server navigation preferences without changing server configuration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('cloudy:bot:nav:' + data.guild.id);
      if (stored) {
        const value: unknown = JSON.parse(stored);
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const clean: Record<string, boolean> = {};
          for (const group of groups) if ((value as Record<string, unknown>)[group.id] === true) clean[group.id] = true;
          setCollapsedGroups(clean);
        }
      }
    } catch { /* Browser storage may be disabled. The navigation still works. */ }
  }, [data.guild.id, groups]);

  function toggleNavGroup(groupId: string) {
    setCollapsedGroups(previous => {
      const next = { ...previous, [groupId]: !previous[groupId] };
      try { window.localStorage.setItem('cloudy:bot:nav:' + data.guild.id, JSON.stringify(next)); } catch { /* Non-persistent fallback. */ }
      return next;
    });
  }

  // Close the phone drawer and the server menu after navigation.
  useEffect(() => { setDrawerOpen(false); setSwitcherOpen(false); }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); };
  }, [drawerOpen]);

  useEffect(() => {
    if (!switcherOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) setSwitcherOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSwitcherOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [switcherOpen]);

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    try {
      await fetch('/api/bot/auth/logout', { method: 'POST', headers: { 'x-cloudy-csrf': data.csrf } });
    } finally {
      router.replace('/bot');
      router.refresh();
    }
  }


  return (
    <DashboardProvider value={data}>
      <div className={styles.shell}>
        <div className={styles.mobileBar}>
          <button type="button" className={styles.iconButton} aria-label="Open dashboard menu" aria-expanded={drawerOpen} aria-controls="cloudy-bot-sidebar" onClick={() => setDrawerOpen(true)}>
            <Menu size={18} aria-hidden="true" />
          </button>
          <GuildIcon name={data.guild.name} url={data.guild.iconUrl} />
          <strong>{data.guild.name}</strong>
        </div>

        <div className={styles.drawerBackdrop} data-open={drawerOpen} onClick={() => setDrawerOpen(false)} aria-hidden="true" />

        <aside id="cloudy-bot-sidebar" ref={sidebarRef} className={styles.sidebar} data-open={drawerOpen} aria-label="Bot dashboard">
          <div className={styles.switcher} ref={switcherRef}>
            <button type="button" className={styles.switcherButton} aria-haspopup="true" aria-expanded={switcherOpen} onClick={() => setSwitcherOpen(open => !open)}>
              <GuildIcon name={data.guild.name} url={data.guild.iconUrl} />
              <span className={styles.switcherText}>
                <strong>{data.guild.name}</strong>
                <span>{data.guild.memberCount !== null ? `${data.guild.memberCount.toLocaleString('en')} members` : 'Cloudy'}</span>
              </span>
              <ChevronsUpDown size={16} aria-hidden="true" />
            </button>
            {switcherOpen ? (
              <nav className={styles.switcherMenu} aria-label="Switch server">
                {servers.map(server => (
                  <Link key={server.id} href={`/bot/${server.id}` as Route} aria-current={server.id === data.guild.id}>
                    <GuildIcon name={server.name} url={server.iconUrl} />
                    <span>{server.name}</span>
                  </Link>
                ))}
                <Link href="/bot">
                  <span className={styles.guildIcon} aria-hidden="true">···</span>
                  <span>All servers</span>
                </Link>
              </nav>
            ) : null}
          </div>

          <nav className={styles.sidebarScroll} aria-label="Modules">
            <div className={styles.navGroup}>
              <Link href={base as Route} className={styles.navItem} aria-current={pathname === base ? 'page' : undefined}>
                <ModuleIcon name="overview" size={17} /> Overview
              </Link>
              <Link href={`${base}/plan` as Route} className={styles.navItem} aria-current={pathname === `${base}/plan` ? 'page' : undefined}>
                <Gem size={17} aria-hidden="true" /> Plan<PlanNavPill />
              </Link>
              <Link href={`${base}/team` as Route} className={styles.navItem} aria-current={pathname === `${base}/team` ? 'page' : undefined}>
                <UsersRound size={17} aria-hidden="true" /> Team &amp; access
              </Link>
              <Link href={`${base}/command-center` as Route} className={styles.navItem} aria-current={pathname === `${base}/command-center` ? 'page' : undefined}>
                <TerminalSquare size={17} aria-hidden="true" /> Command center
              </Link>
            </div>
            {groups.map(group => {
              const items = modules.filter(module => module.group === group.id);
              if (!items.length) return null;
              return (
                <div key={group.id} className={styles.navGroup}>
                  <button type="button" className={styles.navGroupToggle} aria-expanded={!collapsedGroups[group.id]} aria-controls={`cloudy-nav-${group.id}`} onClick={() => toggleNavGroup(group.id)}>
                    <span className={styles.navLabel}>{group.label}</span>
                    <ChevronDown size={15} className={collapsedGroups[group.id] ? styles.navGroupCollapsed : styles.navGroupExpanded} aria-hidden="true" />
                  </button>
                  <div id={`cloudy-nav-${group.id}`} hidden={!!collapsedGroups[group.id]}>
                    {items.map(module => {
                      const href = `${base}/${module.id}`;
                      return (
                        <Link key={module.id} href={href as Route} prefetch={false} className={styles.navItem} aria-current={pathname === href ? 'page' : undefined}>
                          <ModuleIcon name={module.icon} size={17} /> {module.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className={styles.sidebarFoot}>
            <img className={`${styles.avatar} ${styles.avatarSmall}`} src={user.avatarUrl} alt="" width={34} height={34} decoding="async" />
            <span className={styles.who}><strong>{user.name}</strong><span>@{user.username}</span></span>
            <button type="button" className={styles.iconButton} onClick={logout} disabled={leaving} aria-label="Log out of the dashboard" title="Log out">
              <LogOut size={16} aria-hidden="true" />
            </button>
            <button type="button" className={`${styles.iconButton} ${styles.closeDrawer}`} onClick={() => setDrawerOpen(false)} aria-label="Close dashboard menu">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <div className={styles.main}>{children}</div>
      </div>
    </DashboardProvider>
  );
}
