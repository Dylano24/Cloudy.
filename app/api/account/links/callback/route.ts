import { NextRequest, NextResponse } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from '@/lib/account-session';
import { cloudyAccountId } from '@/lib/finance';
import { saveAccountLink } from '@/lib/account-links-store';
export async function GET(request:NextRequest){
  const finish=(error=false)=>{const response=NextResponse.redirect(new URL(`/link-account?${error?'link_error=failed':'linked=1'}`,request.url));response.cookies.set('cloudy-link-state','',{path:'/api/account/links/callback',maxAge:0});response.headers.set('Cache-Control','no-store');return response;};
  const user=decodeSession(request.cookies.get(SESSION_COOKIE)?.value,accountSigningSecret());
  if(!user)return finish(true);
  try{
    const state=JSON.parse(request.cookies.get('cloudy-link-state')?.value||'null');
    const provider=request.nextUrl.searchParams.get('provider');
    if(!state||state.state!==request.nextUrl.searchParams.get('state')||state.account!==cloudyAccountId(user)||state.provider!==provider||Date.now()-state.issued>600000)return finish(true);
    const callback=new URL('/api/account/links/callback',request.url);callback.searchParams.set('provider',provider!);
    let id='';
    if(provider==='discord'){
      const code=request.nextUrl.searchParams.get('code');if(!code)return finish(true);
      const token=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID||'',client_secret:process.env.DISCORD_CLIENT_SECRET||'',code,grant_type:'authorization_code',redirect_uri:callback.toString()}),signal:AbortSignal.timeout(15000)});
      if(!token.ok)return finish(true);
      const {access_token}=await token.json();
      const profile=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:`Bearer ${access_token}`},cache:'no-store',signal:AbortSignal.timeout(15000)});
      if(!profile.ok)return finish(true);id=(await profile.json()).id;
    }else if(provider==='steam'){
      callback.searchParams.set('state',state.state);
      const params=request.nextUrl.searchParams;
      const identity=params.get('openid.claimed_id')||'';
      if(params.get('openid.mode')!=='id_res'||params.get('openid.return_to')!==callback.toString()||params.get('openid.identity')!==identity||!/^https:\/\/steamcommunity\.com\/openid\/id\/\d{17}$/.test(identity))return finish(true);
      const verify=new URLSearchParams([...params].filter(([key])=>key.startsWith('openid.')));verify.set('openid.mode','check_authentication');
      const response=await fetch('https://steamcommunity.com/openid/login',{method:'POST',body:verify,signal:AbortSignal.timeout(15000)});
      if(!response.ok||!/^is_valid:true\r?$/m.test(await response.text()))return finish(true);
      id=identity.split('/').pop()!;
    }else return finish(true);
    await saveAccountLink(user,provider,id);return finish();
  }catch{return finish(true);}
}
