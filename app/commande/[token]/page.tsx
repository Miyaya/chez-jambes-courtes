import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import Footer from '@/app/_components/Footer'

export const metadata = { title: 'Suivi de commande · 訂單查詢 — Chez Jambes Courtes' }

type OrderStatus = 'received' | 'accepted' | 'processing' | 'validated' | 'partial_validated' | 'complete' | 'canceled'

type ItemSnapshot = {
  name_fr: string
  name_tw: string
  unit_label: string
  qty: number
  line_total: number
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

const STATUS_STEPS: { key: OrderStatus; fr: string; zh: string }[] = [
  { key: 'received',          fr: 'Reçue',           zh: '已收到' },
  { key: 'accepted',          fr: 'Acceptée',         zh: '已接受' },
  { key: 'processing',        fr: 'En traitement',    zh: '處理中' },
  { key: 'validated',         fr: 'Validée',          zh: '已確認' },
  { key: 'complete',          fr: 'Terminée',         zh: '已完成' },
]

const STEP_INDEX: Record<OrderStatus, number> = {
  received:          0,
  accepted:          1,
  processing:        2,
  validated:         3,
  partial_validated: 3,
  complete:          4,
  canceled:          -1,
}

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
      <PageShell>
        <span className="text-5xl block mb-6 text-center">✗</span>
        <h1 className="text-xl font-bold text-midnight mb-3 text-center">
          Commande introuvable · 找不到訂單
        </h1>
        <p className="text-sm text-midnight/50 text-center mb-8">
          Ce lien est invalide ou a expiré.
          <br />
          <span className="text-xs text-midnight/35">此連結無效或已過期。</span>
        </p>
        <div className="text-center"><BackHome /></div>
      </PageShell>
    )
  }

  const status = order.status as OrderStatus
  const items = (order.items ?? []) as ItemSnapshot[]
  const stepIndex = STEP_INDEX[status]
  const isCanceled = status === 'canceled'

  // @ts-expect-error — Supabase nested select returns object not array
  const slot = order.pickup_slots as { label: string; location: string | null } | null

  async function cancelOrderAction() {
    'use server'
    const db = createAdminClient()
    await db
      .from('orders')
      .update({ status: 'canceled' })
      .eq('tracking_token', token)
      .eq('status', 'received')
    redirect(`/commande/${token}`)
  }

  return (
    <PageShell>
      {/* Order number + customer */}
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-midnight/35 mb-1">
          {order.order_number}
        </p>
        <h1 className="text-xl font-bold text-midnight tracking-tight">
          {order.customer_prenom} {order.customer_nom}
        </h1>
      </div>

      {/* Status */}
      {isCanceled ? (
        <div className="flex justify-center mb-8">
          <span className="inline-block bg-midnight/8 text-midnight/45 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
            Annulée · 已取消
          </span>
        </div>
      ) : (
        <div className="mb-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between gap-1 mb-3">
            {STATUS_STEPS.map((step, i) => {
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
                    <span className={`text-[10px] text-center leading-tight whitespace-nowrap ${
                      current ? 'font-bold text-midnight' : 'text-midnight/35'
                    }`}>
                      {step.zh}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-px flex-1 mx-1 mb-4 ${i < stepIndex ? 'bg-midnight' : 'bg-midnight/15'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <hr className="border-midnight/10 mb-5" />

      {/* Items */}
      <div className="space-y-2.5 mb-5">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-baseline gap-2">
            <div>
              <span className="text-sm font-bold text-midnight">{item.name_tw}</span>
              <span className="text-xs text-midnight/40 ml-1.5">
                {item.name_fr} × {item.qty} {item.unit_label}
              </span>
            </div>
            <span className="text-sm font-bold text-midnight tabular-nums shrink-0">
              {centsToEur(item.line_total)} €
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline border-t border-midnight/10 pt-3 mb-5">
        <span className="text-sm font-bold text-midnight">Total</span>
        <span className="text-sm font-bold text-midnight tabular-nums">
          {centsToEur(order.subtotal)} €
        </span>
      </div>

      {/* Pickup slot */}
      {slot && (
        <div className="bg-yellow/15 rounded-xl px-4 py-3 mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-midnight/45 mb-1">
            Retrait · 取貨時段
          </p>
          <p className="text-sm font-bold text-midnight">{slot.label}</p>
          {slot.location && (
            <p className="text-xs text-midnight/40 mt-0.5">{slot.location}</p>
          )}
        </div>
      )}

      {/* Cancel section */}
      {status === 'received' && (
        <form action={cancelOrderAction}>
          <button
            type="submit"
            className="w-full border-2 border-midnight/20 text-midnight/50 text-xs font-bold uppercase tracking-wider py-3 rounded-xl hover:border-midnight hover:text-midnight transition-colors duration-200"
          >
            Annuler la commande · 取消訂單
          </button>
        </form>
      )}

      {status === 'accepted' && (
        <div className="relative group">
          <button
            disabled
            className="w-full border-2 border-midnight/10 text-midnight/25 text-xs font-bold uppercase tracking-wider py-3 rounded-xl cursor-not-allowed"
          >
            Annuler la commande · 取消訂單
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-midnight text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center leading-relaxed">
            Commande en cours de traitement
            <br />
            <span className="text-white/60">訂單處理中，無法取消</span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-midnight" />
          </div>
        </div>
      )}

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
      className="inline-block text-[0.78rem] uppercase tracking-[0.14em] text-midnight/40 hover:text-midnight transition-colors underline underline-offset-4"
    >
      Retour à l&apos;accueil · 返回首頁
    </Link>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-midnight">
        <div className="w-full max-w-md bg-white border border-midnight/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1.5 bg-yellow" />
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
