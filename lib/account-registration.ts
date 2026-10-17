import type { AccountUser } from './account-session';

export function validateDisplayName(value: unknown): string | null {
  if (typeof value !== 'string' || /[\p{Cc}\p{Cf}]/u.test(value)) return null;
  const name = value.trim();
  return name.length >= 1 && name.length <= 50 ? name : null;
}

export async function resolveAccount(identity: AccountUser, find: (identity: AccountUser) => Promise<AccountUser | null>, create: (identity: AccountUser, name: string) => Promise<AccountUser>) {
  const user = await find(identity);
  if (user) return { kind: 'signed-in' as const, user };
  return { kind: 'signed-in' as const, user: await create(identity, identity.name) };
}
