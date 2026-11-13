import { NextRequest, NextResponse } from 'next/server';
import { BotApiError, signedBotCall } from '@/lib/bot-dashboard/bot-api';
import { getAccountLinks } from '@/lib/account-links-store';
import { DELIVERY_ACTIONS, sessionFrom, staffFromSession, type Delivery } from '@/lib/delivery-admin';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

// Retry, cancel or confirm one delivery. Cloudy checks again that the staff member is its owner.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return NextResponse.json({ error: 'Delivery not found.' }, { status: 404, headers });
  const user = sessionFrom(request);
  const links = user && user.provider !== 'discord' && user.provider ? await getAccountLinks(user).catch(() => ({ discord_id: undefined })) : {};
  const check = staffFromSession(user, (links as { discord_id?: string }).discord_id);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status, headers });
  let body: unknown;
  try { body = JSON.parse((await request.text()).slice(0, 500)); } catch { body = null; }
  const action = body && typeof body === 'object' ? (body as { action?: unknown }).action : undefined;
  if (typeof action !== 'string' || !(DELIVERY_ACTIONS as readonly string[]).includes(action)) return NextResponse.json({ error: 'Unknown action.' }, { status: 422, headers });
  try {
    const result = await signedBotCall<{ delivery: Delivery }>('POST', `/billing/rust/deliveries/${id}/${action}`, check.discordId, {});
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof BotApiError) return NextResponse.json({ error: error.message, code: error.code }, { status: [403, 404, 409, 503, 504].includes(error.status) ? error.status : 502, headers });
    return NextResponse.json({ error: 'Cloudy could not change this delivery.' }, { status: 502, headers });
  }
}
