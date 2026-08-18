import Link from 'next/link';
import { ArrowRight, CheckCircle2, Cloud, Gamepad2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { ProductsGrid } from '@/components/home/products-grid';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora left-[-8rem] top-24 h-96 w-96 bg-cyan-400" />
      <div className="aurora aurora-two right-[-10rem] top-[28rem] h-[30rem] w-[30rem] bg-blue-600" />

      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="cloud-panel relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:px-14 md:py-24">
          <div className="absolute inset-0 grid-pattern opacity-70" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <Sparkles className="h-4 w-4" /> Official Cloudy Rust Store
            </div>
            <h1 className="blue-text text-6xl font-black tracking-tight sm:text-7xl md:text-8xl">CLOUDY</h1>
            <p className="mt-4 text-xl font-black uppercase tracking-[.32em] text-cyan-300 md:text-2xl">Rise above the rest</p>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Upgrade your Rust experience with exclusive ranks, powerful kits and premium perks made for the Cloudy community.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/shop" className="gradient-primary inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-black text-[#020817] shadow-xl shadow-blue-500/25 transition hover:-translate-y-1">
                Explore the store <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#products" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-white/5 px-8 py-4 font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10">
                View products
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-6 grid gap-4 px-4 sm:grid-cols-3 md:px-10">
          {[
            [Zap, 'Instant delivery', 'Get your purchase fast'],
            [ShieldCheck, 'Secure payments', 'Protected by Tip4Serv'],
            [Gamepad2, 'Built for Rust', 'Made for Cloudy players'],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Zap;
            return (
              <div key={title as string} className="cloud-panel flex items-center gap-4 rounded-2xl p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-cyan-300"><I /></div>
                <div><div className="font-bold text-white">{title as string}</div><div className="text-sm text-muted">{text as string}</div></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.2em] text-cyan-300"><Cloud className="h-4 w-4" /> Welcome to Cloudy</div>
            <h2 className="text-4xl font-black text-white md:text-5xl">Everything you need to dominate.</h2>
          </div>
          <div className="space-y-3 text-slate-300">
            <p>Carefully selected Rust upgrades with reliable delivery and a smooth checkout experience.</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-cyan-300" /> Ranks, kits and exclusive rewards</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-cyan-300" /> Directly connected to your Cloudy account</p>
          </div>
        </div>
      </section>

      <section id="products" className="relative py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-2 text-center text-sm font-bold uppercase tracking-[.22em] text-cyan-300">Cloudy Store</div>
          <h2 className="text-center text-4xl font-black text-white md:text-5xl">Choose your upgrade</h2>
        </div>
        <ProductsGrid />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="cloud-panel relative overflow-hidden rounded-[2rem] p-10 text-center md:p-16">
          <div className="aurora left-1/3 top-0 h-52 w-52 bg-cyan-400" />
          <div className="relative z-10">
            <Cloud className="mx-auto mb-5 h-12 w-12 text-cyan-300" />
            <h2 className="text-4xl font-black text-white">Ready to join Cloudy?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">Support the server and unlock your next Rust experience today.</p>
            <Link href="/shop" className="gradient-primary mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 font-black text-[#020817]">Open store <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
