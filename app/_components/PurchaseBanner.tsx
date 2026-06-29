import { createAdminClient } from '@/lib/supabase/admin'

function fmt(dateStr: string, locale: string) {
  // parse as local date (no time zone shift)
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
  })
}

export default async function PurchaseBanner() {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('purchase_trips')
    .select('purchase_date')
    .gt('purchase_date', today)
    .order('purchase_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  const [y, m, d] = data.purchase_date.split('-').map(Number)
  const deadline = new Date(y, m - 1, d)
  const deadlineDateStr = deadline.toISOString().slice(0, 10)

  const zhPurchase  = fmt(data.purchase_date, 'zh-TW')
  const zhDeadline  = fmt(deadlineDateStr, 'zh-TW')
  const frPurchase  = fmt(data.purchase_date, 'fr-FR')
  const frDeadline  = fmt(deadlineDateStr, 'fr-FR')

  const msg = `🛒 下次採購日：${zhPurchase}，請在 ${zhDeadline} 前完成預訂並付款　·　Prochaine date d'achat : ${frPurchase} — commandez et payez avant le ${frDeadline}`

  return (
    <div className="bg-midnight overflow-hidden py-2">
      <div className="flex whitespace-nowrap">
        <div className="flex shrink-0 animate-[marquee-left_28s_linear_infinite]">
          <span className="shrink-0 text-xs tracking-wide text-orange/80 pr-24">{msg}</span>
          <span className="shrink-0 text-xs tracking-wide text-orange/80 pr-24" aria-hidden="true">{msg}</span>
        </div>
      </div>
    </div>
  )
}
