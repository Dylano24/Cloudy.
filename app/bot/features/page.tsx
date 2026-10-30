import type { Metadata } from 'next';
import { FeatureExplorer } from '@/components/bot/feature-explorer';
import { fullPublicFeatureCatalog, featureGroups } from '@/lib/bot-dashboard/public-feature-catalog';

export const metadata: Metadata = {
  title: 'Cloudy Bot Features | Cloudy',
  description: 'Explore Cloudy Discord bot settings, Discord-managed tools and future website integrations in a single transparent feature catalog.',
};

export default function BotFeatures() {
  return <FeatureExplorer items={fullPublicFeatureCatalog} groups={featureGroups} />;
}
