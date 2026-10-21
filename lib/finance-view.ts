import type { FinanceRecord } from './finance';

export function financeTotals(records: FinanceRecord[]) {
  const totals: Record<string, { sales: number; income: number; expenses: number; refunds: number; balance: number }> = {};
  const seen = new Set<string>();
  for (const row of records) {
    if (seen.has(row.economicKey)) continue;
    seen.add(row.economicKey);
    const bucket = totals[row.currency] ||= { sales: 0, income: 0, expenses: 0, refunds: 0, balance: 0 };
    if (row.kind === 'sale') { bucket.sales++; bucket.income += row.amountMinor; }
    if (row.kind === 'refund' && row.amountConfirmed !== false) bucket.refunds += row.amountMinor;
    if (row.kind === 'expense') bucket.expenses += row.amountMinor;
    bucket.balance = bucket.income - bucket.refunds - bucket.expenses;
  }
  return totals;
}
export function financeCsv(records: FinanceRecord[]) {
  const cell = (value: unknown, asText = false) => {
    let v = String(value ?? '');
    if ((asText && v) || /^[\s]*[=+\-@\t\r\n]/.test(v)) v = `'${v}`;
    return `"${v.replaceAll('"', '""')}"`;
  };
  const headers = ['Date/time (UTC)', 'Type', 'Purchase / expense', 'Amount', 'Currency', 'Payment ID', 'Transaction ID', 'Cloudy ID', 'Discord ID', 'Google ID', 'Email', 'In-game ID', 'Link status', 'Mode', 'Event ID'];
  return '\uFEFF' + [headers.map(v => cell(v)).join(','), ...records.map(r => [
    cell(r.timestamp), cell(r.kind), cell(r.description), cell(r.amountConfirmed === false ? 'Unconfirmed' : (r.amountMinor / 100).toFixed(2)), cell(r.currency),
    cell(r.paymentId, true), cell(r.transactionId, true), cell(r.cloudyId, true), cell(r.discordId, true), cell(r.googleId, true),
    cell(r.email), cell(r.ingameId, true), cell(r.linkStatus), cell(r.mode), cell(r.id, true),
  ].join(','))].join('\r\n');
}
