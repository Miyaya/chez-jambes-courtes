'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '../_components/Footer'

const faqs: { zh: string; fr: string; answerZh: string; answerFr: string }[] = [
  {
    zh: '有哪些付款方式？',
    fr: 'Quels modes de paiement proposez-vous ?',
    answerZh:
      '我們提供三種安全可靠的付款方式，並依據您的購物模式（現貨 / 快閃）彈性調整：\n💳 信用卡（Stripe 加密系統）：\n－ 購買「現貨」商品：下單時即時完成扣款。\n－ 參與「快閃」活動：結帳時系統僅先取得信用卡授權（保留額度），此時並不會實際扣款。直到商家在批發市場為您成功採購到水果後，才會依實際出貨品項執行最終扣款。\n🏦 銀行轉帳：下單後系統會將轉帳帳戶資訊發送至您的信箱。請注意：款項必須在該波快閃截止時間（明確標示於網頁與郵件中）前正式入帳，否則訂單將自動取消。\n🤝 面交時支付現金：僅開放給總金額「低於 30 歐元」的訂單。款項於面交當天交付即可。',
    answerFr:
      'Nous proposons trois modes de paiement sécurisés, adaptés à nos deux formules (En Stock / Flash) :\n💳 Carte bancaire (Stripe) :\n－ Pour les produits en Stock : débit immédiat à la commande.\n－ Pour le Flash : Stripe prend une simple pré-autorisation (bloque le montant) sans débiter votre compte. Le débit réel (total ou partiel) n\'intervient qu\'une fois vos fruits achetés au marché de gros.\n🏦 Virement bancaire : nos coordonnées vous sont envoyées par e-mail après la commande. Attention : pour être validé, le virement doit impérativement arriver sur notre compte avant l\'heure limite de clôture de la session Flash (indiquée sur le site).\n🤝 Espèces au retrait : disponible uniquement pour les commandes de moins de 30 €. Le règlement se fait le jour de la remise.',
  },
  {
    zh: '線上刷卡安全嗎？',
    fr: 'Le paiement en ligne par carte est-il sécurisé ?',
    answerZh:
      '完全安全。我們使用 Stripe 處理所有刷卡付款，我們自己完全不會接觸或儲存您的卡號資訊。Stripe 是全球最受信賴的支付平台之一，被 Amazon、Google、Shopify 等大型企業廣泛採用，符合最高等級的 PCI DSS 安全標準。',
    answerFr:
      'Absolument. Nous utilisons Stripe pour traiter tous les paiements par carte — nous ne voyons ni ne stockons aucune donnée bancaire. Stripe est l\'une des plateformes de paiement les plus fiables au monde, utilisée par Amazon, Google, Shopify et de nombreuses autres grandes entreprises. Elle est certifiée PCI DSS niveau 1.',
  },
  {
    zh: '訂閱電子報有什麼好處？',
    fr: 'Pourquoi s\'abonner à la newsletter ?',
    answerZh:
      '第一時間收到新品到貨通知、現貨商品上架提醒以及不定期的獨家優惠。因為我們的商品數量有限，電子報訂閱者往往能搶先得知消息，避免錯過喜歡的水果。',
    answerFr:
      'Vous recevez en avant-première les notifications de nouveaux arrivages, les alertes de mise en vente et des offres exclusives ponctuelles. Nos quantités étant limitées, les abonnés sont souvent les premiers informés — et les premiers servis.',
  },
  {
    zh: '你們的水果貨源從哪裡來？',
    fr: 'D\'où proviennent vos fruits ?',
    answerZh:
      '我們直接向 Rungis 市場採購，Rungis 是全世界最大的批發市場。目前所有台灣水果皆採空運冷鏈進口，確保抵達時仍保有新鮮度與最佳風味。',
    answerFr:
      'Nous nous approvisionnons directement au marché de Rungis, le plus grand marché de gros au monde. Nos fruits taïwanais sont actuellement tous importés par avion en chaîne du froid, afin de préserver leur fraîcheur et leur qualité à l\'arrivée.',
  },
  {
    zh: '我想買 Rungis 市場裡的其他水果，但網站上沒有列出來，也可以嗎？',
    fr: 'Je souhaite acheter des fruits du marché de Rungis qui ne sont pas sur le site, c\'est possible ?',
    answerZh:
      '完全可以！但須請您提前與我們確認。如果您正在尋找某款 Rungis 市場內有販售、但我們網站上未列出的特定珍稀或當季水果，請務必在該波快閃截止時間前至少 48 小時，透過網站聯絡表單與我們聯繫。\n若確認合作的批發商有現貨，我們將透過電子郵件與您確認最終報價。隨後，我們會在您的個人帳戶中開通專屬下單選項，讓您能將該商品加入購物車，並在我們前往市場採購前完成線上信用卡預先授權。恕不接受當天臨時追加或在市場採購現場的即時通訊要求。',
    answerFr:
      'Oui, c\'est tout à fait possible, sous réserve de validation en amont ! Si vous recherchez un fruit exotique ou de saison spécifique disponible à Rungis, contactez-nous via notre formulaire au moins 48 heures avant la clôture de la session Flash.\nSi le produit est disponible chez nos grossistes, nous convenons ensemble d\'un prix ferme par e-mail. Nous ajoutons ensuite une option personnalisée sur votre compte pour que vous puissiez l\'ajouter à votre panier et valider votre pré-autorisation avant notre départ au marché. Aucune demande de dernière minute ou modification en direct depuis le marché ne pourra être traitée.',
  },
  {
    zh: '可以開收據或發票嗎？',
    fr: 'Pouvez-vous fournir un reçu ou une facture ?',
    answerZh:
      '是的，完全可以。我們為法國合法註冊公司，在您的訂單經由商家最終確認成立後（包含您的扣款明細與付款方式），系統皆會自動開立官方正式發票。\n該發票將會同步發送至您的電子信箱，您也可以隨時登入網站的個人帳戶，在「歷史訂單」中進行下載與查看。',
    answerFr:
      'Oui, absolument. En tant qu\'entreprise légalement enregistrée en France, une facture officielle est automatiquement éditée pour chaque commande dès sa validation définitive par nos soins (incluant le détail de votre transaction et le mode de paiement utilisé).\nElle vous est envoyée directement par e-mail et reste accessible à tout moment dans votre espace client, dans l\'historique de vos commandes.',
  },
]

function AccordionItem({
  item,
  open,
  onToggle,
}: {
  item: (typeof faqs)[number]
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-midnight/10 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-midnight/2 transition-colors"
        aria-expanded={open}
      >
        <div>
          <p className="font-bold text-midnight leading-snug">{item.zh}</p>
          <p className="font-bold text-midnight mt-0.5 leading-snug">{item.fr}</p>
        </div>
        <span
          className={`shrink-0 mt-0.5 text-midnight/40 text-lg leading-none transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-midnight/8">
          <div className="pt-4 space-y-3">
            {item.answerZh.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-midnight leading-relaxed font-medium">
                {line}
              </p>
            ))}
            <div className="border-t border-midnight/8 pt-3 space-y-3">
              {item.answerFr.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-midnight leading-relaxed font-medium">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setOpenIndexes(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-midnight mb-1">常見問題 · Foire aux questions</h1>
      </section>

      <section className="max-w-2xl lg:max-w-3xl mx-auto px-6 py-16 space-y-3">
        {faqs.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            open={openIndexes.has(i)}
            onToggle={() => toggle(i)}
          />
        ))}

        {/* Contact CTA */}
        <div className="mt-10 rounded-2xl bg-midnight/4 border border-midnight/8 px-6 py-5 text-center">
          <p className="text-sm font-bold text-midnight mb-1">還有其他問題？· D&apos;autres questions ?</p>
          <p className="text-sm text-midnight/50 mb-4">
            歡迎直接聯繫我們。<br />
            <span className="text-xs">N&apos;hésitez pas à nous contacter directement.</span>
          </p>
          <a
            href="mailto:contact@chezjambescourtes.com"
            className="inline-block text-xs uppercase tracking-wider font-bold text-midnight border-2 border-midnight/20 px-5 py-2.5 rounded-full hover:border-midnight transition-colors duration-200"
          >
            contact@chezjambescourtes.com
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
