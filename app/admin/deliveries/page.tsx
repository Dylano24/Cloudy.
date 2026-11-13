import { DeliveryAdmin } from '@/components/admin/delivery-admin';

export const metadata = { title: 'Cloudy · Kit deliveries', robots: { index: false, follow: false } };

export default function DeliveriesPage() {
  return <DeliveryAdmin />;
}
