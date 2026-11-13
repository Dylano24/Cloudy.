import { NextRequest, NextResponse } from 'next/server';
import { BotApiError, signedBotCall } from '@/lib/bot-dashboard/bot-api';
import { getAccountLinks } from '@/lib/account-links-store';
import { DELIVERY_STATUSES, sessionFrom, staffFromSession, type Delivery, type DeliveryOverview } from '@/lib/delivery-admin';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

async function staff(request: NextRequest) {
  const user = sessionFrom(request);
  const links = user && user.provider !== 'discord' && user.provider ? await getAccountLinks(user).catch(() => ({ discord_id: undefined })) : {};
  return staffFromSession(user, (links as { discord_id?: string }).discord_id);
}

export async function GET(request: NextRequest) {
  const check = await staff(request);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status, headers });
  const status = request.nextUrl.searchParams.get('status') || '';
  try {
    const info = await signedBotCall<Omit<DeliveryOverview, 'deliveries'>>('GET', '/billing/rust/status', check.discordId);
    if (info.mode === 'off') return NextResponse.json({ ...info, deliveries: [] }, { headers });
    const list = await signedBotCall<{ deliveries: Delivery[]; counts: DeliveryOverview['counts'] }>('POST', '/billing/rust/deliveries/query', check.discordId, {
      status: (DELIVERY_STATUSES as readonly string[]).includes(status) ? status : undefined, limit: 200,
    });
    return NextResponse.json({ ...info, counts: list.counts, deliveries: list.deliveries }, { headers });
  } catch (error) {
    if (error instanceof BotApiError) return NextResponse.json({ error: error.message, code: error.code }, { status: [403, 503, 504].includes(error.status) ? error.status : 502, headers });
    return NextResponse.json({ error: 'Cloudy could not load the deliveries.' }, { status: 502, headers });
  }
}
