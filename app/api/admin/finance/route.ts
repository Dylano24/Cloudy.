import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';
import { isFinanceAdmin, verifyFinanceAccess, type FinanceRecord } from '@/lib/finance';
import { financeRecords, saveFinanceRecord } from '@/lib/finance-store';
import { financeCsv } from '@/lib/finance-view';

const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex'};
function allowed(request:NextRequest) { return isFinanceAdmin(decodeSession(request.cookies.get(SESSION_COOKIE)?.value,accountSigningSecret())) && verifyFinanceAccess(request.headers.get('x-cloudy-finance-key')||''); }
export async function GET(request:NextRequest) {
  if (!allowed(request)) return NextResponse.json({error:'Sign in with an authorized Cloudy account.'},{status:403,headers});
  try {
    const rows=await financeRecords();
    if(request.nextUrl.searchParams.get('format')==='csv') return new NextResponse(financeCsv(rows),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="cloudy-finance.csv"'}});
    return NextResponse.json({rows,configured:Boolean(process.env.TIP4SERV_WEBHOOK_SECRET && process.env.TIP4SERV_STORE_ID)},{headers});
  } catch { return NextResponse.json({error:'Could not load the complete overview. Please try again.'},{status:503,headers}); }
}
const expenseSchema=z.object({kind:z.enum(['expense','refund']),id:z.string().uuid(),timestamp:z.string().datetime(),description:z.string().trim().min(1).max(500),amount:z.number().positive().max(10000000).refine(n=>Math.abs(n*100-Math.round(n*100))<0.000001),currency:z.enum(['EUR','USD','GBP'])});
export async function POST(request:NextRequest) {
  if(!allowed(request) || request.headers.get('origin')!==request.nextUrl.origin) return new NextResponse(null,{status:403,headers});
  if(Number(request.headers.get('content-length')||0)>2048) return new NextResponse(null,{status:413,headers});
  let data;
  try{const body=await request.text();if(body.length>2048)throw new Error();data=expenseSchema.parse(JSON.parse(body));}catch{return NextResponse.json({error:'Enter a valid description, date and positive amount with at most two decimals.'},{status:400,headers});}
  const row:FinanceRecord={id:`expense-${data.id}`,economicKey:`expense-${data.id}`,timestamp:data.timestamp,description:data.description,amountMinor:Math.round(data.amount*100),currency:data.currency,kind:data.kind,paymentId:'',transactionId:'',cloudyId:'',discordId:'',googleId:'',email:'',ingameId:'',linkStatus:'Not applicable',mode:process.env.VERCEL_ENV==='production'?'live':'test',items:[]};
  try {await saveFinanceRecord(row);return NextResponse.json({saved:true},{headers});}catch{return NextResponse.json({error:'Could not save expense. Please retry.'},{status:503,headers});}
}
