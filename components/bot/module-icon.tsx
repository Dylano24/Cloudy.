import {
  BadgeCheck, BarChart3, Cake, ClipboardList, Coins, Gavel, Gift, Hand, Hash, LayoutDashboard, LayoutTemplate,
  Mic, Music, Rss, ScrollText, Settings, Shield, Smile, Terminal, Ticket, TrendingUp, UserPlus,
  type LucideProps,
} from 'lucide-react';

const ICONS = {
  'badge-check': BadgeCheck, 'bar-chart': BarChart3, cake: Cake, clipboard: ClipboardList, coins: Coins, gavel: Gavel, gift: Gift,
  hand: Hand, hash: Hash, overview: LayoutDashboard, layout: LayoutTemplate, mic: Mic, music: Music, rss: Rss,
  scroll: ScrollText, settings: Settings, shield: Shield, smile: Smile, terminal: Terminal, ticket: Ticket,
  'trending-up': TrendingUp, 'user-plus': UserPlus,
} as const;

export function ModuleIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as keyof typeof ICONS] || Settings;
  return <Icon aria-hidden="true" {...props} />;
}
