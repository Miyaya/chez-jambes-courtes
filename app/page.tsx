import Image from 'next/image'
import SubscribeForm from './_components/SubscribeForm'

export default function Page() {
  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[calc(100vh-57.5px)] flex items-center justify-center px-6 pt-10 pb-24"
        style={{
          background: '#FFA630',
          backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="w-full max-w-md md:max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:grid md:grid-cols-2">

            {/* Left: image — desktop only */}
            <div className="hidden md:block relative">
              <Image
                src="/fruit-market.jpg"
                alt="Marché de fruits colorés"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0vw, 50vw"
              />
            </div>

            {/* Right: form */}
            <div className="p-8">
              <h2 className="text-2xl text-midnight mb-3">Soyez les premiers informés</h2>
              <p className="text-base text-midnight/75 leading-relaxed mb-1">
                Mangues de Taïwan, litchis parfumés, pitayas rouges —
                des fruits que l&apos;on ne trouve pas au supermarché, livrés en quantité limitée.
              </p>
              <p className="text-sm text-midnight/50 leading-relaxed mb-5">
                台灣芒果、荔枝、紅火龍果——超市買不到的頂級進口水果，限量供應。
              </p>

              <SubscribeForm />

              <p className="text-[0.72rem] text-midnight/35 mt-5 leading-relaxed">
                Conformément au RGPD, vos données ne sont jamais partagées.<br />
                符合 RGPD 數據規範，資料不與第三方共享。
              </p>
            </div>

          </div>
        </div>
        {/* ── Marquee strip ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-midnight overflow-hidden py-2.5 flex flex-col gap-2">
          {/* Row 1: right */}
          <div className="flex whitespace-nowrap">
            <div className="flex shrink-0 animate-[marquee-right_55s_linear_infinite]">
              <span className="shrink-0 text-orange text-[0.68rem] uppercase tracking-[0.22em]">
                {'CHEZ JAMBES COURTES  ·  '.repeat(12)}
              </span>
              <span className="shrink-0 text-orange text-[0.68rem] uppercase tracking-[0.22em]" aria-hidden="true">
                {'CHEZ JAMBES COURTES  ·  '.repeat(12)}
              </span>
            </div>
          </div>
          {/* Row 2: left */}
          <div className="flex whitespace-nowrap">
            <div className="flex shrink-0 animate-[marquee-left_85s_linear_infinite]">
              <span className="shrink-0 text-white/60 text-[0.68rem] uppercase tracking-[0.22em]">
                {'LES FRUITS EXOTIQUES FRAIS  ·  '.repeat(10)}
              </span>
              <span className="shrink-0 text-white/60 text-[0.68rem] uppercase tracking-[0.22em]" aria-hidden="true">
                {'LES FRUITS EXOTIQUES FRAIS  ·  '.repeat(10)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo gallery — wave embedded at bottom ── */}
      <div className="relative grid grid-cols-3 h-60 sm:h-80">
        <div className="relative overflow-hidden">
          <Image
            src="/mango.jpg"
            alt="Mangue et orange dans un bol"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>
        <div className="relative overflow-hidden">
          <Image
            src="/fruit-market.jpg"
            alt="Marché de fruits colorés"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>
        <div className="relative overflow-hidden">
          <Image
            src="/dragon-fruit.jpg"
            alt="Pitayas rouges en abondance"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>

        {/* Wave sits over the bottom of the photos — no white gap */}
        <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 64"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="block w-full h-14 sm:h-16"
          >
            <path
              d="M0,44 C82,26 168,58 294,38 C386,22 448,52 572,32 C696,12 762,50 902,28 C1042,6 1124,46 1264,24 C1342,12 1402,36 1440,28 L1440,64 L0,64 Z"
              fill="#031926"
            />
          </svg>
        </div>
      </div>

      {/* ── Footer: midnight bg ── */}
      <footer className="bg-midnight text-center px-8 py-10 text-sm text-white/40 tracking-[0.08em] leading-loose">
        <p className="text-white/70">Chez Jambes Courtes · Paris</p>
        <p className="mt-2 opacity-50">© 2025 · Mentions légales · 隱私政策</p>
      </footer>
    </main>
  )
}
