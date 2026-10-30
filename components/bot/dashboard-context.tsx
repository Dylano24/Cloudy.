'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BotChannel, BotRole, Plan } from '@/lib/bot-dashboard/bot-api';

export type DashboardData = {
  guild: { id: string; name: string; iconUrl: string | null; memberCount: number | null };
  channels: BotChannel[];
  roles: BotRole[];
  csrf: string;
  plan: Plan;
};

type DashboardValue = DashboardData & { setPlan: (plan: Plan) => void };

const DashboardContext = createContext<DashboardValue | null>(null);

export function DashboardProvider({ value, children }: { value: DashboardData; children: ReactNode }) {
  // The plan can change while the page is open (the first save starts the trial).
  const [plan, setPlan] = useState(value.plan);
  const context = useMemo(() => ({ ...value, plan, setPlan }), [value, plan]);
  return <DashboardContext.Provider value={context}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('useDashboard must be used inside the Bot dashboard');
  return value;
}
