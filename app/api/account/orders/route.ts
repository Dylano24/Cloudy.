import { NextRequest, NextResponse } from 'next/server';
import { customerRecords } from '@/lib/finance-store';
import { buildOrders } from '@/lib/customer-orders';
import { customerIdentity, sessionUser } from '@/lib/customer-identity';

const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest) {
  const user = sessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in to view your orders.' }, { status: 401, headers });
  try {
    const orders = buildOrders(await customerRecords(await customerIdentity(user)));
    // The list carries no transaction IDs; the receipt shows them.
    return NextResponse.json({ orders: orders.map(({ payments, ...order }) => ({ ...order, payments: payments.length })) }, { headers });
  } catch {
    return NextResponse.json({ error: 'Your orders could not be loaded. Please try again.' }, { status: 503, headers });
  }
}
