import { get, list, put } from '@vercel/blob';
import { createHash } from 'node:crypto';
import type { FinanceRecord } from './finance';
import { customerIdentityKeys, identityFolder, ownsRecord, recordIdentityKeys, type CustomerIdentity } from './customer-orders';

export function financePrefix() {
  return process.env.VERCEL_ENV === 'production' ? 'finance/v1/live/' : `finance/v1/preview/${createHash('sha256').update(process.env.VERCEL_GIT_COMMIT_REF || 'local').digest('hex').slice(0,16)}/`;
}
export async function saveFinanceRecord(record: FinanceRecord) {
  const path = `${financePrefix()}events/${record.id}.json`;
  try {
    await put(path, JSON.stringify(record), { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json' });
  } catch (error) {
    // An immutable event exists: acknowledge retries only after confirming persistence.
    const existing = await get(path, { access: 'private', useCache: false });
    if (!existing || existing.statusCode !== 200) throw error;
  }
  // File the entry under each verified identity, so "My orders" never scans the whole ledger.
  for (const key of recordIdentityKeys(record)) {
    await put(`${financePrefix()}customers/${identityFolder(key)}/${record.id}.json`, JSON.stringify({ id: record.id }), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
  }
}

const MAX_CUSTOMER_RECORDS = 500;

/** The ledger entries filed under a customer's verified identities, checked again on read. */
export async function customerRecords(identity: CustomerIdentity): Promise<FinanceRecord[]> {
  const ids = new Set<string>();
  for (const key of customerIdentityKeys(identity)) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${financePrefix()}customers/${identityFolder(key)}/`, cursor, limit: 1000 });
      for (const blob of page.blobs) {
        const id = blob.pathname.split('/').pop()?.replace(/\.json$/, '') || '';
        if (/^[a-f0-9]{64}$/.test(id)) ids.add(id);
      }
      cursor = page.hasMore && ids.size < MAX_CUSTOMER_RECORDS ? page.cursor : undefined;
    } while (cursor);
  }
  const rows: FinanceRecord[] = [];
  const all = [...ids].slice(0, MAX_CUSTOMER_RECORDS);
  for (let start = 0; start < all.length; start += 20) {
    const batch = await Promise.all(all.slice(start, start + 20).map(async id => {
      const blob = await get(`${financePrefix()}events/${id}.json`, { access: 'private', useCache: false });
      if (!blob || blob.statusCode !== 200 || !blob.stream) return null;
      return await new Response(blob.stream).json() as FinanceRecord;
    }));
    for (const row of batch) if (row && ownsRecord(row, identity)) rows.push(row);
  }
  return rows;
}
export async function financeRecords(): Promise<FinanceRecord[]> {
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${financePrefix()}events/`, cursor, limit: 1000 });
    paths.push(...page.blobs.map(blob => blob.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
    if (paths.length > 10000) throw new Error('Export is too large; request a date-scoped archive.');
  } while (cursor);
  const rows: FinanceRecord[] = [];
  for (let start = 0; start < paths.length; start += 20) {
    rows.push(...await Promise.all(paths.slice(start,start+20).map(async path => {
      const blob = await get(path, { access: 'private', useCache: false });
      if (!blob || blob.statusCode !== 200 || !blob.stream) throw new Error('Could not load the complete ledger.');
      return await new Response(blob.stream).json() as FinanceRecord;
    })));
  }
  return rows.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
}

/** What a payment unlocked (or why it could not): one overwritable entry per webhook event. */
export async function saveEntitlementOutcome(recordId: string, outcome: unknown) {
  await put(`${financePrefix()}entitlements/${recordId}.json`, JSON.stringify({ at: new Date().toISOString(), ...(outcome as object) }), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
}
