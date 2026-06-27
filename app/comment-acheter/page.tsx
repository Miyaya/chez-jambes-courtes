import Link from 'next/link'

const steps = [
  {
    num: '01',
    titleZh: '下訂並預付款',
    titleFr: 'Commande & paiement',
    zh: '選好商品後，請完成線上預付款以確認訂單。若您是老顧客，可選擇於面交當天再付款——請於下訂時備注說明。',
    fr: 'Sélectionnez vos produits et réglez en avance pour confirmer votre commande. Les clients réguliers peuvent opter pour le paiement en main propre le jour de la remise — merci de le préciser lors de la commande.',
  },
  {
    num: '02',
    titleZh: '訂購確認通知',
    titleFr: 'Confirmation par e-mail',
    zh: '訂單成立後，我們會寄送確認郵件至您的信箱，請確認有收到。若未收到，歡迎主動與我們聯繫。',
    fr: 'Un e-mail de confirmation vous sera envoyé dès réception de votre commande. Si vous ne le recevez pas, n\'hésitez pas à nous contacter.',
  },
  {
    num: '03',
    titleZh: '面交取貨',
    titleFr: 'Remise en main propre',
    zh: '我們將與您確認面交的時間與地點，通常在下訂後約一週內完成。面交地點以雙方方便的巴黎市區為主。',
    fr: 'Nous convenons ensemble d\'un lieu et d\'une heure pour la remise, généralement dans la semaine suivant la commande, dans Paris intra-muros.',
  },
]

export default function CommentAcheterPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="bg-orange px-8 py-14 text-center"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        <h1 className="text-3xl font-bold text-midnight mb-1">購買流程</h1>
        <p className="text-midnight/60 text-sm tracking-[0.15em] uppercase">Comment acheter</p>
      </section>

      {/* Steps */}
      <section className="max-w-2xl mx-auto px-8 py-16">
        <ol className="space-y-14">
          {steps.map((step, i) => (
            <li key={step.num} className="flex gap-6">
              {/* Step number + connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                  <span className="text-orange text-xs font-bold tabular-nums">{step.num}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 mt-3 bg-midnight/15" />
                )}
              </div>

              {/* Content */}
              <div className="pt-1.5 pb-6">
                <p className="text-[0.62rem] text-midnight/40 uppercase tracking-widest mb-0.5">{step.titleFr}</p>
                <h2 className="text-lg font-bold text-midnight mb-3">{step.titleZh}</h2>
                <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">{step.zh}</p>
                <p className="text-sm text-midnight/55 leading-relaxed">{step.fr}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Out-of-stock note */}
        <div className="mt-10 rounded-2xl bg-midnight/5 border border-midnight/10 px-6 py-5">
          <p className="text-xs text-midnight/50 uppercase tracking-widest mb-2 font-bold">備注 · Note</p>
          <p className="text-sm text-midnight leading-relaxed mb-1.5">
            若部分商品無法到貨，我們會事先通知您。您可選擇：<strong>整單全額退款</strong>，或<strong>僅退缺貨商品的費用</strong>並繼續等待其餘商品的面交。
          </p>
          <p className="text-sm text-midnight/55 leading-relaxed">
            Si certains articles s&apos;avèrent indisponibles, nous vous en informerons au préalable. Vous aurez le choix entre un <strong>remboursement intégral</strong> de la commande, ou un <strong>remboursement partiel</strong> des articles manquants avec livraison du reste.
          </p>
        </div>

        {/* Back links */}
        <div className="mt-12 flex flex-wrap gap-4 text-sm">
          <Link
            href="/instock"
            className="px-5 py-2.5 bg-midnight text-orange font-bold rounded-full hover:bg-orange hover:text-midnight transition-colors duration-200"
          >
            現貨商品 →
          </Link>
          <Link
            href="/preorder"
            className="px-5 py-2.5 border-2 border-midnight/20 text-midnight/60 font-bold rounded-full hover:border-midnight hover:text-midnight transition-colors duration-200"
          >
            預購商品 →
          </Link>
        </div>
      </section>

      <footer className="bg-midnight text-center px-8 py-10 text-sm text-white/40 tracking-[0.08em] leading-loose">
        <p className="text-white/70">Chez Jambes Courtes · Paris</p>
        <p className="mt-2 opacity-50">© 2025 · Mentions légales · 隱私政策</p>
      </footer>
    </main>
  )
}
