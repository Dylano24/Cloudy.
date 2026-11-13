import { notFound } from 'next/navigation';
import { OrderReceipt } from '@/components/account/order-receipt';

export const metadata = { title: 'Receipt | Cloudy Inc.', robots: { index: false, follow: false } };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  return <OrderReceipt id={id} />;
}
