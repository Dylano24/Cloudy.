import a0 from './command-data/source-00.json';
import a1 from './command-data/source-01.json';
import a2 from './command-data/source-02.json';
import a3 from './command-data/source-03.json';
import a4 from './command-data/source-04.json';
import a5 from './command-data/source-05.json';
import a6 from './command-data/source-06.json';
import a7 from './command-data/source-07.json';
import a8 from './command-data/source-08.json';
import a9 from './command-data/source-09.json';

export type CommandOption = { name: string; type: string; required: boolean; description: string };
export type CommandSubcommand = { name: string; type: 'subcommand' | 'group'; description: string; options: CommandOption[] };
export type CommandEntry = {
  name: string; description: string; category: string; source: string;
  defaultPermission: string; options: CommandOption[]; subcommands: CommandSubcommand[];
};

const extracted = [...a0, ...a1, ...a2, ...a3, ...a4, ...a5, ...a6, ...a7, ...a8, ...a9] as unknown as CommandEntry[];

// Cloudy's source can contain compatibility and override command handlers.
// Discord slash command names are unique; keep one record per name.
const byName = new Map<string, CommandEntry>();
for (const entry of extracted) {
  if (!entry.name || !/^[a-z0-9_-]{1,32}$/.test(entry.name)) continue;
  const old = byName.get(entry.name);
  if (!old || old.source.includes('/00Overrides/')) byName.set(entry.name, entry);
  else if (!entry.source.includes('/00Overrides/')) byName.set(entry.name, entry);
}
export const commands: CommandEntry[] = [...byName.values()].sort((a,b) =>
  a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
);
