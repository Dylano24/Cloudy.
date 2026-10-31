import type { Metadata } from 'next';
import { CommandLab } from '@/components/bot/command-lab';
import { commands } from '@/lib/bot-dashboard/command-reference-data';

export const metadata: Metadata = {
  title: 'Cloudy Bot Interactive Preview | Cloudy',
  description: 'Run sample slash commands and interact with Discord-style preview embeds. Safe browser-only simulations, no server changes.',
};

export default function CloudyPreviewSession() {
  return <CommandLab commands={commands} />;
}
