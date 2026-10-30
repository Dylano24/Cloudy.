import type { Metadata } from 'next';
import { CommandReference } from '@/components/bot/command-reference';
import { commands } from '@/lib/bot-dashboard/command-reference-data';

export const metadata: Metadata = {
  title: 'Cloudy Bot slash commands | Cloudy',
  description: 'Search slash commands and view source-defined Cloudy command arguments, permissions and subcommands.',
};

export default function CommandsReferencePage() {
  return <CommandReference commands={commands} />;
}
