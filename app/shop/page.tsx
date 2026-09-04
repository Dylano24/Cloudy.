import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShieldCheck, Wrench } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';
const CLOUDY_LOGO_URL = 'https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif';

export default function ShopPage() {
  return (
    <div className="min-h-[72vh] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="cloud-panel overflow-hidden rounded-3xl border border-border bg-card/70 p-8 text-center shadow-2xl sm:p-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10">
            <img src={CLOUDY_LOGO_URL} alt="Cloudy" width={66} height={66} />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Wrench className="h-4 w-4" />
            Coming soon
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            STORE SETUP IN PROGRESS
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            The Cloudy store is being prepared. Purchases are temporarily unavailable while the final server and payment setup is completed.
          </p>

          <div className="mx-auto mb-9 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="h-5 w-5 text-primary" /> Safe by default
              </div>
              <p className="text-sm leading-6 text-muted">No checkout or payment flow is active until the official Cloudy store is ready.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <MessageCircle className="h-5 w-5 text-primary" /> Updates on Discord
              </div>
              <p className="text-sm leading-6 text-muted">Store availability and server launch information will be announced in the Cloudy community.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="cloudy-cta-secondary inline-flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Back home
            </Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cloudy-cta-primary inline-flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
