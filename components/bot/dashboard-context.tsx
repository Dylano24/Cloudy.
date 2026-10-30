'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { BotChannel, BotRole } from '@/lib/bot-dashboard/bot-api';

export type DashboardData = {
  guild: { id: string; name: string; iconUrl: string | null; memberCount: number | null };
  channels: BotChannel[];
  roles: BotRole[];
  csrf: string;
};

const DashboardContext = createContext<DashboardData | null>(null);

export function DashboardProvider({ value, children }: { value: DashboardData; children: ReactNode }) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('useDashboard must be used inside the Bot dashboard');
  return value;
}
