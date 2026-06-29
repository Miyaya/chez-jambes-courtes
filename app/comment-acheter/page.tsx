import Link from 'next/link'

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

      <section className="max-w-2xl mx-auto px-8 py-16">
        <ol className="space-y-14">

          {/* ── Step 01 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-orange text-xs font-bold tabular-nums">01</span>
              </div>
              <div className="w-px flex-1 mt-3 bg-midnight/15" />
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <p className="text-[0.62rem] text-midnight/40 uppercase tracking-widest mb-0.5">Commande & paiement</p>
              <h2 className="text-lg font-bold text-midnight mb-4">下訂並選擇付款方式</h2>

              <div className="space-y-3">
                {/* Stripe */}
                <div className="rounded-xl border border-midnight/10 bg-midnight/3 px-4 py-3">
                  <p className="text-sm font-bold text-midnight mb-1">💳 信用卡 · Carte bancaire (Stripe)</p>
                  <p className="text-sm text-midnight leading-relaxed mb-1">
                    訂單在付款後<strong>立即成立</strong>。Stripe 會先<strong>保留款項</strong>（並非馬上扣款），待我們實際採購後才完成請款。採購日前一天仍可取消訂單。
                  </p>
                  <p className="text-sm text-midnight/50 leading-relaxed">
                    La commande est <strong>confirmée immédiatement</strong> après le paiement. Stripe <strong>bloque le montant</strong> sans le débiter — le débit n&apos;intervient qu&apos;au moment de l&apos;achat. Vous pouvez annuler jusqu&apos;à la veille du jour d&apos;achat.
                  </p>
                </div>

                {/* Virement */}
                <div className="rounded-xl border border-midnight/10 bg-midnight/3 px-4 py-3">
                  <p className="text-sm font-bold text-midnight mb-1">🏦 銀行轉帳 · Virement bancaire</p>
                  <p className="text-sm text-midnight leading-relaxed mb-1">
                    下訂後，我們會<strong>寄送匯款資訊至您的信箱</strong>。確認收到款項後，訂單才會正式成立、我們才會去採購，因此請<strong>盡快完成轉帳</strong>。
                  </p>
                  <p className="text-sm text-midnight/50 leading-relaxed">
                    Après validation de votre commande, vous recevrez <strong>les coordonnées bancaires par e-mail</strong>. La commande ne sera confirmée qu&apos;après réception du virement — merci de <strong>transférer rapidement</strong> afin de ne pas manquer le prochain achat.
                  </p>
                </div>

                {/* Face à face */}
                <div className="rounded-xl border border-midnight/10 bg-midnight/3 px-4 py-3">
                  <p className="text-sm font-bold text-midnight mb-1">🤝 面交付款 · Paiement à la livraison</p>
                  <p className="text-sm text-midnight leading-relaxed mb-1">
                    <strong>僅限有過完成訂單紀錄的熟客</strong>。付款於面交當天進行，訂單提交後即成立。請注意，惡意放鳥將被列入黑名單。
                  </p>
                  <p className="text-sm text-midnight/50 leading-relaxed">
                    Réservé aux <strong>clients ayant déjà finalisé une commande</strong>. Le règlement s&apos;effectue le jour de la remise. Toute absence injustifiée entraîne une mise sur liste noire.
                  </p>
                </div>
              </div>
            </div>
          </li>

          {/* ── Step 02 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-orange text-xs font-bold tabular-nums">02</span>
              </div>
              <div className="w-px flex-1 mt-3 bg-midnight/15" />
            </div>
            <div className="pt-1.5 pb-6">
              <p className="text-[0.62rem] text-midnight/40 uppercase tracking-widest mb-0.5">Confirmation par e-mail</p>
              <h2 className="text-lg font-bold text-midnight mb-3">訂購確認通知</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                訂單成立後，我們會寄送確認郵件至您的信箱，請確認有收到。若未收到，歡迎主動與我們聯繫。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Un e-mail de confirmation vous sera envoyé dès réception de votre commande. Si vous ne le recevez pas, n&apos;hésitez pas à nous contacter.
              </p>
            </div>
          </li>

          {/* ── Step 03 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-orange text-xs font-bold tabular-nums">03</span>
              </div>
            </div>
            <div className="pt-1.5 pb-6">
              <p className="text-[0.62rem] text-midnight/40 uppercase tracking-widest mb-0.5">Remise en main propre</p>
              <h2 className="text-lg font-bold text-midnight mb-3">面交取貨</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                我們將與您確認面交的時間與地點，通常在下訂後約一週內完成。面交地點以雙方方便的巴黎市區為主。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Nous convenons ensemble d&apos;un lieu et d&apos;une heure pour la remise, généralement dans la semaine suivant la commande, dans Paris intra-muros.
              </p>
            </div>
          </li>
        </ol>

        {/* Out-of-stock + cancellation note */}
        <div className="mt-10 rounded-2xl bg-midnight/5 border border-midnight/10 px-6 py-5 space-y-4">
          <p className="text-xs text-midnight/50 uppercase tracking-widest font-bold">備注 · Note</p>

          <div>
            <p className="text-sm text-midnight leading-relaxed mb-1.5">
              <strong>若部分商品無法到貨</strong>，我們會事先通知您，並請您選擇：
            </p>
            <ul className="text-sm text-midnight leading-relaxed list-none space-y-1 ml-0">
              <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>整單取消</strong>，全額退款</span></li>
              <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>僅退缺貨品項</strong>，繼續進行其餘商品的面交</span></li>
            </ul>
            <p className="text-sm text-midnight/55 leading-relaxed mt-2">
              Si certains articles s&apos;avèrent indisponibles, nous vous en informerons. Vous pourrez choisir entre l&apos;annulation totale avec remboursement intégral, ou un remboursement partiel des articles manquants avec livraison du reste.
            </p>
          </div>

          <div className="border-t border-midnight/10 pt-4">
            <p className="text-sm text-midnight leading-relaxed mb-1.5">
              <strong>取消期限</strong>：我們每次都會公布下一次去買水果的時間。在<strong>採購日的前一天</strong>前都可以取消訂單。
            </p>
            <p className="text-sm text-midnight/55 leading-relaxed">
              <strong>Délai d&apos;annulation</strong> : nous publions à l&apos;avance la date de notre prochain achat. Vous pouvez annuler votre commande jusqu&apos;à la <strong>veille du jour d&apos;achat</strong>.
            </p>
          </div>
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
