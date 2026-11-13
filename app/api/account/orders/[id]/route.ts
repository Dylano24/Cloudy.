import { NextRequest, NextResponse } from 'next/server';
import { customerRecords } from '@/lib/finance-store';
import { buildOrders } from '@/lib/customer-orders';
import { customerIdentity, sessionUser } from '@/lib/customer-identity';

const headers = { 'Cache-Control': 'private, no-store' };

// One receipt, only for an order that belongs to the signed-in customer.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return NextResponse.json({ error: 'Receipt not found.' }, { status: 404, headers });
  const user = sessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in to view this receipt.' }, { status: 401, headers });
  try {
    const order = buildOrders(await customerRecords(await customerIdentity(user))).find(entry => entry.id === id);
    if (!order) return NextResponse.json({ error: 'Receipt not found.' }, { status: 404, headers });
    return NextResponse.json({ order, customer: { name: user.name } }, { headers });
  } catch {
    return NextResponse.json({ error: 'This receipt could not be loaded. Please try again.' }, { status: 503, headers });
  }
}
