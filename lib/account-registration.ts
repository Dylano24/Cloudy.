import type { AccountUser } from './account-session';

export function validateDisplayName(value: unknown): string | null {
  if (typeof value !== 'string' || /[\p{Cc}\p{Cf}]/u.test(value)) return null;
  const name = value.trim();
  return name.length >= 1 && name.length <= 50 ? name : null;
}

export async function resolveAccount(identity: AccountUser, intent: 'login' | 'create', find: (identity: AccountUser) => Promise<AccountUser | null>) {
  const user = await find(identity);
  if (user) return { kind: 'signed-in' as const, user };
  return intent === 'create' ? { kind: 'register' as const, identity } : { kind: 'missing' as const };
}
