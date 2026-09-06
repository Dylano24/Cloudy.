import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  MessageCircle,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';
const CLOUDY_LOGO_URL = 'https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif';

const kits = [
  { id: '01', title: 'KIT 01', tag: 'STARTER', description: 'Cloudy starter package. Contents will be added before launch.' },
  { id: '02', title: 'KIT 02', tag: 'UPGRADE', description: 'Cloudy upgrade package. Contents will be added before launch.' },
  { id: '03', title: 'KIT 03', tag: 'PREMIUM', description: 'Cloudy premium package. Contents will be added before launch.' },
] as const;

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/rust-user-background.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,.42),#07090d_92%)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.16),transparent_52%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mb-12 flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white">
              <ArrowLeft size={17} /> Back to Cloudy
            </Link>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-blue-500/10"
            >
              <MessageCircle size={17} /> Join Discord
            </a>
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
              <Sparkles size={13} /> Official Cloudy Webstore
            </div>
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/35 shadow-2xl shadow-blue-950/20">
                <img src={CLOUDY_LOGO_URL} alt="Cloudy" width={46} height={46} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">Cloudy Inc.</p>
                <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">CLOUDY STORE</h1>
              </div>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              Select your game, choose a server and browse the available Cloudy kits. Built around a clean, dark storefront with the Cloudy identity at the center.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                <Gamepad2 size={15} /> Step 01
              </div>
              <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">CHOOSE YOUR GAME</h2>
              <p className="mt-2 text-sm text-white/45">More Cloudy games can be added here later.</p>
            </div>
          </div>

          <button
            type="button"
            className="group relative w-full overflow-hidden rounded-3xl border border-blue-400/30 bg-[#0c1018] text-left shadow-2xl shadow-black/30 sm:max-w-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-35 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-45"
              style={{ backgroundImage: "url('/images/rust-user-background.jpg')" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/90 to-transparent" aria-hidden="true" />
            <div className="relative flex min-h-44 items-end justify-between gap-5 p-6 sm:p-7">
              <div>
                <span className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Selected</span>
                <h3 className="text-3xl font-black">RUST</h3>
                <p className="mt-1 text-sm text-white/50">Cloudy Rust</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-blue-300">
                <ArrowRight size={19} />
              </div>
            </div>
          </button>
        </section>

        <section>
          <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                <Server size={15} /> Step 02
              </div>
              <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">SERVERS & KITS</h2>
              <p className="mt-2 text-sm text-white/45">Rust is selected. Kit contents and pricing can be filled in when you are ready.</p>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                placeholder="Search kits"
                className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/40 focus:bg-blue-500/[0.04]"
              />
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Cloudy Rust Server</h3>
                  <p className="text-sm text-white/40">Server information will appear here when available.</p>
                </div>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Coming soon</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {kits.map((kit) => (
              <article
                key={kit.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0e14] transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-950/20"
              >
                <div className="relative h-44 overflow-hidden border-b border-white/10">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-50 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
                    style={{ backgroundImage: "url('/images/rust-user-background.jpg')" }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/30 to-transparent" aria-hidden="true" />
                  <span className="absolute left-5 top-5 text-5xl font-black tracking-[-0.08em] text-white/15">{kit.id}</span>
                  <span className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black tracking-[0.18em] text-white/60 backdrop-blur">{kit.tag}</span>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-black">{kit.title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-white/45">{kit.description}</p>
                  <div className="my-5 h-px bg-white/8" />
                  <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-white/45">
                    <ShieldCheck size={15} className="text-blue-300" /> Official Cloudy package
                  </div>
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/35"
                  >
                    <ShoppingBag size={16} /> Coming soon
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-blue-400/15 bg-[linear-gradient(135deg,rgba(37,99,235,.10),rgba(255,255,255,.02))] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Cloudy Community</p>
              <h2 className="mt-2 text-2xl font-black">Need help or store information?</h2>
              <p className="mt-2 text-sm text-white/45">Join Discord for support, announcements and Cloudy updates.</p>
            </div>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-400"
            >
              <MessageCircle size={17} /> Join Discord
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
