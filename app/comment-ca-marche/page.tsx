import Footer from '../_components/Footer'

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-midnight mb-1">購物流程指南 · Comment ça marche ?</h1>
      </section>

      <section className="max-w-2xl mx-auto px-8 py-12">
        <ol className="space-y-14">

          {/* ── Step 01 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-yellow text-xs font-bold tabular-nums">01</span>
              </div>
              <div className="w-px flex-1 mt-3 bg-midnight/15" />
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <h2 className="text-lg font-bold text-midnight mb-3">加入快閃 · La Vente Flash</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                每週固定開放限時快閃！在截止時間前，輕鬆在網站上挑選您喜愛的頂級鮮果並送出訂單。系統會立即發送訂單成立確認信至您的信箱。（此時 Stripe 僅會取得信用卡預先授權額度，尚未真正扣款喔！）
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Chaque semaine, on vous ouvre nos carnets de commandes ! Repérez la date limite, faites votre marché tranquillement sur le site et validez. Un e-mail de confirmation file direct dans votre boîte. (Note : une simple empreinte bancaire est prise sur Stripe, aucun vrai débit à ce stade !)
              </p>
            </div>
          </li>

          {/* ── Step 02 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-yellow text-xs font-bold tabular-nums">02</span>
              </div>
              <div className="w-px flex-1 mt-3 bg-midnight/15" />
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <h2 className="text-lg font-bold text-midnight mb-3">出發採購 · Le Coup de Feu à Rungis</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                快閃截止後，我們會於深夜親自前往 Rungis 國際市場。我們的任務？在合作批發商中，為您一箱箱親自嚴選、把關，只帶回品質最完美的頂級水果。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Dès la clôture des commandes, on enfile nos vestes et on file au Marché de Rungis au milieu de la nuit. Notre mission ? Dénicher et inspecter vos fruits un par un chez nos grossistes partenaires pour ne vous ramener que la crème de la crème.
              </p>
            </div>
          </li>

          {/* ── Step 03 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-yellow text-xs font-bold tabular-nums">03</span>
              </div>
              <div className="w-px flex-1 mt-3 bg-midnight/15" />
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <h2 className="text-lg font-bold text-midnight mb-3">訂單確認與發票 · La Validation & La Facture</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                從市場採購完成後，系統會根據當天鮮果的實際到貨狀況更新訂單。此時系統才會依據最終實際採購金額進行扣款（絕無溢收風險），您也會同步收到內含官方正式發票的採購確認信！
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed mb-3">
                De retour du marché, on valide vos paniers selon les arrivages réels du matin. C&apos;est à ce moment précis que votre paiement est ajusté et validé (zéro mauvaise surprise). Vous recevez alors votre e-mail récapitulatif final avec votre facture officielle !
              </p>

              <div className="rounded-xl border border-midnight/10 bg-midnight/3 px-4 py-3">
                <p className="text-sm font-bold text-midnight mb-1">📌 備註 · N.B.</p>
                <p className="text-sm text-midnight leading-relaxed mb-1">
                  別擔心！若您心儀的水果不幸遇到市場缺貨，您可以於下單時事先設定「若商品不全則全額取消訂單」。
                </p>
                <p className="text-sm text-midnight/50 leading-relaxed">
                  Pas de panique, vous pouvez choisir à l&apos;avance lors de votre commande d&apos;annuler la totalité de votre panier si l&apos;un de vos fruits préférés venait à manquer chez le grossiste.
                </p>
              </div>
            </div>
          </li>

          {/* ── Step 04 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-yellow text-xs font-bold tabular-nums">04</span>
              </div>
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <h2 className="text-lg font-bold text-midnight mb-3">取貨 · Le Retrait ou La Livraison</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                您的頂級鮮果到貨囉！您可以前往您下單時選擇的指定點輕鬆取貨，或是待在家中等待到府配送。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed mb-3">
                Vos fruits d&apos;exception sont arrivés ! Il ne vous reste plus qu&apos;à venir récupérer votre précieux colis au point de retrait sélectionné, ou à attendre notre tournée de livraison à domicile.
              </p>

              <div className="rounded-xl border border-midnight/10 bg-midnight/3 px-4 py-3">
                <p className="text-sm font-bold text-midnight mb-1">配送小撇步 · Logistique Flash</p>
                <p className="text-sm text-midnight leading-relaxed mb-1">
                  為了確保極致新鮮並完美避開巴黎日間的尖峰車潮，我們的到府配送皆安排於深夜時段進行。讓您的頂級鮮果零壓力、安全送達！
                </p>
                <p className="text-sm text-midnight/50 leading-relaxed">
                  Pour vous garantir une fraîcheur maximale et éviter les bouchons parisiens, nos livraisons à domicile s&apos;effectuent tard en soirée. Vos fruits arrivent à bon port sans stress !
                </p>
              </div>
            </div>
          </li>
        </ol>

        {/* Bonus: overflow "En Stock" deals */}
        <div className="mt-10 rounded-2xl bg-midnight/5 border border-midnight/10 px-6 py-5 space-y-4">
          <p className="text-xs text-midnight/50 uppercase tracking-widest font-bold">💡 現貨優惠專區 · Le Coin des Bonnes Affaires</p>

          <div>
            <p className="text-sm text-midnight leading-relaxed mb-1.5">
              我們的商業模式 100% 建立在「限時快閃」上，以確保極致新鮮。然而，Rungis 的批發商只按「整箱」販售！舉例來說：當客戶總共下單了 37 顆芒果，我們就必須買下 4 整箱（共 48 顆）—— 這意味著會有 11 顆頂級芒果變成多餘的庫存。
            </p>
            <p className="text-sm text-midnight/55 leading-relaxed">
              Notre modèle repose à 100 % sur le Flash pour vous garantir un circuit ultra-frais. Cependant, les grossistes à Rungis vendent uniquement par colis complets ! Si vous nous commandez 37 mangues, nous devons acheter 4 caisses de 12... et il nous reste 11 mangues d&apos;exception sur les bras.
            </p>
          </div>

          <div className="border-t border-midnight/10 pt-4">
            <p className="text-sm text-midnight leading-relaxed mb-1.5">
              <strong>限時好康</strong>：為了惜食不浪費，這些多出來的鮮果會立即以「現貨優惠」形式上架網站，並附帶限時小折扣！
            </p>
            <p className="text-sm text-midnight/55 leading-relaxed">
              <strong>La bonne affaire</strong> : ces fruits restants sont immédiatement basculés « En Stock » sur le site avec une petite remise sympa pour éviter tout gaspillage.
            </p>
          </div>

          <div className="border-t border-midnight/10 pt-4">
            <p className="text-sm text-midnight leading-relaxed mb-1.5">
              <strong>購買規則</strong>：現貨商品於下單時即時扣款，且須以最快速度完成取貨以確保最佳風味。數量有限，先搶先贏！
            </p>
            <p className="text-sm text-midnight/55 leading-relaxed">
              <strong>Le deal</strong> : le débit est immédiat à l&apos;achat et ces produits sont à récupérer au plus vite pour préserver leur fraîcheur. Premier arrivé, premier servi !
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
