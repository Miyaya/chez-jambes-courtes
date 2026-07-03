import Link from 'next/link'
import Footer from '../_components/Footer'

const sections: { title: string; fr: string; zh: string }[] = [
  {
    title: '1. Objet · 服務宗旨',
    fr: 'Les présentes conditions générales de vente régissent l\'ensemble des transactions passées sur le site Chez Jambes Courtes exploité par Mme Yi-Hsuan LEE, Entrepreneur Individuel (SIREN : 106 846 538). Toute commande validée sur le site implique l\'adhésion totale du client aux présentes CGV.',
    zh: '本服務條款適用於由 Yi-Hsuan LEE 以獨立獨資企業身份（公司統編 SIREN：106 846 538）營運之 Chez Jambes Courtes 網站上的所有交易。凡於本網站完成下單之客戶，即視為完全同意並接受本條款之所有內容。',
  },
  {
    title: '2. Nature des Produits et Absence de Droit de Rétractation · 商品特質與不適用七天鑑賞期（退貨）說明',
    fr: 'Chez Jambes Courtes commercialise des fruits frais hautement périssables importés par voie aérienne. Conformément à l\'article L221-28 du Code de la consommation français, le droit de rétractation ne s\'applique pas aux contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement. En conséquence, aucune commande validée et payée ne pourra être annulée, modifiée, remboursée ou échangée.',
    zh: '因 Chez Jambes Courtes 所販售之商品皆為空運進口、具高度易腐敗性之新鮮水果，依據法國消費者法（Code de la consommation）第 L221-28 條規定，此類易於腐壞或快速過期之商品不適用於「遠距購物退貨及取消訂單」之法規。因此，訂單一經確認並付款完成，恕無法提供取消、修改、退款或換貨之服務。',
  },
  {
    title: '3. Processus de Commande, Annulation et Statuts · 購物流程、訂單取消與狀態說明',
    fr: 'Le site distingue deux types de paniers non cumulables :\n— Produits « En Stock » : le débit est immédiat lors de la commande. Aucun droit d\'annulation ou de rétractation ne s\'applique.\n— Produits « En Précommande » : chaque session de précommande indique clairement une date et heure limite de clôture (« Commandez avant le [Date] à [Heure] »).\n— Droit d\'annulation des précommandes : tant que la session de précommande est ouverte, le client dispose d\'un bouton « Annuler la commande » dans son espace. Cette action annule immédiatement la pré-autorisation bancaire Stripe ou déclenche le remboursement intégral si le virement avait déjà été envoyé. Dès que l\'heure limite de clôture est dépassée, la commande passe au statut « En traitement » : elle devient alors ferme, définitive et non modifiable par le client.\n\nSuivi et statuts de la commande : le client peut suivre l\'évolution de sa commande via les statuts suivants :\n1. Commande reçue : le système a enregistré la commande. Un e-mail de confirmation de prise de commande est envoyé automatiquement au client.\n2. Paiement accepté : validé immédiatement pour Stripe (pré-autorisation), ou dès réception effective du virement bancaire sur notre compte professionnel.\n3. En traitement : la session de précommande est clôturée, la commande est ferme et l\'approvisionnement est en cours auprès des grossistes à Rungis.\n4. Validée / Partiellement validée / Annulée : statut mis à jour après notre achat chez le grossiste, selon les disponibilités réelles des fruits frais d\'exception et les choix préalables du client. Un e-mail récapitulatif définitif est envoyé au client à cette étape.\n— Pour les paiements Stripe : la pré-autorisation bancaire est ajustée au montant réel des produits achetés et la capture définitive du paiement est exécutée. Si la commande est annulée, la pré-autorisation est annulée.\n— Pour les paiements par virement : en cas d\'annulation totale ou de produit manquant (validation partielle), le remboursement des sommes dues est immédiatement déclenché par virement bancaire vers le compte du client.\n— Facturation : la facture officielle est éditée automatiquement lors de la validation de la commande et envoyée par e-mail (elle est également disponible dans l\'espace client). Ce message confirme également que la commande sera disponible à la date et au lieu (point de retrait ou livraison à domicile) choisis lors de l\'achat.\n5. Commande retirée / Livrée : la marchandise a été récupérée par le client au créneau sélectionné ou déposée à son domicile lors de la tournée du soir. La commande est close et finalisée.',
    zh: '本網站區分兩種獨立且無法合併結帳的購物車模式：\n— 「現貨」商品：下單時即時進行線上扣款。商品一經售出，不接受任何取消訂單或退換貨之要求。\n— 「預購」商品：每波預購皆會明確標示截止日期與時間（例如：「請於某月某日幾點前下單，以加入本次採購」）。\n— 預購訂單取消權益：在預購截止時間前，客戶皆可在個人後台點選「取消訂單」按鈕。系統將自動取消 Stripe 信用卡授權；若是以銀行轉帳支付，商家將全額退款。一旦超過截止時間，訂單狀態將轉為「處理中」（En traitement），此時訂單即視為最終確認，客戶不得再要求修改或取消。\n\n訂單狀態追蹤說明：客戶可於後台即時查看以下 5 個階段的訂單進度狀態：\n1. 已收到訂單（Commande reçue）：系統已成功建檔。系統此時會自動發送一封訂單成立確認信至您的電子信箱。\n2. 已確認付款（Paiement accepté）：Stripe 線上刷卡（信用額度預先授權）成功後立即顯示；轉帳客戶則於款項實際匯入本公司商業帳戶後更新。\n3. 處理中（En traitement）：預購已截止，訂單已確認鎖定。商家正前往 Rungis 市場向批發商進行採購。\n4. 已確認 / 部分確認 / 已取消（Validée / Partiellement validée / Annulée）：商家於市場完成實際採購後更新，系統將根據當天頂級鮮果的實際供貨狀況與客戶的事先選擇進行調整。此階段系統將發送一封最終確認明細 e-mail。\n— 使用 Stripe 刷卡之客戶：系統將依據實際採購到的商品總額，自動調整預先授權之額度，並執行最終的實際扣款（Capture）。若訂單最終為取消，則直接取消該筆信用卡授權。\n— 使用銀行轉帳之客戶：若訂單全額取消或因缺貨商品（部分確認），系統將會立即透過銀行轉帳方式，將應退還之款項退回至客戶的帳戶。\n— 官方發票：系統將在訂單確認完成時自動開立正式發票，並透過 e-mail 發送給客戶（發票亦會同步更新於個人後台供隨時下載）。信件同時確認您的水果將依下單時約定的日期與地點（指定取貨點或晚間到府配送）準時交付。\n5. 訂單已取貨 / 已送達（Commande retirée / Livrée）：水果已由客戶在指定時段內親自取回，或已由物流於晚間順利配送至府上。此時訂單正式完成並結案結算。',
  },
  {
    title: '4. Moyens de Paiement · 付款方式',
    fr: 'Les règlements s\'effectuent au comptant (TVA non applicable, art. 293 B du CGI) via :\n— Carte Bancaire (Stripe) : pour les stocks et précommandes.\n— Virement Bancaire : les coordonnées sont envoyées par e-mail. Le virement doit impérativement être reçu sur notre compte avant la date et l\'heure de clôture de la session de précommande (indiquées sur le site et dans le mail), sous peine d\'annulation de plein droit de la commande.\n— Espèces au Retrait : autorisé uniquement pour les commandes de moins de 30 € ET réservé exclusivement aux clients ayant déjà honoré et récupéré au moins une première commande sur le site.',
    zh: '網站商品價格皆為最終淨價（依據法國稅法第 293 B 條規定免徵增值稅），付款管道如下：\n— 信用卡（Stripe）：適用於現貨與預購訂單。\n— 銀行轉帳：轉帳帳戶資訊將透過電子郵件發送。款項必須在預購截止時間（明確標示於網頁與郵件中）前送達商家銀行帳戶，逾期未收到款項，訂單將自動取消。\n— 自取時支付現金：僅限總金額低於 30 歐元之訂單，且「僅限」過去曾在本網站成功完成至少一次交易且無棄單紀錄之客戶使用。',
  },
  {
    title: '5. Retrait, Livraison et Aléas Logistiques · 取貨、配送與物流突發狀況處理',
    fr: 'Le client s\'engage à récupérer sa commande (Click & Collect ou livraison à domicile en soirée pour les paniers éligibles) avec bonne foi et coopération.\nEn cas d\'aléa logistique ou de force majeure (retard de vol, blocage douanier, conditions de circulation), Chez Jambes Courtes s\'engage à informer le client. Les parties s\'engageront à convenir d\'un créneau alternatif. Un retard raisonnable (notamment inférieur à 2 heures) ou le refus injustifié par le client de solutions de relivraison alternatives et équitables ne pourra constituer un motif d\'annulation ou de remboursement. Si le client ne se présente pas au point de retrait ou est absent lors de la livraison, la commande de produits périssables est considérée comme abandonnée et aucun remboursement ne sera dû. En cas d\'impossibilité totale et définitive d\'honorer la commande (avarie totale de l\'arrivage), le client sera intégralement remboursé.',
    zh: '客戶承諾本著誠信與配合之原則進行取貨（自取或達門檻之晚間到府配送）。\n若遇不可抗力之物流突發狀況（如航班延誤、海關查驗、嚴重交通壅塞），Chez Jambes Courtes 將主動通知。雙方承諾共同配合重新安排時段。合理範圍內的延遲（如 2 小時以內），或客戶無正當理由拒絕商家提出之替代性公平配送方案時，該訂單恕不接受取消或退款。若客戶未於自取時段出現或配送時不在場，因水果具易腐敗性，該商品將視同放棄且恕不退款。若因航班貨品全數損壞等因素導致完全無法出貨，則將予以全額退款。',
  },
  {
    title: '6. Règlement des Litiges · 爭議處理',
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
