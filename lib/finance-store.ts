import { get, list, put } from '@vercel/blob';
import { createHash } from 'node:crypto';
import type { FinanceRecord } from './finance';

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
