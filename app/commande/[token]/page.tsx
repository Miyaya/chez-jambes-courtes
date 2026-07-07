import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import Footer from '@/app/_components/Footer'

export const metadata = { title: 'Suivi de commande · 訂單查詢 — Chez Jambes Courtes' }

type OrderStatus = 'received_preorder' | 'received_instock' | 'validated' | 'partial_validated' | 'complete' | 'canceled'

type ItemSnapshot = {
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  qty: number
  line_total: number
  preference?: string | null
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

// received_instock never passes through validated/partial_validated — it goes straight
// to complete. Once an order reaches complete/canceled we can't tell which flow it came
// from, so those two are shown as a simple terminal badge instead of a step position.
const PREORDER_STEPS: { key: string; fr: string; zh: string }[] = [
  { key: 'received_preorder', fr: 'Reçue',   zh: '快閃訂單已收到' },
  { key: 'validated',         fr: 'Validée', zh: '已確認' },
  { key: 'complete',          fr: 'Terminée', zh: '已完成' },
]

const INSTOCK_STEPS: { key: string; fr: string; zh: string }[] = [
  { key: 'received_instock', fr: 'Reçue',    zh: '現貨訂單已收到' },
  { key: 'complete',         fr: 'Terminée', zh: '已完成' },
]

interface Props {
  params: Promise<{ token: string }>
}

export default async function CommandePage({ params }: Props) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_prenom, customer_nom, items, subtotal, status, tracking_token, pickup_slots(label, location)')
    .eq('tracking_token', token)
    .single()

  if (!order) {
    return (
      <PageShell accent="magenta">
        <span className="text-5xl block mb-6 text-center motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">✗</span>
        <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <h1 className="text-xl font-bold text-midnight mb-3 text-center">
            Commande introuvable · 找不到訂單
          </h1>
          <p className="text-sm text-midnight/50 text-center mb-8">
            Ce lien est invalide ou a expiré.
            <br />
            <span className="text-xs text-midnight/35">此連結無效或已過期。</span>
          </p>
        </div>
        <div className="text-center"><BackHome /></div>
      </PageShell>
    )
  }

  const status = order.status as OrderStatus
  const items = (order.items ?? []) as ItemSnapshot[]
  const isCanceled = status === 'canceled'
  const isComplete = status === 'complete'
  const isPreorderFlow = status === 'received_preorder' || status === 'validated' || status === 'partial_validated'
  const steps = isPreorderFlow ? PREORDER_STEPS : INSTOCK_STEPS
  const stepIndex =
    status === 'received_preorder' || status === 'received_instock' ? 0 :
    status === 'validated' || status === 'partial_validated' ? 1 :
    steps.length - 1 // complete

  // @ts-expect-error — Supabase nested select returns object not array
  const slot = order.pickup_slots as { label: string; location: string | null } | null

  return (
    <PageShell>
      {/* Order number + customer */}
      <div className="text-center mb-6 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
        <p className="text-xs uppercase tracking-widest text-midnight/40 mb-1">
          #{order.order_number}
        </p>
        <h1 className="text-xl font-bold text-midnight tracking-tight">
          {order.customer_prenom} {order.customer_nom}
        </h1>
      </div>

      {/* Status */}
      {isCanceled ? (
        <div className="flex justify-center mb-8 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <span className="inline-block bg-midnight/8 text-midnight/45 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
            Annulée · 已取消
          </span>
        </div>
      ) : isComplete ? (
        <div className="flex justify-center mb-8 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <span className="inline-block bg-yellow/25 text-midnight text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
            ✓ Terminée · 已完成
          </span>
        </div>
      ) : (
        <div className="mb-8 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          {/* Step indicator */}
          <div className="flex items-center justify-between gap-1 mb-3">
            {steps.map((step, i) => {
              const done    = i < stepIndex
              const current = i === stepIndex
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full border-2 transition-colors ${
                        done    ? 'bg-midnight border-midnight' :
                        current ? 'bg-yellow border-midnight' :
                                  'bg-white border-midnight/20'
                      }`}
                    />
                    <span className={`text-[14px] text-center leading-tight whitespace-nowrap ${
                      current ? 'font-semibold text-midnight' : 'text-midnight/45'
                    }`}>
                      {status === 'partial_validated' && step.key === 'validated' ? '部分確認' : step.zh}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px flex-1 mx-1 mb-4 ${i < stepIndex ? 'bg-midnight' : 'bg-midnight/15'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {status === 'received_preorder' && (
        <div className="rounded-xl border border-midnight/10 bg-midnight/5 px-4 py-3 mb-6 text-xs text-midnight/70 leading-relaxed motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_140ms_backwards]">
          訂單尚未成立，待買到芒果後會更新狀態並以電子郵件通知。沒有買到也會通知，免得你白跑一趟！！若有疑慮可以直接詢問 Line@ 帳號（訂單編號 {order.order_number}）
          <br />
          <span className="text-midnight/50">
            Cette commande n&apos;est pas encore définitivement confirmée. Dès que les mangues seront achetées, le statut sera mis à jour et vous serez averti(e) par e-mail — en cas de rupture aussi, pour vous éviter un déplacement inutile.
          </span>
        </div>
      )}

      <hr className="border-midnight/10 mb-5" />

      {/* Items */}
      <div className="space-y-2.5 mb-5 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_180ms_backwards]">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-baseline gap-2">
            <div>
              <span className="text-sm font-semibold text-midnight">{item.name_tw} {item.name_fr} </span>
              <p className="text-xs text-midnight/70">
                {centsToEur(item.unit_price)} € × {item.qty} {item.unit_label}
              </p>
              {item.preference && (
                <p className="mt-1 mb-1 p-0.5 text-xs font-semibold text-midnight bg-yellow/40 rounded">
                  偏好 · Preference：{item.preference} <br /> 若有溢收部分會退費
                </p>
              )}
            </div>
            <span className="text-sm font-semibold text-midnight tabular-nums shrink-0">
              {centsToEur(item.line_total)} €
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline border-t border-midnight/10 pt-3 mb-5 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_180ms_backwards]">
        <span className="text-sm font-bold text-midnight">總額 · Total</span>
        <span className="text-sm font-bold text-midnight tabular-nums">
          {centsToEur(order.subtotal)} €
        </span>
      </div>

      {/* Pickup slot */}
      {slot && (
        <div className="bg-yellow/15 rounded-xl px-4 py-3 mb-6 text-center motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_260ms_backwards]">
          <p className="text-xs uppercase tracking-wider text-midnight/65 mb-1">
            取貨時段 · Retrait
          </p>
          <p className="text-sm font-bold text-midnight">{slot.label}</p>
          {slot.location && (
            <p className="text-xs text-midnight/60 mt-0.5">{slot.location}</p>
          )}
        </div>
      )}

      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-midnight/65 mb-2">
          加入 Line 官方帳號 @120xcqsx
        </p>
        <a href="https://lin.ee/WdOYi2z" className="inline-block">
          <img src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png" alt="加入好友" height="30" className="border-0" />
        </a>
      </div>

      <div className="text-center mt-6">
        <BackHome />
      </div>
    </PageShell>
  )
}

function BackHome() {
  return (
    <Link
      href="/"
      className="inline-block text-[0.78rem] uppercase tracking-[0.14em] text-midnight/60 hover:text-midnight transition-colors underline underline-offset-4"
    >
      Retour à l&apos;accueil · 返回首頁
    </Link>
  )
}

function PageShell({
  children,
  accent = 'yellow',
}: {
  children: React.ReactNode
  accent?: 'yellow' | 'magenta'
}) {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-midnight">
        <div className="w-full max-w-md bg-white border border-midnight/10 rounded-2xl overflow-hidden">
          <div className={accent === 'magenta' ? 'h-1.5 bg-magenta' : 'h-1.5 bg-yellow'} />
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
