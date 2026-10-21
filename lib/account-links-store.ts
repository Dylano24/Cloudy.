import { createHash } from 'node:crypto';
import { get, list, put } from '@vercel/blob';
import type { AccountUser } from './account-session';
import type { VerifiedLinks } from './checkout-link-policy';
import { cloudyAccountId } from './finance';
import { financePrefix } from './finance-store';

function path(user: AccountUser, provider: string) { return `${financePrefix()}links/${cloudyAccountId(user)}/${provider}.json`; }
export async function getAccountLinks(user: AccountUser): Promise<VerifiedLinks> {
  const result: VerifiedLinks = user.provider === 'discord' || !user.provider ? { discord_id: user.id } : {};
  for (const provider of ['steam','discord'] as const) {
    const blob = await get(path(user, provider), { access: 'private', useCache: false });
    if (!blob) continue;
    if (blob.statusCode !== 200 || !blob.stream) throw new Error('Unable to load account links');
    const record = await new Response(blob.stream).json();
    if (record.cloudyId !== cloudyAccountId(user) || !/^\d{17,20}$/.test(record.id)) throw new Error('Invalid account link');
    result[provider === 'steam' ? 'steam_id' : 'discord_id'] = record.id;
  }
  return result;
}
export async function saveAccountLink(user: AccountUser, provider: 'steam' | 'discord', id: string) {
  if (!/^\d{17,20}$/.test(id)) throw new Error('Invalid linked identity');
  const record = { cloudyId: cloudyAccountId(user), discordId: provider === 'discord' ? id : '', googleId: user.provider === 'google' ? user.id : '', id, linkedAt: new Date().toISOString() };
  await put(path(user, provider), JSON.stringify(record), { access:'private', addRandomSuffix:false, allowOverwrite:true, contentType:'application/json' });
}

// Index verified provider identities only. Ambiguous ownership never gets guessed.
function identityKey(discordId: string, steamId: string, email: string) {
  return createHash('sha256').update(`${discordId}:${steamId}:${email.toLowerCase()}`).digest('hex');
}
export async function saveCheckoutIdentity(user: AccountUser, email: string, links: VerifiedLinks) {
  if(!links.discord_id&&!links.steam_id)return;
  const identity={cloudyId:cloudyAccountId(user),googleId:user.provider==='google'?user.id:'',discordId:links.discord_id||'',steamId:links.steam_id||'',email};
  const pairs=[[identity.discordId,identity.steamId]];
  if(identity.discordId&&identity.steamId)pairs.push([identity.discordId,''],['',identity.steamId]);
  for(const [discord,steam] of pairs){
    const file=`${financePrefix()}checkout-identities/${identityKey(discord,steam,email)}/${identity.cloudyId}.json`;
    try{await put(file,JSON.stringify(identity),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});}
    catch(error){const exists=await get(file,{access:'private',useCache:false});if(!exists||exists.statusCode!==200)throw error;}
  }
}
export async function matchCheckoutIdentity(discordId: string, steamId: string, email: string) {
  if(!discordId&&!steamId)return null;
  const prefix=`${financePrefix()}checkout-identities/${identityKey(discordId,steamId,email)}/`;
  const candidates=await list({prefix,limit:2});
  if(candidates.blobs.length!==1||candidates.hasMore)return null;
  const blob=await get(candidates.blobs[0].pathname,{access:'private',useCache:false});
  if(!blob||blob.statusCode!==200||!blob.stream)throw new Error('Identity lookup unavailable');
  return await new Response(blob.stream).json() as {cloudyId:string;googleId:string;discordId:string;steamId:string;email:string};
}
