import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';
import { cloudyAccountId } from '@/lib/finance';
export async function GET(request:NextRequest){
  const user=decodeSession(request.cookies.get(SESSION_COOKIE)?.value,accountSigningSecret());
  if(!user)return NextResponse.redirect(new URL('/account',request.url));
  const provider=request.nextUrl.searchParams.get('provider');
  if(provider!=='steam'&&provider!=='discord')return new NextResponse(null,{status:400});
  if(provider==='discord'&&(!process.env.DISCORD_CLIENT_ID||!process.env.DISCORD_CLIENT_SECRET))return NextResponse.redirect(new URL('/link-account?link_error=unavailable',request.url));
  const state=randomBytes(32).toString('hex');
  const callback=new URL('/api/account/links/callback',request.url);callback.searchParams.set('provider',provider);
  let destination:URL;
  if(provider==='discord'){
    destination=new URL('https://discord.com/oauth2/authorize');
    destination.search=new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID!,redirect_uri:callback.toString(),response_type:'code',scope:'identify',state}).toString();
  }else{
    callback.searchParams.set('state',state);
    destination=new URL('https://steamcommunity.com/openid/login');
    destination.search=new URLSearchParams({'openid.ns':'http://specs.openid.net/auth/2.0','openid.mode':'checkid_setup','openid.return_to':callback.toString(),'openid.realm':request.nextUrl.origin,'openid.identity':'http://specs.openid.net/auth/2.0/identifier_select','openid.claimed_id':'http://specs.openid.net/auth/2.0/identifier_select'}).toString();
  }
  const response=NextResponse.redirect(destination);
  response.cookies.set('cloudy-link-state',JSON.stringify({state,provider,account:cloudyAccountId(user),issued:Date.now()}),{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/api/account/links/callback',maxAge:600});
  response.headers.set('Cache-Control','no-store');return response;
}
