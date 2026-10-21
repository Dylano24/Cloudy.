import { NextRequest } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE } from './account-session';
import { getAccountLinks, saveCheckoutIdentity } from './account-links-store';
import { checkLinks } from './checkout-link-policy';
import { config } from './config';
import { getStoreWhoami } from './api-client';
export async function guardCheckout(request:NextRequest,store:string,products:{product_id:number}[],email?:string){
  if(request.headers.get('origin')!==request.nextUrl.origin)return {ok:false,error:'Invalid request origin.',status:403};
  const user=decodeSession(request.cookies.get(SESSION_COOKIE)?.value,accountSigningSecret());
  if(!user)return {ok:false,error:'Sign in to your Cloudy account before purchasing.',status:401};
  // Preview never creates a real payment or contacts a live checkout session.
  if(process.env.VERCEL_ENV==='preview')return {ok:false,error:'Preview only — real payments are disabled.',status:409};
  if(!products.length||products.length>100||products.some(p=>!Number.isSafeInteger(p.product_id)||p.product_id<1))return {ok:false,error:'Invalid products.',status:400};
  const official=await getStoreWhoami();
  if(!official||String(official.id)!==store)return {ok:false,error:'Store is temporarily unavailable.',status:503};
  const response=await fetch(`${config.api.baseUrl}/store/checkout/identifiers?store=${encodeURIComponent(store)}&products=${encodeURIComponent(JSON.stringify(products.map(p=>p.product_id)))}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return {ok:false,error:'Could not verify purchase requirements. Please retry.',status:503};
  const data=await response.json();const required=Array.isArray(data)?data:data.identifiers;
  if(!Array.isArray(required)||required.some(id=>typeof id!=='string'))return {ok:false,error:'Invalid purchase requirements.',status:503};
  const links=await getAccountLinks(user);const check=checkLinks(user,required,links);
  if(!check.ok)return {...check,status:409};
  if(email)await saveCheckoutIdentity(user,email,check.verified!);
  return {ok:true,verified:check.verified,status:200};
}
