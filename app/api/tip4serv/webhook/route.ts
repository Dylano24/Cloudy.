import { NextRequest, NextResponse } from 'next/server';
import { isKnownPaymentEvent, parsePaymentEvent, recordFromEvent, verifyPaymentSignature } from '@/lib/finance';
import { saveEntitlementOutcome, saveFinanceRecord } from '@/lib/finance-store';
import { matchCheckoutIdentity } from '@/lib/account-links-store';
import { entitlementActions, entitlementConfig } from '@/lib/store-entitlements';
import { dispatchEntitlements } from '@/lib/entitlement-dispatch';

const RETRY_AFTER_SECONDS = '60';

export async function POST(request: NextRequest) {
  const secret = process.env.TIP4SERV_WEBHOOK_SECRET;
  const store = process.env.TIP4SERV_STORE_ID;
  if (!secret || !store) return NextResponse.json({error:'Payment logging is not configured.'},{status:503});
  if (Number(request.headers.get('content-length') || 0) > 262144) return new NextResponse(null,{status:413});
  const body = await request.text();
  if (Buffer.byteLength(body) > 262144) return new NextResponse(null,{status:413});
  if (!verifyPaymentSignature(body,request.headers.get('x-pay-timestamp') || '',request.headers.get('x-pay-signature') || '',secret)) return new NextResponse(null,{status:401});
  let json: unknown;
  try { json = JSON.parse(body); } catch { return NextResponse.json({error:'Invalid payment event, store or environment.'},{status:400}); }
  // Signed but of a kind Cloudy does not use: acknowledge, so Tip4Serv does not retry it for days.
  const name = json && typeof json === 'object' ? (json as { event?: unknown }).event : undefined;
  if (!isKnownPaymentEvent(name)) return NextResponse.json({received:true,ignored:true},{status:202});
  let event, record;
  try {
    event = parsePaymentEvent(json, store, process.env.VERCEL_ENV === 'production' ? 'live' : 'test');
    record = recordFromEvent(event);
  }
  catch { return NextResponse.json({error:'Invalid payment event, store or environment.'},{status:400}); }
  try {
    const identity = await matchCheckoutIdentity(record.discordId,record.steamId||'',record.email);
    if (identity) { record.cloudyId=identity.cloudyId; record.googleId=identity.googleId; record.linkStatus='Verified account'; }
    await saveFinanceRecord(record);
  } catch { return NextResponse.json({error:'Could not save payment. Retry delivery.'},{status:503}); }

  // Unlock what was bought. Every step is idempotent, so a retried webhook is safe.
  const { actions, problems } = entitlementActions(event, entitlementConfig());
  if (!actions.length && !problems.length) return NextResponse.json({received:true});
  const dispatched = await dispatchEntitlements(actions, problems, { fallbackActor: record.discordId && /^\d{17,20}$/.test(record.discordId) ? record.discordId : '0'.repeat(17) });
  if (dispatched.retry) {
    console.warn(`[store] Entitlements for ${record.id} will be retried: ${dispatched.reason}`);
    return NextResponse.json({error:'Cloudy could not apply this purchase yet. Retry delivery.'},{status:503,headers:{'Retry-After':RETRY_AFTER_SECONDS}});
  }
  try { await saveEntitlementOutcome(record.id, { event: event.event, outcomes: dispatched.outcomes, problems: dispatched.problems }); }
  catch { /* the ledger entry and the entitlements are already saved */ }
  if (dispatched.problems.length || dispatched.outcomes.some(outcome => outcome.status === 'rejected')) console.warn(`[store] Purchase ${record.id} needs staff attention`);
  return NextResponse.json({received:true});
}
