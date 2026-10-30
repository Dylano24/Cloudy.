import type { Metadata } from 'next';
import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';
import { ModuleGuides, type GuideEntry } from '@/components/bot/module-guides';

export const metadata: Metadata = {
  title: 'Cloudy Bot documentation | Cloudy',
  description: 'Browse the existing Cloudy Bot dashboard module settings, field names, permissions, and limitations.',
};

const guides: GuideEntry[] = MODULES.map(module => ({
  id: module.id,
  name: module.title,
  summary: module.summary,
  group: module.group,
  icon: module.icon,
  kind: module.kind,
  access: module.access,
  note: module.note,
  sections: module.sections.map(section => ({
    title: section.title,
    description: section.description,
    fields: section.fields.map(field => ({ label: field.label, type: field.type, help: field.help })),
  })),
}));

export default function CloudyBotGuides() {
  return <ModuleGuides modules={guides} groups={GROUPS.map(group => ({ id: group.id, name: group.label }))} />;
}
