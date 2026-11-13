'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BotChannel, BotRole, Plan } from '@/lib/bot-dashboard/bot-api';

export type DashboardData = {
  guild: { id: string; name: string; iconUrl: string | null; memberCount: number | null };
  channels: BotChannel[];
  roles: BotRole[];
  csrf: string;
  plan: Plan;
  /** Where this dashboard's pages live (default /bot/<server id>). */
  base?: string;
  /** Preview-only demo with sample data: nothing is sent to Cloudy. */
  demo?: boolean;
};

type DashboardValue = DashboardData & { setPlan: (plan: Plan) => void };

const DashboardContext = createContext<DashboardValue | null>(null);

export function DashboardProvider({ value, children }: { value: DashboardData; children: ReactNode }) {
  // The plan can change while the page is open (a purchase or Premium running out).
  const [plan, setPlan] = useState(value.plan);
  const context = useMemo(() => ({ ...value, plan, setPlan }), [value, plan]);
  return <DashboardContext.Provider value={context}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('useDashboard must be used inside the Bot dashboard');
  return value;
}
