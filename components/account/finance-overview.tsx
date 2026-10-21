'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { FinanceRecord } from '@/lib/finance';
import { financeCsv, financeTotals } from '@/lib/finance-view';
import styles from './finance-overview.module.css';

const money=(n:number,currency:string)=>new Intl.NumberFormat('en-GB',{style:'currency',currency}).format(n/100);
export function FinanceOverview({demo=false}:{demo?:boolean}) {
  const [rows,setRows]=useState<FinanceRecord[]>([]);
  const [loading,setLoading]=useState(!demo),[error,setError]=useState(''),[query,setQuery]=useState(''),[kind,setKind]=useState('all');
  const [from,setFrom]=useState(''),[until,setUntil]=useState(''),[busy,setBusy]=useState(false),[configured,setConfigured]=useState(true);
  const [expenseId,setExpenseId]=useState('');
  const [accessKey,setAccessKey]=useState('');
  const [submittedKey,setSubmittedKey]=useState('');
  useEffect(()=>{setExpenseId(crypto.randomUUID());},[]);
  useEffect(()=>{
    if(demo){import('@/lib/finance-demo').then(({financeDemo})=>setRows(financeDemo));return;}
    if(!submittedKey){setLoading(false);return;}
    let cancelled=false;setLoading(true);setError('');
    fetch('/api/admin/finance',{cache:'no-store',headers:{'x-cloudy-finance-key':submittedKey}}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error);return data;}).then(data=>{if(!cancelled){setRows(data.rows);setConfigured(data.configured);}}).catch(e=>{if(!cancelled)setError(e.message);}).finally(()=>{if(!cancelled)setLoading(false);});
    return()=>{cancelled=true;};
  },[demo,submittedKey]);
  const filtered=useMemo(()=>rows.filter(row=>(kind==='all'||row.kind===kind)&&(!from||row.timestamp.slice(0,10)>=from)&&(!until||row.timestamp.slice(0,10)<=until)&&JSON.stringify(row).toLowerCase().includes(query.toLowerCase())),[rows,kind,from,until,query]);
  const totals=financeTotals(filtered);
  async function addExpense(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError('');setBusy(true);const form=event.currentTarget;const data=new FormData(form);
    const entry={kind:String(data.get('kind')),id:expenseId,timestamp:new Date(String(data.get('date'))+'T12:00:00Z').toISOString(),description:String(data.get('description')),amount:Number(data.get('amount')),currency:String(data.get('currency'))};
    try{
      if(demo){setRows(previous=>[{...previous[0],id:`expense-${entry.id}`,economicKey:`expense-${entry.id}`,kind:entry.kind as 'expense'|'refund',amountConfirmed:true,description:entry.description,timestamp:entry.timestamp,amountMinor:Math.round(entry.amount*100),currency:entry.currency,cloudyId:'',discordId:'',googleId:'',email:'',ingameId:'',paymentId:'',transactionId:'',items:[],linkStatus:'Not applicable'},...previous]);}
      else{const response=await fetch('/api/admin/finance',{method:'POST',headers:{'Content-Type':'application/json','x-cloudy-finance-key':submittedKey},body:JSON.stringify(entry)});const result=await response.json();if(!response.ok)throw new Error(result.error);const refresh=await fetch('/api/admin/finance',{cache:'no-store',headers:{'x-cloudy-finance-key':submittedKey}});if(!refresh.ok)throw new Error('Expense saved; refresh the overview to load it.');setRows((await refresh.json()).rows);}
      form.reset();setExpenseId(crypto.randomUUID());
    }catch(e){setError(e instanceof Error?e.message:'Could not save expense.');}finally{setBusy(false);}
  }
  function download(){const url=URL.createObjectURL(new Blob([financeCsv(filtered)],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=demo?'cloudy-finance-example.csv':'cloudy-finance.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className={styles.page}><div className={styles.wrap}>
    <header className={styles.header}><p className={styles.eyebrow}>CLOUDY · FINANCE</p><h1>Every transaction.<br/><span>One clear overview.</span></h1><p>Sales, payment logs and expenses, with the account details you need.</p></header>
    {demo&&<aside className={styles.notice}><strong>Preview · fictional example data</strong><p>Explore the filters, payment details and CSV export. Added expenses stay in this view until you reload. No real purchases or accounts appear here.</p><Link href="/admin/finance">Open your private finance overview →</Link></aside>}
    {!demo&&<form className={styles.panel} onSubmit={e=>{e.preventDefault();setSubmittedKey(accessKey);}}><h2>Private finance access</h2><p className={styles.muted}>Sign in with your authorized Cloudy account, then enter your finance access key.</p><label className="mt-4 block text-sm">Access key<input className="mt-2" type="password" value={accessKey} onChange={e=>setAccessKey(e.target.value)} autoComplete="off" required/></label><button className="mt-4">Open overview</button></form>}
    {!configured&&!demo&&<p className={styles.notice}>Payment logging is ready for setup. Connect the Tip4Serv test webhook to start receiving confirmed payments. Existing purchases are not imported automatically.</p>}
    {error&&<p role="alert" className={styles.notice}>{error} <Link href="/account">Sign in</Link></p>}
    {loading?<p role="status">Loading your overview…</p>:<>
    <div className={styles.summary}>{Object.entries(totals).map(([currency,total])=><section key={currency}><p>{currency} · {total.sales} sales</p><dl><div><dt>Income</dt><dd>{money(total.income,currency)}</dd></div><div><dt>Expenses</dt><dd>{money(total.expenses,currency)}</dd></div><div><dt>Refunds</dt><dd>{money(total.refunds,currency)}</dd></div><div><dt>Balance</dt><dd>{money(total.balance,currency)}</dd></div></dl></section>)}</div>
    <section className={styles.panel}><div className={styles.sectionHead}><h2>Payment logs &amp; expenses</h2><button onClick={download} disabled={!filtered.length}>Export CSV for Excel ↓</button></div>
      <div className={styles.filters}><label>Search<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Purchase, email or account ID"/></label><label>Type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All transactions</option><option value="sale">Sales</option><option value="expense">Expenses</option><option value="refund">Refunds</option><option value="failed">Failed payments</option></select></label><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Until<input type="date" value={until} onChange={e=>setUntil(e.target.value)}/></label></div>
      <p className={styles.muted}>{filtered.length} events · dates shown in UTC · totals count each payment once</p>
      {!filtered.length?<p className={styles.empty}>{rows.length?'No transactions match these filters.':'No transactions yet. Confirmed payments and saved expenses will appear here.'}</p>:<div className={styles.tableWrap}><table><caption className={styles.srOnly}>Payment logs and expenses</caption><thead><tr><th>Date / time UTC</th><th>Purchase / expense</th><th>Type</th><th>Amount</th><th>Account &amp; linking</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id}><td>{new Date(row.timestamp).toISOString().replace('T',' ').slice(0,19)}</td><td>{row.description||'Payment'}<small>{row.paymentId&&`Payment ${row.paymentId}`}</small></td><td><span className={styles.badge}>{row.kind}</span></td><td className={styles.amount}>{row.amountConfirmed===false?'Amount to confirm':money(row.amountMinor,row.currency)}</td><td><details><summary>{row.email||'View details'} · {row.linkStatus}</summary><dl className={styles.identities}>{[['Cloudy ID',row.cloudyId],['Discord ID',row.discordId],['Google ID',row.googleId],['Email',row.email],['In-game ID',row.ingameId],['Link status',row.linkStatus],['Transaction ID',row.transactionId]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'Not available'}</dd></div>)}</dl></details></td></tr>)}</tbody></table></div>}
    </section>
    <section className={styles.panel}><h2>Add an expense or confirmed refund</h2><p className={styles.muted}>Record hosting, software and other costs in the same overview. Amounts include any tax or fees you enter.</p><form onSubmit={addExpense} className={styles.expense}><label>Type<select name="kind"><option value="expense">Expense</option><option value="refund">Confirmed refund</option></select></label><label>Description<input name="description" required maxLength={500} placeholder="Server hosting"/></label><label>Date<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/></label><label>Amount<input name="amount" type="number" min="0.01" max="10000000" step="0.01" required placeholder="0.00"/></label><label>Currency<select name="currency"><option>EUR</option><option>USD</option><option>GBP</option></select></label><button disabled={busy||!expenseId}>{busy?'Saving…':'Add expense'}</button></form></section>
    {filtered.some(row=>row.amountConfirmed===false)&&<p role="status" className={styles.notice}>Refund notification received. Confirm the actual refunded amount from the payment provider and record it as a confirmed refund. The provisional balance excludes unconfirmed refund amounts.</p>}
    <p className={styles.muted}>Balance = confirmed income − refunds − recorded expenses. Payment processing fees must be recorded as expenses. Each currency is kept separate. CSV opens in Excel; import ID columns as text to keep all digits.</p>
    </>}
  </div></div>;
}
