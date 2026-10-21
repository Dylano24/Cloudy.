import { NextRequest, NextResponse } from 'next/server';
import { paymentRecord, verifyPaymentSignature } from '@/lib/finance';
import { saveFinanceRecord } from '@/lib/finance-store';
import { matchCheckoutIdentity } from '@/lib/account-links-store';

export async function POST(request: NextRequest) {
  const secret = process.env.TIP4SERV_WEBHOOK_SECRET;
  const store = process.env.TIP4SERV_STORE_ID;
  if (!secret || !store) return NextResponse.json({error:'Payment logging is not configured.'},{status:503});
  if (Number(request.headers.get('content-length') || 0) > 262144) return new NextResponse(null,{status:413});
  const body = await request.text();
  if (Buffer.byteLength(body) > 262144) return new NextResponse(null,{status:413});
  if (!verifyPaymentSignature(body,request.headers.get('x-pay-timestamp') || '',request.headers.get('x-pay-signature') || '',secret)) return new NextResponse(null,{status:401});
  let record;
  try { record = paymentRecord(JSON.parse(body), store, process.env.VERCEL_ENV === 'production' ? 'live' : 'test'); }
  catch { return NextResponse.json({error:'Invalid payment event, store or environment.'},{status:400}); }
  try {
    const identity = await matchCheckoutIdentity(record.discordId,record.steamId||'',record.email);
    if (identity) { record.cloudyId=identity.cloudyId; record.googleId=identity.googleId; record.linkStatus='Verified account'; }
    await saveFinanceRecord(record);
    return NextResponse.json({received:true});
  } catch { return NextResponse.json({error:'Could not save payment. Retry delivery.'},{status:503}); }
}
