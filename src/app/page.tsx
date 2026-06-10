import Image from 'next/image'
import SubscribeForm from './_components/SubscribeForm'

export default function Page() {
  return (
    <main>
      {/* ── Form section: dots on orange outside the content column ── */}
      <section
        className="relative min-h-screen"
        style={{
          background: '#FFA630',
          backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Solid orange column masks the dots behind the content */}
        <div className="relative min-h-screen mx-auto w-full max-w-xl bg-orange flex flex-col">
        <div className="px-8 pt-8 shrink-0">
          <span className="text-xl font-bold tracking-[0.14em] uppercase text-midnight">
            Chez Jambes Courtes
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl text-midnight mb-4">Soyez les premiers informés</h2>
            <p className="text-base text-midnight/75 leading-relaxed mb-1">
              Mangues de Taïwan, litchis parfumés, pitayas rouges —
              des fruits que l&apos;on ne trouve pas au supermarché, livrés en quantité limitée.
            </p>
            <p className="text-sm text-midnight/50 leading-relaxed mb-6">
              台灣芒果、荔枝、紅火龍果——超市買不到的頂級進口水果，限量供應。
            </p>
            <p className="text-sm text-midnight/55 mb-6">
              Recevez une notification dès la première livraison ·
              訂閱以獲得第一批到貨通知。
            </p>

            <div className="relative border border-midnight/20 rounded-sm p-7 bg-white shadow-sm">
              <div className="absolute inset-1 border border-dashed border-midnight/10 rounded-sm pointer-events-none" />
              <SubscribeForm />
            </div>

            <p className="text-[0.72rem] text-midnight/40 mt-4 leading-relaxed">
              Conformément au RGPD, vos données ne sont jamais partagées.<br />
              符合 RGPD 數據規範，資料不與第三方共享。
            </p>
          </div>
        </div>
        </div>{/* end solid orange column */}
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
