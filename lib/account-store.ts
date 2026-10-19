import { createHash } from 'node:crypto';
import { get, put } from '@vercel/blob';
import type { AccountUser } from './account-session';
import { validateDisplayName } from './account-registration';

function pathname(identity: AccountUser) {
  if (!['google', 'discord'].includes(identity.provider || '')) throw new Error('Invalid provider');
  const environment = process.env.VERCEL_ENV === 'preview' ? 'preview-v1' : 'v1';
  return `accounts/${environment}/${createHash('sha256').update(`${identity.provider}:${identity.id}`).digest('hex')}.json`;
}

export async function findAccount(identity: AccountUser): Promise<AccountUser | null> {
  const blob = await get(pathname(identity), { access: 'private', useCache: false });
  if (!blob) return null;
  if (blob.statusCode !== 200 || !blob.stream || (blob.blob.size || 0) > 4096) throw new Error('Invalid account record');
  const record = await new Response(blob.stream).json();
  if (record.id !== identity.id || record.provider !== identity.provider || !validateDisplayName(record.name)) throw new Error('Invalid account record');
  return { id: record.id, provider: record.provider, name: record.name };
}

export async function createAccount(identity: AccountUser, name: string): Promise<AccountUser> {
  const user = { ...identity, name };
  try {
    await put(pathname(identity), JSON.stringify({ ...user, createdAt: new Date().toISOString() }), { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json', cacheControlMaxAge: 60 });
    return user;
  } catch (error) {
    // Concurrent registration must preserve the first saved account and name.
    const existing = await findAccount(identity);
    if (existing) return existing;
    throw error;
  }
}

export async function updateAccountName(identity: AccountUser, name: string): Promise<AccountUser | null> {
  const account = await findAccount(identity);
  if (!account) return null;
  const user = { ...account, name };
  await put(pathname(identity), JSON.stringify({ ...user, updatedAt: new Date().toISOString() }), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true,
    contentType: 'application/json', cacheControlMaxAge: 60,
  });
  return user;
}
