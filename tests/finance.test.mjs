import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

let finance;
try { finance = {...await import('../lib/finance.ts'), ...await import('../lib/finance-view.ts')}; } catch {}
const payload = { event: 'payment.success', created_at: '2026-10-21T12:00:00Z', request_id: 'event-1', store_id: '31', mode: 'test', data: { id: 12, type: 1, amount: { total_paid: 12.5, currency: 'EUR' }, user: { email: 'player@example.invalid', discord_id: '123456789012345678' }, basket: [{ id: '4', name: 'VIP', price: '12.50', quantity: '1' }] } };

test('only fresh signed provider payloads are accepted', () => {
  assert.ok(finance, 'payment verification is missing');
  const body = JSON.stringify(payload), secret = Buffer.from('unit-test-secret').toString('base64');
  const signature = createHmac('sha256', Buffer.from(secret, 'base64')).update(`1000.${body}`).digest('hex');
  assert.equal(finance.verifyPaymentSignature(body, '1000', signature, secret, 1001), true);
  for (const [b, time, sig, key, now] of [[body+' ', '1000', signature, secret, 1001], [body, '1000', signature, secret, 1400], [body, 'no', signature, secret, 1001], [body, '1000', 'x', secret, 1001], [body,'1000',signature,'',1001]]) {
    assert.equal(finance.verifyPaymentSignature(b,time,sig,key,now),false);
  }
});

test('payment records preserve provider IDs, decimal money and missing-link state', () => {
  assert.ok(finance, 'payment normalization is missing');
  const row = finance.paymentRecord(payload, '31', 'test');
  assert.equal(row.amountMinor, 1250);
  assert.equal(row.discordId, '123456789012345678');
  assert.equal(row.cloudyId, '');
  assert.equal(row.linkStatus, 'Not linked');
  assert.equal(row.items[0].quantity, 1);
  assert.throws(() => finance.paymentRecord({...payload,mode:'live'}, '31','test'));
  assert.throws(() => finance.paymentRecord(payload, '99','test'));
  assert.throws(() => finance.paymentRecord({...payload,data:{...payload.data,amount:{total_paid:-1,currency:'EUR'}}},'31','test'));
});

test('retries and seller resends never inflate revenue and currencies remain separate', () => {
  assert.ok(finance, 'ledger totals are missing');
  const row=finance.paymentRecord(payload,'31','test');
  const expense={...row,id:'expense-1',economicKey:'expense-1',kind:'expense',amountMinor:250};
  const failed={...row,id:'failed',economicKey:'failed',kind:'failed',amountMinor:9900};
  const usd={...row,id:'usd',economicKey:'usd',currency:'USD',amountMinor:999};
  const totals=finance.financeTotals([row,{...row,id:'resend'},expense,failed,usd]);
  assert.deepEqual(totals.EUR,{sales:1,income:1250,expenses:250,refunds:0,balance:1000});
  assert.equal(totals.USD.balance,999);
});

test('CSV preserves full text IDs and neutralizes spreadsheet formulas', () => {
  assert.ok(finance, 'CSV export is missing');
  const csv=finance.financeCsv([{...finance.paymentRecord(payload,'31','test'),description:'=HYPERLINK("bad")',googleId:'123456789012345678901'}]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes("'123456789012345678901"));
  assert.ok(csv.includes('12.50'));
});

test('finance administration requires an authenticated allowlisted identity', () => {
  assert.ok(finance, 'admin authorization is missing');
  assert.equal(finance.isFinanceAdmin(null,'email:owner@example.com'),false);
  assert.equal(finance.isFinanceAdmin({id:'1',provider:'google'},'email:owner@example.com'),false);
  assert.equal(finance.isFinanceAdmin({id:'1',provider:'email',email:'Owner@Example.com'},'email:owner@example.com'),true);
});

test('an unverified email registration alone cannot open financial records',()=>{
  assert.equal(typeof finance.verifyFinanceAccess,'function','private finance access key is missing');
  assert.equal(finance.verifyFinanceAccess('','private-owner-key'),false);
  assert.equal(finance.verifyFinanceAccess('wrong','private-owner-key'),false);
  assert.equal(finance.verifyFinanceAccess('private-owner-key',''),false);
  assert.equal(finance.verifyFinanceAccess('private-owner-key','private-owner-key'),true);
});

test('a refund notification never substitutes total paid for an unconfirmed refund amount',()=>{
  const row=finance.paymentRecord({...payload,event:'payment.refund'},'31','test');
  assert.equal(row.amountConfirmed,false);
  assert.equal(finance.financeTotals([row]).EUR.refunds,0);
});
