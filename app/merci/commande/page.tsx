import Link from 'next/link'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email'

export const metadata = { title: 'Commande confirmée — Chez Jambes Courtes' }

const dotBg = {
  backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
  backgroundSize: '28px 28px',
}

type ItemSnapshot = {
  product_id: string
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  promo_price: number | null
  qty: number
  line_total: number
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen">
      <div
        className="flex-1 bg-orange flex flex-col items-center justify-center px-6 py-16 text-midnight"
        style={dotBg}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
          {children}
        </div>
      </div>
      <div className="bg-orange overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 64"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full h-14 sm:h-16"
        >
          <path
            d="M0,44 C82,26 168,58 294,38 C386,22 448,52 572,32 C696,12 762,50 902,28 C1042,6 1124,46 1264,24 C1342,12 1402,36 1440,28 L1440,64 L0,64 Z"
            fill="#031926"
          />
        </svg>
      </div>
      <footer className="bg-midnight text-center px-8 py-10 text-sm text-white/40 tracking-[0.08em] leading-loose">
        <p className="text-white/70">Chez Jambes Courtes · Paris</p>
        <p className="mt-2 opacity-50">© 2025 · Mentions légales · 隱私政策</p>
      </footer>
    </main>
  )
}

function BackHome() {
  return (
    <Link
      href="/"
      className="inline-block text-[0.78rem] uppercase tracking-[0.14em] text-midnight/50 hover:text-midnight transition-colors underline underline-offset-4"
    >
      Retour à l&apos;accueil · 返回首頁
    </Link>
  )
}

const METHOD_LABEL: Record<string, { fr: string; zh: string; icon: string }> = {
  virement:      { fr: 'Virement bancaire',     zh: '銀行轉帳',  icon: '🏦' },
  pay_on_pickup: { fr: 'Paiement à la livraison', zh: '面交付款', icon: '🤝' },
}

interface Props {
  searchParams: Promise<{ session_id?: string; token?: string; method?: string }>
}

export default async function CommandeConfirmeePage({ searchParams }: Props) {
  const { session_id, token, method } = await searchParams

  // ── Non-Stripe confirmation ──────────────────────────────────────────────────
  if (token && !session_id) {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, customer_prenom, customer_nom, items, subtotal, tracking_token, pickup_slots(label, location)')
      .eq('tracking_token', token)
      .single()

    const items = (order?.items ?? []) as ItemSnapshot[]
    const methodInfo = method ? METHOD_LABEL[method] : null

    return (
      <PageShell>
        <span className="text-5xl block mb-5 text-center">{methodInfo?.icon ?? '✓'}</span>
        <h1 className="text-2xl font-bold text-midnight mb-1 text-center tracking-tight">
          Merci · 感謝您的訂購 !
        </h1>
        {order?.customer_prenom && (
          <p className="text-sm text-midnight/50 text-center mb-6">
            {order.customer_prenom} {order.customer_nom}
          </p>
        )}
        {order?.order_number && (
          <p className="text-xs text-center text-midnight/35 uppercase tracking-widest mb-6">
            {order.order_number}
          </p>
        )}

        {items.length > 0 && (
          <div className="border-t border-b border-midnight/10 py-4 mb-5 space-y-2">
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
            <div className="flex justify-between items-baseline gap-2 pt-2 border-t border-midnight/10">
              <span className="text-sm font-bold text-midnight">Total</span>
              <span className="text-sm font-bold text-midnight tabular-nums">
                {centsToEur(order?.subtotal ?? 0)} €
              </span>
            </div>
          </div>
        )}

        {order?.pickup_slots && (
          <div className="bg-orange/20 rounded-xl px-4 py-3 mb-5 text-center">
            <p className="text-xs uppercase tracking-wider text-midnight/50 mb-1">Retrait · 取貨時段</p>
            {/* @ts-expect-error — nested select */}
            <p className="text-sm font-bold text-midnight">{order.pickup_slots.label}</p>
          </div>
        )}

        {methodInfo && (
          <div className="bg-midnight/5 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Mode de paiement · 付款方式</p>
            <p className="text-sm font-bold text-midnight">{methodInfo.fr} · {methodInfo.zh}</p>
            {method === 'virement' && process.env.NEXT_PUBLIC_IBAN && (
              <p className="text-xs text-midnight/50 mt-2 font-mono">{process.env.NEXT_PUBLIC_IBAN}</p>
            )}
            {method === 'virement' && order?.order_number && (
              <p className="text-xs text-midnight/40 mt-1">
                Référence : <span className="font-bold">{order.order_number}</span>
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-midnight/40 leading-relaxed text-center mb-6">
          Un e-mail de confirmation vous a été envoyé.
          <br />
          <span className="text-midnight/30">訂單確認信已寄送至您的 Email。</span>
        </p>
        <div className="text-center">
          <BackHome />
        </div>
      </PageShell>
    )
  }

  if (!session_id) {
    return (
      <PageShell>
        <span className="text-5xl block mb-6 text-center">✗</span>
        <h1 className="text-2xl font-bold text-midnight mb-3 text-center">Lien invalide · 連結無效</h1>
        <p className="text-sm text-midnight/55 mb-8 leading-relaxed text-center">
          Ce lien de confirmation est invalide.
          <br />
          <span className="text-xs">此確認連結無效。</span>
        </p>
        <div className="text-center">
          <BackHome />
        </div>
      </PageShell>
    )
  }

  // Verify payment with Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    return (
      <PageShell>
        <span className="text-5xl block mb-6 text-center">✗</span>
        <h1 className="text-2xl font-bold text-midnight mb-3 text-center">Session introuvable · 找不到訂單</h1>
        <p className="text-sm text-midnight/55 mb-8 leading-relaxed text-center">
          Veuillez contacter contact@chezjambescourtes.com
        </p>
        <div className="text-center">
          <BackHome />
        </div>
      </PageShell>
    )
  }

  // manual capture: payment_status stays 'unpaid' until capture; check the PaymentIntent instead
  let paymentOk = session.payment_status === 'paid'
  if (!paymentOk && session.payment_intent) {
    const pi = await stripe.paymentIntents.retrieve(
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id
    )
    paymentOk = pi.status === 'requires_capture'
  }

  if (!paymentOk) {
    return (
      <PageShell>
        <span className="text-5xl block mb-6 text-center">⏳</span>
        <h1 className="text-2xl font-bold text-midnight mb-3 text-center">Paiement en attente · 待付款</h1>
        <p className="text-sm text-midnight/55 mb-8 leading-relaxed text-center">
          Le paiement n&apos;a pas encore été confirmé.
          <br />
          <span className="text-xs">付款尚未確認，請稍後再確認。</span>
        </p>
        <div className="text-center">
          <BackHome />
        </div>
      </PageShell>
    )
  }

  // Fetch order from Supabase
  const supabase = createAdminClient()
  const orderId = session.metadata?.order_id

  const { data: order } = orderId
    ? await supabase
        .from('orders')
        .select('id, order_number, customer_prenom, customer_nom, customer_email, items, subtotal, status, tracking_token, pickup_slots(label, location)')
        .eq('id', orderId)
        .single()
    : { data: null }

  const items = (order?.items ?? []) as ItemSnapshot[]

  // Send confirmation email exactly once: transition pending → locked atomically
  if (order && order.status === 'received') {
    const { data: locked } = await supabase
      .from('orders')
      .update({ status: 'accepted' })
      .eq('id', order.id)
      .eq('status', 'received') // only succeeds if still received
      .select('id')
      .single()

    if (locked) {
      // @ts-expect-error — Supabase nested select returns object not array
      const slot = order.pickup_slots as { label: string; location: string | null } | null
      await sendOrderConfirmationEmail({
        order_number: order.order_number,
        customer_prenom: order.customer_prenom,
        customer_nom: order.customer_nom,
        customer_email: order.customer_email,
        items: items as Parameters<typeof sendOrderConfirmationEmail>[0]['items'],
        subtotal: order.subtotal,
        tracking_token: order.tracking_token,
        pickup_slot_label: slot?.label ?? null,
        pickup_slot_location: slot?.location ?? null,
      }).catch(err => console.error('[email] order confirmation failed:', err))
    }
  }

  return (
    <PageShell>
      <span className="text-5xl block mb-5 text-center">🥭</span>

      <h1 className="text-2xl font-bold text-midnight mb-1 text-center tracking-tight">
        Merci · 感謝您的訂購 !
      </h1>

      {order?.customer_prenom && (
        <p className="text-sm text-midnight/50 text-center mb-6">{order.customer_prenom} {order.customer_nom}</p>
      )}

      {order?.order_number && (
        <p className="text-xs text-center text-midnight/35 uppercase tracking-widest mb-6">
          {order.order_number}
        </p>
      )}

      {/* Items */}
      {items.length > 0 && (
        <div className="border-t border-b border-midnight/10 py-4 mb-5 space-y-2">
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
          <div className="flex justify-between items-baseline gap-2 pt-2 border-t border-midnight/10">
            <span className="text-sm font-bold text-midnight">Total</span>
            <span className="text-sm font-bold text-midnight tabular-nums">
              {centsToEur(order?.subtotal ?? items.reduce((s, i) => s + i.line_total, 0))} €
            </span>
          </div>
        </div>
      )}

      {/* Pickup slot */}
      {order?.pickup_slots && (
        <div className="bg-orange/20 rounded-xl px-4 py-3 mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-midnight/50 mb-1">
            Retrait · 取貨時段
          </p>
          {/* @ts-expect-error — Supabase nested select returns object not array */}
          <p className="text-sm font-bold text-midnight">{order.pickup_slots.label}</p>
          {/* @ts-expect-error — Supabase nested select returns object not array */}
          {order.pickup_slots.location && (
            // @ts-expect-error — Supabase nested select returns object not array
            <p className="text-xs text-midnight/45 mt-0.5">{order.pickup_slots.location}</p>
          )}
        </div>
      )}

      <p className="text-xs text-midnight/40 leading-relaxed text-center mb-6">
        Un e-mail de confirmation vous a été envoyé.
        <br />
        <span className="text-midnight/30">訂單確認信已寄送至您的 Email。</span>
      </p>

      <div className="text-center">
        <BackHome />
      </div>
    </PageShell>
  )
}
