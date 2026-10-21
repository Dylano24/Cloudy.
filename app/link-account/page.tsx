import { AccountLinks } from '@/components/account/account-links';
export default function LinkAccountPage() {
  return <div className="cloudy-black-page min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-4xl"><p className="mb-3 text-xs font-bold tracking-widest text-red-500">CLOUDY ACCOUNT</p><h1 className="text-4xl font-bold text-white sm:text-6xl">Link your account</h1><div className="mt-6 h-0.5 w-16 bg-red-600"/><AccountLinks/></div></div>;
}
