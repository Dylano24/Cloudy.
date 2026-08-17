import { ArrowRight, Cloud, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductsGrid } from '@/components/home/products-grid';

async function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-sky-50 text-slate-900">

      {/* Animated Cloud Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-white">
        <div className="cloud cloud-one">
          <div className="cloud-part cloud-a" />
          <div className="cloud-part cloud-b" />
          <div className="cloud-part cloud-c" />
        </div>

        <div className="cloud cloud-two">
          <div className="cloud-part cloud-a" />
          <div className="cloud-part cloud-b" />
          <div className="cloud-part cloud-c" />
        </div>

        <div className="cloud cloud-three">
          <div className="cloud-part cloud-a" />
          <div className="cloud-part cloud-b" />
          <div className="cloud-part cloud-c" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/80" />
      </div>

      {/* Hero */}
      <section className="relative py-28 md:py-40">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-5 py-2 shadow-lg backdrop-blur-md">
              <Cloud className="h-5 w-5 text-sky-500" />
              <span className="font-semibold text-sky-700">
                Welcome to Cloudy
              </span>
            </div>

            <h1 className="mb-6 text-6xl font-black tracking-tight text-slate-800 md:text-8xl">
              CLOUDY
              <span className="block text-sky-500">
                RUST STORE
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-2xl">
              Upgrade your Rust experience with exclusive ranks,
              kits and rewards made for the Cloudy community.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/shop">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-sky-300/40 transition-all hover:scale-105 hover:bg-sky-600 sm:w-auto">
                  Bekijk de Store
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>

              <a
                href="#products"
                className="rounded-2xl border border-white/80 bg-white/70 px-8 py-4 text-lg font-bold text-sky-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white"
              >
                Bekijk producten
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-sky-400" />
              Premium Rust products • €5 - €15
            </div>

          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative py-20">
        <div className="container mx-auto px-4">

          <div className="mb-12 text-center">
            <p className="mb-2 font-bold uppercase tracking-widest text-sky-500">
              Cloudy Store
            </p>

            <h2 className="text-4xl font-black text-slate-800 md:text-5xl">
              Kies jouw upgrade
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              Support Cloudy en krijg exclusieve voordelen in-game.
            </p>
          </div>

          <ProductsGrid />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-10 text-center shadow-2xl backdrop-blur-xl md:p-16">

          <Cloud className="mx-auto mb-6 h-12 w-12 text-sky-400" />

          <h2 className="mb-4 text-4xl font-black text-slate-800 md:text-5xl">
            Join Cloudy
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-500">
            Klaar om jouw Rust ervaring naar het volgende niveau te brengen?
          </p>

          <Link href="/shop">
            <button className="rounded-2xl bg-sky-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-sky-300/40 transition-all hover:scale-105 hover:bg-sky-600">
              Naar de Store
            </button>
          </Link>

        </div>
      </section>

      {/* Cloud animation */}
      <style jsx>{`
        .cloud {
          position: absolute;
          width: 220px;
          height: 70px;
          opacity: 0.55;
          animation: float 30s linear infinite;
        }

        .cloud-one {
          top: 15%;
          left: -250px;
        }

        .cloud-two {
          top: 42%;
          left: -300px;
          transform: scale(0.7);
          animation-duration: 42s;
          animation-delay: -15s;
        }

        .cloud-three {
          top: 65%;
          left: -250px;
          transform: scale(1.2);
          animation-duration: 50s;
          animation-delay: -30s;
        }

        .cloud-part {
          position: absolute;
          border-radius: 9999px;
          background: white;
        }

        .cloud-a {
          bottom: 0;
          left: 20px;
          width: 170px;
          height: 55px;
        }

        .cloud-b {
          bottom: 20px;
          left: 60px;
          width: 80px;
          height: 80px;
        }

        .cloud-c {
          bottom: 10px;
          right: 20px;
          width: 100px;
          height: 65px;
        }

        @keyframes float {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(100vw + 500px));
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
