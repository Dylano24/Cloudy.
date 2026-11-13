import { notFound } from 'next/navigation';
import { siteSections } from '@/lib/site-sections';
import ArchivedVpnPage from './archived-page';

export { metadata } from './archived-page';

export default function VpnPage() {
  if (!siteSections.vpn) notFound();
  return <ArchivedVpnPage />;
}
