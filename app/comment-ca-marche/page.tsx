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
              <h2 className="text-lg font-bold text-midnight mb-3">限時預購開賣（傍晚開啟）· Les Précommandes Flash (En soirée)</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                當我們確認翌日 Rungis 批發商的貨況後，網站便會於傍晚開啟僅限數小時的「限時預購」。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Dès que notre grossiste au Marché de Rungis nous confirme la disponibilité des stocks pour le lendemain, nous ouvrons une session de Précommande éphémère sur le site pour quelques heures.
              </p>

              <ul className="space-y-3 mt-4">
                <li>
                  <p className="text-sm text-midnight font-medium leading-relaxed mb-1">
                    <strong>依規格公平計價：</strong>針對單顆販售的鮮果（如芒果），您可在下單時預選您偏好的規格大小。
                  </p>
                  <p className="text-sm text-midnight/55 leading-relaxed">
                    <strong>Le juste prix au calibre :</strong> Pour les fruits vendus à l&apos;unité (comme les mangues), vous pouvez sélectionner votre préférence de calibre lors de votre commande.
                  </p>
                </li>
                <li>
                  <p className="text-sm text-midnight font-medium leading-relaxed mb-1">
                    <strong>信用卡額度預先授權：</strong>Stripe 此時僅會先取得最高可能金額（以最大規格計算）的信用卡預先授權（凍結額度），尚未真正扣款。
                  </p>
                  <p className="text-sm text-midnight/55 leading-relaxed">
                    <strong>L&apos;empreinte bancaire :</strong> Une simple empreinte bancaire (pré-autorisation) est prise sur votre carte via Stripe pour le montant maximal (calibré sur le plus gros fruit). Aucun débit n&apos;est effectué à ce stade.
                  </p>
                </li>
                <li>
                  <p className="text-sm text-midnight font-medium leading-relaxed mb-1">
                    <strong>其他付款管道：</strong>若選擇現場取貨以「感應刷卡」或「現金」支付，您的預約將直接鎖定。若選擇銀行轉帳，則僅接受「即時轉帳」以利在截止前成功對帳。
                  </p>
                  <p className="text-sm text-midnight/55 leading-relaxed">
                    <strong>Autres paiements :</strong> Si vous choisissez le paiement par Carte sans contact ou Espèces au retrait, votre réservation est verrouillée. Si vous optez pour le Virement bancaire, seul le virement instantané est accepté avant la clôture de la session.
                  </p>
                </li>
                <li>
                  <p className="text-sm text-midnight font-medium leading-relaxed mb-1">
                    <strong>缺貨應變選擇：</strong>於購物車結帳時，您可先預選若遇清晨突發缺貨時的應變方案：選擇「缺貨時仍出貨其餘商品」或「全額取消訂單」。
                  </p>
                  <p className="text-sm text-midnight/55 leading-relaxed">
                    <strong>Sécurité anti-manque :</strong> Dès le panier, vous choisissez votre option de secours si un fruit venait à manquer : maintenir le reste de la commande ou tout annuler.
                  </p>
                </li>
              </ul>
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
              <h2 className="text-lg font-bold text-midnight mb-3">統整訂單與清晨親自理貨 · La récolte des commandes &amp; Le tri à Rungis</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                清晨時分（約 04:00），預購截止，我們便會親臨 Rungis 批發市場。我們將依據精確的預購總數進行採購，並帶回少量的安全庫存。在市場現場，我們會親自開箱、依據鮮果的實際重量與尺寸進行嚴格把關與手工分級，並盡全力滿足每位客戶預選的規格偏好。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Au petit matin (vers 04h00), nous clôturons la session et filons au Marché de Rungis. Nous achetons la quantité exacte pour honorer vos précommandes, agrémentée d&apos;un stock de sécurité raisonnable. Sur place, nous inspectons et trions physiquement chaque fruit par taille et par poids. Nous faisons le maximum pour attribuer à chacun le calibre de son choix.
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
              <h2 className="text-lg font-bold text-midnight mb-3">規格分級與訂單確認 · L&apos;Ajustement du prix &amp; La Validation</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                清晨於市場理貨完畢後，系統將計算出最精確的最終總額：若您分配到的鮮果規格較小，系統將會自動調降該品項的價格。Stripe 線上刷卡將依據此調降後的「實際正確金額」直接進行最終扣款，確保您絕不會多付。若水果未達品管標準，系統將自動依您預選的應變方案執行。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Au petit matin, une fois le tri terminé à Rungis, le juste prix de votre panier est calculé : si votre fruit est plus petit que le calibre maximal, son prix est automatiquement baissé. Votre paiement Stripe est immédiatement validé et encaissé sur ce montant exact réajusté. Si un fruit ne passe pas notre contrôle qualité, votre option de secours choisie au panier s&apos;applique.
              </p>
            </div>
          </li>

          {/* ── Step 04 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-yellow text-xs font-bold tabular-nums">04</span>
              </div>
              <div className="w-px flex-1 mt-3 bg-midnight/15" />
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <h2 className="text-lg font-bold text-midnight mb-3">輕鬆取貨與發票 · Le Retrait, la Livraison &amp; La Facture</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                您前往指定點自取鮮果或在家等待到府配送。30 歐元以下且選擇現場付款的訂單，可於面交時以現金或感應刷卡支付。當商品順利交付完成後，系統將於最後這一步正式開立並發送官方「已付款發票」至您的電子信箱（您亦可隨時於後台下載）。
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Vous récupérez vos fruits d&apos;exception au point de retrait ou lors de notre tournée. Pour les paniers de moins de 30 € validés en paiement au retrait, vous réglez sur place en espèces ou en sans contact par carte. Une fois la remise des produits validée, votre facture officielle acquittée est instantanément éditée et envoyée par e-mail (elle est également disponible dans votre espace client).
              </p>
            </div>
          </li>

          {/* ── Step 05 ── */}
          <li className="flex gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-midnight flex items-center justify-center shrink-0">
                <span className="text-yellow text-xs font-bold tabular-nums">05</span>
              </div>
            </div>
            <div className="pt-1.5 pb-6 w-full">
              <h2 className="text-lg font-bold text-midnight mb-3">切換為現貨專區（直接購買）· Le Mode &quot;En Stock&quot; (Vente Directe)</h2>
              <p className="text-sm text-midnight font-medium leading-relaxed mb-1.5">
                在 Rungis 市場，所有水果皆為「整箱」販售（例如每箱固定 12 顆）。為了補足所有預購數量，我們需要買下整箱的鮮果，並會同時主動多採購部分數量。這些拆箱後的餘額鮮果以及補充庫存，隨後會立刻上架。此時網站會切換為「現貨」模式：現貨頁面會明確標示出各個精確規格的「實際剩餘數量」與價格，下單時即時線上全額扣款。現貨商品數量有限，須以最快速度完成取貨以確保最佳鮮度與風味！
              </p>
              <p className="text-sm text-midnight/55 leading-relaxed">
                Au Marché de Rungis, les grossistes vendent exclusivement par colis complets (ex: cartons de 12 fruits). Pour honorer vos précommandes, nous achetons des colis complets et complétons volontairement notre approvisionnement avec quelques fruits supplémentaires. Le reliquat de ces colis ainsi que ce stock complémentaire basculent alors immédiatement sur le site. Notre site change de mode et passe &quot;En Stock&quot; : ici, plus de surprise, les fiches produits affichent le nombre exact de fruits disponibles pour chaque calibre précis, avec un débit immédiat à la commande. Ces produits sont à récupérer au plus vite pour préserver leur fraîcheur éclatante !
              </p>
            </div>
          </li>
        </ol>
      </section>

      <Footer />
    </main>
  )
}
