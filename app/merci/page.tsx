import Link from 'next/link'

export const metadata = { title: 'Merci — Chez Jambes Courtes' }

export default function MerciPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-1 bg-orange flex flex-col items-center justify-center px-6 py-16 text-midnight"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
          <span className="text-6xl block mb-6">🥭</span>

          <h1 className="text-3xl mb-4">Merci !</h1>

          <p className="text-base leading-relaxed mb-2 text-midnight/80">
            Vous serez parmi les premiers à savoir dès la première livraison.
          </p>
          <p className="text-sm leading-relaxed mb-8 text-midnight/55">
            您已成功訂閱，第一批到貨我們將立即通知您。
          </p>

          <p className="text-sm text-midnight/70 leading-relaxed mb-2">
            Mangues de Taïwan, litchis parfumés, pitayas rouges —
            des fruits d&apos;exception, livrés en quantité limitée à Paris.
          </p>
          <p className="text-xs text-midnight/45 leading-relaxed mb-8">
            台灣芒果、荔枝、紅火龍果，限量供應。
          </p>

          <Link
            href="/"
            className="inline-block text-[0.78rem] uppercase tracking-[0.14em] text-midnight/50 hover:text-midnight transition-colors underline underline-offset-4"
          >
            Retour à l&apos;accueil · 返回首頁
          </Link>
        </div>
      </div>

      {/* Wave transition */}
      <div className="bg-orange overflow-hidden leading-none">
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

      <footer className="bg-midnight text-center px-8 py-10 text-sm text-white/40 tracking-[0.08em] leading-loose">
        <p className="text-white/70">Chez Jambes Courtes · Paris</p>
        <p className="mt-2 opacity-50">© 2025 · Mentions légales · 隱私政策</p>
      </footer>
    </main>
  )
}
