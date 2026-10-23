import { createHash } from 'node:crypto';
import { get, put } from '@vercel/blob';
import type { AccountUser } from './account-session';

export type Favorite = { id: number; slug: string; name: string };

function pathname(user: AccountUser) {
  const environment = process.env.VERCEL_ENV === 'preview' ? 'preview-v1' : 'v1';
  const key = createHash('sha256').update(`${user.provider || 'discord'}:${user.id}`).digest('hex');
  return `favorites/${environment}/${key}.json`;
}

export async function readFavorites(user: AccountUser): Promise<Favorite[]> {
  const blob = await get(pathname(user), { access: 'private', useCache: false });
  if (!blob) return [];
  if (blob.statusCode !== 200 || !blob.stream || (blob.blob.size || 0) > 16000) throw new Error('Invalid favorites record');
  const data: unknown = await new Response(blob.stream).json();
  if (!Array.isArray(data) || data.length > 100) throw new Error('Invalid favorites record');
  return data.filter((item): item is Favorite => item && typeof item === 'object' &&
    Number.isSafeInteger(item.id) && item.id > 0 && typeof item.slug === 'string' && item.slug.length <= 150 &&
    typeof item.name === 'string' && item.name.length <= 120);
}

export async function writeFavorites(user: AccountUser, favorites: Favorite[]) {
  await put(pathname(user), JSON.stringify(favorites), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true,
    contentType: 'application/json', cacheControlMaxAge: 60,
  });
}
