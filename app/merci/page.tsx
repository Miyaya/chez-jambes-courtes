import Link from 'next/link'

export const metadata = { title: 'Merci — Chez Jambes Courtes' }

export default function MerciPage() {
  return (
    <main className="min-h-screen bg-orange flex flex-col items-center justify-center px-8 text-midnight">
      <div className="w-full max-w-md text-center">
        <span className="text-6xl block mb-8">🍊</span>

        <h1 className="text-3xl mb-4">Merci !</h1>

        <p className="text-base leading-relaxed mb-2 text-midnight/80">
          Vous serez parmi les premiers à savoir dès la première livraison.
        </p>
        <p className="text-sm leading-relaxed mb-10 text-midnight/55">
          您已成功訂閱，第一批到貨我們將立即通知您。
        </p>

        <div className="border border-midnight/15 rounded-sm p-6 bg-white/30 mb-10 text-left">
          <p className="text-sm text-midnight/70 leading-relaxed">
            Mangues de Taïwan, litchis parfumés, pitayas rouges —
            des fruits d&apos;exception, livrés en quantité limitée à Paris.
          </p>
          <p className="text-xs text-midnight/45 mt-2 leading-relaxed">
            台灣芒果、荔枝、紅火龍果，限量供應。
          </p>
        </div>

        <Link
          href="/"
          className="inline-block text-[0.78rem] uppercase tracking-[0.14em] text-midnight/50 hover:text-midnight transition-colors underline underline-offset-4"
        >
          Retour à l&apos;accueil · 返回首頁
        </Link>
      </div>
    </main>
  )
}
