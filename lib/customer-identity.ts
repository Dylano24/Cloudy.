import type { NextRequest } from 'next/server';
import { accountSigningSecret, decodeSession, SESSION_COOKIE, type AccountUser } from './account-session';
import { getAccountLinks } from './account-links-store';
import { cloudyAccountId } from './finance';
import type { CustomerIdentity } from './customer-orders';

export function sessionUser(request: NextRequest) {
  return decodeSession(request.cookies.get(SESSION_COOKIE)?.value, accountSigningSecret());
}

/** The signed-in customer's proven identities: account, Discord login and OAuth-linked accounts. */
export async function customerIdentity(user: AccountUser): Promise<CustomerIdentity> {
  const links = await getAccountLinks(user);
  return {
    cloudyId: cloudyAccountId(user),
    discordIds: [links.discord_id].filter((id): id is string => typeof id === 'string'),
    steamIds: [links.steam_id].filter((id): id is string => typeof id === 'string'),
  };
}
