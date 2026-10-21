import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';
import { getAccountLinks } from '@/lib/account-links-store';
import { cloudyAccountId } from '@/lib/finance';
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:NextRequest){
  const user=decodeSession(request.cookies.get(SESSION_COOKIE)?.value,accountSigningSecret());
  if(!user)return NextResponse.json({error:'Sign in to link your accounts.'},{status:401,headers});
  try{return NextResponse.json({cloudyId:cloudyAccountId(user),googleId:user.provider==='google'?user.id:null,links:await getAccountLinks(user)},{headers});}
  catch{return NextResponse.json({error:'Account links are temporarily unavailable.'},{status:503,headers});}
}
