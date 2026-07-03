import Link from 'next/link'
import Footer from '../_components/Footer'

export const metadata = { title: '感謝訂閱 · Merci — Chez Jambes Courtes' }

export default function MerciPage() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-midnight">
        <div className="w-full max-w-md bg-white border border-midnight/10 rounded-2xl overflow-hidden text-center">
          <div className="h-1.5 bg-yellow" />
          <div className="p-8">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="w-16 h-16 mx-auto mb-6 select-none transition-transform duration-250 hover:scale-120 motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M44 96.6198V186.454L156.787 190L145.801 52.1765L82.8163 10L44 96.6198Z" className="fill-magenta" />
            </svg>

            <h1 className="text-3xl font-bold text-midnight text-balance mb-6 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
              感謝訂閱 · Merci !
            </h1>

            <div className="mb-6 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_180ms_backwards]">
              <p className="text-base font-medium leading-relaxed text-midnight mb-1">
                您已成功訂閱，第一批到貨我們將立即通知您。
              </p>
              <p className="text-sm leading-relaxed text-midnight/60">
                Vous serez parmi les premiers informés dès la première livraison.
              </p>
            </div>

            <div className="mb-8 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_260ms_backwards]">
              <p className="text-sm leading-relaxed text-midnight/70 mb-1">
                台灣在地完熟芒果、玉荷包荔枝、珍稀紅肉火龍果——限量空運直送巴黎。
              </p>
              <p className="text-sm leading-relaxed text-midnight/60">
                Mangues de Taïwan cueillies à maturité, litchis parfumés, pitayas rouges intenses — importées par avion, en quantité très limitée.
              </p>
            </div>

            <Link
              href="/"
              className="inline-block text-[0.72rem] uppercase tracking-[0.12em] text-midnight/60 hover:text-midnight transition-colors underline underline-offset-4"
            >
              返回首頁 · Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
