'use client'

import { useState } from 'react'
import Link from 'next/link'

const faqs: { zh: string; fr: string; answerZh: string; answerFr: string }[] = [
  {
    zh: '線上刷卡安全嗎？',
    fr: 'Le paiement en ligne par carte est-il sécurisé ?',
    answerZh:
      '完全安全。我們使用 Stripe 處理所有刷卡付款，我們自己完全不會接觸或儲存您的卡號資訊。Stripe 是全球最受信賴的支付平台之一，被 Amazon、Google、Shopify 等大型企業廣泛採用，符合最高等級的 PCI DSS 安全標準。',
    answerFr:
      'Absolument. Nous utilisons Stripe pour traiter tous les paiements par carte — nous ne voyons ni ne stockons aucune donnée bancaire. Stripe est l\'une des plateformes de paiement les plus fiables au monde, utilisée par Amazon, Google, Shopify et de nombreuses autres grandes entreprises. Elle est certifiée PCI DSS niveau 1.',
  },
  {
    zh: '有哪些付款方式？',
    fr: 'Quels modes de paiement proposez-vous ?',
    answerZh:
      '目前提供三種付款方式：\n💳 信用卡（Stripe）：付款後訂單立即成立，Stripe 先保留款項，採購後才實際扣款。\n🏦 銀行轉帳：下訂後我們寄送匯款資訊，確認收款後才去採購，請盡快完成轉帳。\n🤝 面交付款：限有過完整訂單紀錄的熟客，付款於面交當天進行。',
    answerFr:
      'Nous proposons trois modes de paiement :\n💳 Carte bancaire (Stripe) : la commande est confirmée immédiatement, Stripe bloque le montant sans débiter avant l\'achat.\n🏦 Virement bancaire : nous vous envoyons les coordonnées après commande, l\'achat n\'a lieu qu\'après réception du virement.\n🤝 Paiement à la livraison : réservé aux clients ayant déjà finalisé une commande, règlement le jour de la remise.',
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
    zh: '我想買 Rungis 市場裡的其他水果，但網站上沒有列出來，也可以嗎？',
    fr: 'Je souhaite acheter des fruits du marché de Rungis qui ne sont pas sur le site, c\'est possible ?',
    answerZh:
      '當然可以！請直接聯繫我們，告訴我們您想要的品項，我們會確認是否能夠代購及相關費用。',
    answerFr:
      'Bien sûr ! Contactez-nous directement en nous indiquant ce qui vous intéresse. Nous vous confirmerons la disponibilité et le tarif.',
  },
  {
    zh: '可以開收據或發票嗎？',
    fr: 'Pouvez-vous fournir un reçu ou une facture ?',
    answerZh:
      '可以。我們是持有正式 SIRET 號碼的合法公司，可以提供收據或發票。如有需要，請在下訂時於備注欄說明，或事後聯繫我們。',
    answerFr:
      'Oui. Nous sommes une entreprise officielle disposant d\'un numéro SIRET, en mesure de fournir un reçu ou une facture. Précisez-le dans la note lors de votre commande, ou contactez-nous après coup.',
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
          <p className="text-sm text-midnight/45 mt-0.5 leading-snug">{item.fr}</p>
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
            <div className="border-t border-midnight/8 pt-3 space-y-2">
              {item.answerFr.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-midnight/55 leading-relaxed">
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
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
        <h1 className="text-3xl font-bold text-midnight mb-1">常見問題</h1>
        <p className="text-midnight/60 text-sm tracking-[0.15em] uppercase">Foire aux questions</p>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16 space-y-3">
        {faqs.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
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

        <div className="pt-6 flex flex-wrap gap-4 text-sm">
          <Link
            href="/comment-acheter"
            className="px-5 py-2.5 bg-midnight text-orange font-bold rounded-full hover:bg-orange hover:text-midnight transition-colors duration-200"
          >
            購買流程 →
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border-2 border-midnight/20 text-midnight/60 font-bold rounded-full hover:border-midnight hover:text-midnight transition-colors duration-200"
          >
            返回首頁 →
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
