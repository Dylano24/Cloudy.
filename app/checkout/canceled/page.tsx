import { redirect } from 'next/navigation';

export default function CheckoutCanceledPage() {
  redirect('/shop');
}
