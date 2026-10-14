import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AccountPanel } from '@/components/account/account-panel';
export default async function AccountSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!['orders', 'favorites', 'fidelity', 'information'].includes(section)) notFound();
  return <Suspense><AccountPanel section={section} /></Suspense>;
}
