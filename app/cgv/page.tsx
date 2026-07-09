import Link from 'next/link'
import Footer from '../_components/Footer'

const sections: { title: string; fr: string; zh: string }[] = [
  {
    title: '1. Objet · 服務宗旨',
    fr: 'Les présentes conditions générales de vente régissent l\'ensemble des transactions passées sur le site Chez Jambes Courtes exploité par Mme Yi-Hsuan LEE, Entrepreneur Individuel (SIREN : 106 846 538). Toute commande validée sur le site implique l\'adhésion totale du client aux présentes CGV.',
    zh: '本服務條款適用於由 Yi-Hsuan LEE 女士以獨立獨資企業身份（公司統編 SIREN：106 846 538）營運之 Chez Jambes Courtes 網站上的所有交易。凡於本網站完成下單之客戶，即視為完全同意並接受本條款之所有內容。',
  },
  {
    title: '2. Nature des Produits et Absence de Droit de Rétractation · 商品特質與不適用七天鑑賞期說明',
    fr: 'Chez Jambes Courtes commercialise des fruits frais hautement périssables importés par voie aérienne. Conformément à l\'article L221-28 du Code de la consommation français, le droit de rétractation ne s\'applique pas aux contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement. En conséquence, toute commande validée est ferme, définitive et ne pourra être annulée, modifiée, remboursée ou échangée en dehors des cas d\'ajustement prévus à l\'article 3.',
    zh: '因 Chez Jambes Courtes 所販售之商品皆為空運進口、具高度易腐敗性之新鮮水果，依據法國消費者法（Code de la consommation）第 L221-28 條規定，此類易於腐壞或快速過期之商品不適用於「遠距購物退貨及取消訂單」之法規。因此，訂單一經確認即視為最終鎖定，恕不接受任何客戶端之取消、修改、退款或換貨要求，僅適用本條款第三條之特殊調整狀況。',
  },
  {
    title: '3. Fonctionnement du Site, Précommandes et Ajustement des Calibres · 網站營運模式、預購與規格調整說明',
    fr: 'Le site fonctionne de manière exclusive selon deux modes distincts et non co-existants, activés selon la visibilité des stocks à Rungis :\n1. Mode « Précommande » : Lancé en soirée pour une durée de quelques heures avant l\'achat au marché. Toute commande passée dans ce mode est immédiatement définitive et ne peut être annulée par le client.\n   — Principe du prix au calibre : Pour les fruits vendus à l\'unité, le client sélectionne une préférence de calibre (inférieur ou supérieur à un poids donné) lors de sa commande, sans garantie absolue de disponibilité.\n   — Gestion des imprévus au panier : Dès l\'étape du panier, le client choisit à l\'avance l\'option à appliquer en cas de produit manquant ou de défaut de qualité constaté au matin chez le grossiste : soit « Maintenir le reste de la commande », soit « Annuler la totalité de la commande ».\n   — Empreinte bancaire : Une pré-autorisation bancaire est bloquée sur la carte du client pour le montant maximal (basé sur le prix du plus gros calibre).\n   — Ajustement à la préparation et capture : Au petit matin, lors du tri physique des fruits et de la préparation de la commande, Chez Jambes Courtes ajuste la facture au prix réel du calibre effectivement attribué (le client ne paiera jamais plus que ce qu\'il reçoit). La capture bancaire définitive est exécutée sur ce juste montant réajusté.\n2. Mode « En Stock » : Activé après le retour du marché avec les quantités réelles disponibles. Les fiches produits affichent les calibres précis et les stocks exacts en temps réel. Le débit est immédiat lors de la commande.',
    zh: '本網站採取兩種獨立且不共存的模式營運，依據批發商貨況即時切換：\n1. 「快閃預購」模式：於傍晚確認翌日貨況後開啟，僅開放數小時。預購訂單一經送出即視為最終確認，客戶不得取消。\n   — 依規格計價原則：單顆販售之鮮果，客戶於下單時可勾選偏好的規格（如：400 克以下或以上），惟最終出貨以現場實際到貨為準。\n   — 缺貨應變機制：客戶於購物車結帳時，須先預選若遇清晨批發商突發缺貨或水果品質未達標時的應變方案：選擇「缺貨時仍出貨其餘商品」或「任一商品缺貨則全額取消訂單」。\n   — 信用卡額度預先授權：系統將先針對該筆訂單之「最高可能金額」（即皆以最大規格計算）進行信用卡額度預先授權（凍結額度）。\n   — 理貨調整與最終扣款：商家清晨現場挑選理貨時，將依實際出貨鮮果之正確規格與重量調降發票總額。系統將依據此「調整後的實際正確金額」執行最終扣款（Capture），確保客戶僅支付其收到的商品價值。\n2. 「現貨」模式：自批發市場採購完畢後開啟。商品頁面將明確標示各規格之精確剩餘數量與價格，下單時即時線上全額扣款。',
  },
  {
    title: '4. Suivi et Statuts de la commande · 訂單狀態追蹤',
    fr: 'Le client peut suivre l\'évolution de sa commande via trois étapes simplifiées :\n— Commande reçue : Le système a enregistré la commande et bloqué l\'empreinte bancaire (ou attend le virement instantané / enregistre le choix du paiement au retrait).\n— Validée / Partiellement validée / Annulée : Statut mis à jour au petit matin après inspection physique des fruits sur le marché. En cas d\'aléa de stock ou de qualité, l\'option de secours choisie au panier par le client est automatiquement appliquée. À cette étape, la transaction est définitivement validée au juste prix réajusté selon le calibre et le traitement bancaire Stripe est lancé.\n— Commande retirée / Livrée : La marchandise est remise au client. C\'est à cette dernière étape, une fois la livraison ou le retrait physiquement effectué, que la facture officielle acquittée est éditée, envoyée par e-mail et disponible dans l\'espace client. La commande est alors close.',
    zh: '客戶可於後台即時查看以下 3 個主要進度狀態：\n— 已收到訂單（Commande reçue）：系統已成功建檔並取得信用卡授權（或等待即時轉帳 / 註記現場付款選項）。\n— 已確認 / 部分確認 / 已取消（Validée / Partiellement validée / Annulée）：商家於清晨至市場親自開箱清驗鮮果品質後更新。若遇缺貨，系統將自動依據您下單時勾選的偏好方案執行。在此階段，訂單即正式確認成立，系統將依據實際出貨規格調降至最終正確金額，並正式執行線上刷卡（Stripe）扣款程序。\n— 訂單已取貨 / 已送達（Commande retirée / Livrée）：鮮果面交完畢或送達府上。在此最終階段（貨品實際交付完成後），系統才會正式開立並發送正式「已付款發票」至您的電子信箱（您亦可於個人後台下載），訂單正式結案。',
  },
  {
    title: '5. Moyens de Paiement · 付款方式',
    fr: 'Les règlements s\'effectuent au comptant (TVA non applicable, art. 293 B du CGI) via :\n— Carte Bancaire en ligne (Stripe) : Sous forme de prélèvement immédiat (Mode « En Stock ») ou d\'empreinte/pré-autorisation ajustée lors de la préparation de la commande (Mode « Précommande »).\n— Virement Bancaire Instantané : Les coordonnées bancaires sont transmises lors de la validation. Le virement instantané doit impérativement être reçu et validé sur notre compte avant la clôture de la session de précommande, sous peine d\'annulation automatique. Les virements classiques ne sont pas acceptés car ils n\'arriveront pas à temps.\n— Paiement au Retrait (Espèces ou Carte sans contact) : Autorisé pour les commandes d\'un montant maximal de 30 €. Le règlement s\'effectue obligatoirement au moment de la remise des produits, soit en espèces, soit par carte bancaire en sans contact via notre terminal mobile.',
    zh: '網站商品價格皆為最終淨價（依據法國稅法第 293 B 條規定免徵增值稅），付款管道如下：\n— 線上信用卡（Stripe）：現貨訂單立即扣款；預購訂單採額度預先授權，並於清晨理貨時依據實際規格調降後執行扣款。\n— 即時轉帳（Virement Bancaire Instantané）：帳戶資訊將於下單時顯示，款項須於預購截止前送達商家帳戶，逾期訂單自動取消。恕不接受傳統轉帳，因其入帳時間過長無法及時處理。\n— 現場取貨付款（現金或感應刷卡）：凡訂單總金額在 30 歐元以下皆可使用。客戶於面交現場取貨時，可選擇以現金支付，或使用實體信用卡/手機進行感應刷卡付款。',
  },
  {
    title: '6. Retrait, Livraison et Aléas Logistiques · 取貨、配送與物流突發狀況處理',
    fr: 'Le client s\'engage à récupérer sa commande (au point de retrait ou via la livraison à domicile pour les paniers éligibles) avec bonne foi et coopération. En cas d\'aléa logistique ou de force majeure (retard de vol, couac douanier, conditions de circulation), Chez Jambes Courtes s\'engage à informer le client. Les parties s\'engageront à convenir d\'un créneau alternatif. Un retard raisonnable (inférieur à 1 heure) ou le refus injustifié par le client de solutions de relivraison alternatives et équitables ne pourra constituer un motif d\'annulation ou de remboursement. Si le client ne se présente pas au point de retrait ou est absent lors de la livraison, la commande de produits périssables est considérée comme abandonnée et aucun remboursement ne sera dû. En cas d\'impossibilité totale et définitive d\'honorer la commande de la part de Chez Jambes Courtes (avarie totale de l\'arrivage), le client sera intégralement et immédiatement remboursé.',
    zh: '客戶承諾本著誠信與配合之原則進行取貨（指定點自取或達門檻之到府配送）。若遇不可抗力之物流突發狀況（如航班延誤、海關查驗、嚴重交通壅塞），Chez Jambes Courtes 將主動通知。雙方承諾共同配合重新安排時段。合理範圍內的延遲（如 1 小時以內），或客戶無正當理由拒絕商家提出之替代性公平配送方案時，該訂單恕不接受取消或退款。若客戶未於自取時段出現或配送時不在場，因水果具易腐敗性，該商品將視同放棄且恕不退款。若因 Chez Jambes Courtes 自身因素（如航班貨品全數損壞）導致最終完全無法出貨，則將予以全額退款。',
  },
  {
    title: '7. Règlement des Litiges · 爭議處理',
    fr: 'Les présentes conditions sont soumises au droit français. En cas de réclamation, le client est invité à contacter notre service client via le formulaire de contact du site afin de rechercher une solution amiable.',
    zh: '本服務條款受法國法律管轄。若有任何申訴或消費爭議，請優先透過網站聯絡表單與客服聯繫，雙方應優先尋求友好協商之解決方案。',
  },
]

function withItalicName(text: string) {
  return text.split('Chez Jambes Courtes').flatMap((part, i, arr) =>
    i < arr.length - 1
      ? [part, <em key={i} className="italic">Chez Jambes Courtes</em>]
      : [part]
  )
}

export default function CgvPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-midnight mb-1">服務條款 · Conditions Générales de Vente</h1>
      </section>

      <section className="max-w-2xl lg:max-w-3xl mx-auto px-6 py-16 space-y-10">
        {sections.map((s, i) => (
          <div key={i} className={i > 0 ? 'border-t border-midnight/10 pt-8' : ''}>
            <h2 className="font-bold text-midnight mb-3">{s.title}</h2>
            <div className="space-y-2.5">
              {s.fr.split('\n').map((line, j) => (
                <p key={j} className="text-sm text-midnight leading-relaxed">
                  {withItalicName(line)}
                </p>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-midnight/8 space-y-2">
              {s.zh.split('\n').map((line, j) => (
                <p key={j} className="text-sm text-midnight/55 leading-relaxed">
                  {withItalicName(line)}
                </p>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </main>
  )
}
