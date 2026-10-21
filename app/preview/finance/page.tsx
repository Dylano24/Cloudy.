import { notFound } from 'next/navigation';
import { FinanceOverview } from '@/components/account/finance-overview';
export const dynamic='force-dynamic';
export const metadata={title:'Cloudy · Finance preview',robots:{index:false,follow:false}};
export default function FinancePreview(){if(process.env.VERCEL_ENV!=='preview'&&process.env.NODE_ENV!=='development')notFound();return <FinanceOverview demo/>;}
