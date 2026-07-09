import Link from 'next/link'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPreorderReceivedEmail, sendInstockOrderReceivedEmail } from '@/lib/email'
import { BANK_INFO } from '@/lib/bank-info'
import Footer from '@/app/_components/Footer'

export const metadata = { title: 'Commande confirmée — Chez Jambes Courtes' }

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

function ViewOrder({ token }: { token: string }) {
  return (
    <Link
      href={`/commande/${token}`}
      className="block w-full bg-midnight text-yellow font-bold text-sm uppercase tracking-wider py-3.5 rounded-full hover:bg-yellow hover:text-midnight border-2 border-midnight transition-colors duration-200 text-center mb-4"
    >
      查看訂單進度 · Suivre ma commande →
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
        <span className="text-5xl block mb-5 text-center motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
          {methodInfo?.icon ?? '✓'}
        </span>
        <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <h1 className="text-2xl font-bold text-midnight mb-1 text-center tracking-tight">
            Merci · 感謝您的訂購 !
          </h1>
          <p className="text-sm text-center text-midnight/60 uppercase tracking-widest mb-6">
            訂單編號 #{order?.order_number}
          </p>
        </div>

        {items.length > 0 && (
          <div className="border-t border-b border-midnight/10 py-4 mb-5 space-y-2 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_180ms_backwards]">
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

        <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_260ms_backwards]">
          {order?.pickup_slots && (
            <div className="bg-yellow/20 rounded-xl px-4 py-3 mb-5 text-center">
              <p className="text-xs uppercase tracking-wider text-midnight/50 mb-1">Retrait · 取貨時段</p>
              {/* @ts-expect-error — nested select */}
              <p className="text-sm font-bold text-midnight">{order.pickup_slots.label}</p>
            </div>
          )}

          {methodInfo && (
            <div className="bg-midnight/5 rounded-xl px-4 py-3 mb-6 text-center">
              <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Mode de paiement · 付款方式</p>
              <p className="text-sm font-bold text-midnight">{methodInfo.fr} · {methodInfo.zh}</p>
            </div>
          )}

          {method === 'virement' && (
            <div className="rounded-xl border border-magenta/30 bg-magenta/5 px-4 py-3 mb-6 text-xs text-midnight space-y-1">
              <p><span className="font-bold">IBAN</span> : {BANK_INFO.iban}</p>
              <p><span className="font-bold">BIC</span> : {BANK_INFO.bic}</p>
              <p><span className="font-bold">Bénéficiaire</span> : {BANK_INFO.beneficiary}</p>
              <p><span className="font-bold">Banque</span> : {BANK_INFO.bank}</p>
              {order?.order_number && (
                <p>
                  <span className="font-bold">Référence</span> : {order.order_number}
                </p>
              )}
              <p className="text-midnight/50 pt-1 leading-relaxed">
                Veuillez noter que ce compte prend uniquement en charge les virements SEPA.
                <br />
                請注意，此帳戶僅支援 SEPA 歐元區轉帳。
              </p>
            </div>
          )}

          <p className="text-xs text-midnight/40 leading-relaxed text-center mb-6">
            Un e-mail de confirmation vous a été envoyé.
            <br />
            <span className="text-midnight/30">訂單確認信已寄送至您的 Email。</span>
          </p>
        </div>
        {order?.tracking_token && <ViewOrder token={order.tracking_token} />}
        <div className="text-center">
          <BackHome />
        </div>
      </PageShell>
    )
  }

  if (!session_id) {
    return (
      <PageShell accent="magenta">
        <span className="text-5xl block mb-6 text-center motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">✗</span>
        <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <h1 className="text-2xl font-bold text-midnight mb-3 text-center">Lien invalide · 連結無效</h1>
          <p className="text-sm text-midnight/55 mb-8 leading-relaxed text-center">
            Ce lien de confirmation est invalide.
            <br />
            <span className="text-xs">此確認連結無效。</span>
          </p>
        </div>
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
      <PageShell accent="magenta">
        <span className="text-5xl block mb-6 text-center motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">✗</span>
        <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <h1 className="text-2xl font-bold text-midnight mb-3 text-center">Session introuvable · 找不到訂單</h1>
          <p className="text-sm text-midnight/55 mb-8 leading-relaxed text-center">
            Veuillez contacter contact@chezjambescourtes.com
          </p>
        </div>
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
        <span className="text-5xl block mb-6 text-center motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">⏳</span>
        <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          <h1 className="text-2xl font-bold text-midnight mb-3 text-center">Paiement en attente · 待付款</h1>
          <p className="text-sm text-midnight/55 mb-8 leading-relaxed text-center">
            Le paiement n&apos;a pas encore été confirmé.
            <br />
            <span className="text-xs">付款尚未確認，請稍後再確認。</span>
          </p>
        </div>
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
        .select('id, order_number, customer_prenom, customer_nom, customer_email, items, subtotal, status, confirmation_email_sent, tracking_token, pickup_slots(label, location)')
        .eq('id', orderId)
        .single()
    : { data: null }

  const items = (order?.items ?? []) as ItemSnapshot[]

  // Send confirmation email exactly once: flip the guard atomically first
  if (order && !order.confirmation_email_sent) {
    const { data: locked } = await supabase
      .from('orders')
      .update({ confirmation_email_sent: true })
      .eq('id', order.id)
      .eq('confirmation_email_sent', false) // only succeeds if still unsent
      .select('id')
      .single()

    if (locked) {
      // @ts-expect-error — Supabase nested select returns object not array
      const slot = order.pickup_slots as { label: string; location: string | null } | null
      const emailData = {
        order_number: order.order_number,
        customer_prenom: order.customer_prenom,
        customer_nom: order.customer_nom,
        customer_email: order.customer_email,
        items: items as { name_fr: string; name_tw: string; unit_label: string; unit_price: number; qty: number; line_total: number; preference?: string | null }[],
        subtotal: order.subtotal,
        tracking_token: order.tracking_token,
        pickup_slot_label: slot?.label ?? null,
        pickup_slot_location: slot?.location ?? null,
      }

      // Stripe orders are always paid by card, never virement — no bank info needed.
      const sendPromise = order.status === 'received_preorder'
        ? sendPreorderReceivedEmail({ ...emailData, payment_method: 'stripe' })
        : sendInstockOrderReceivedEmail(emailData)

      await sendPromise.catch(err => console.error('[email] order confirmation failed:', err))
    }
  }

  return (
    <PageShell>
      <span className="text-5xl block mb-5 text-center motion-safe:animate-[pop-in_500ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
        🥭
      </span>

      <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
        <h1 className="text-2xl font-bold text-midnight mb-1 text-center tracking-tight">
          Merci · 感謝您的訂購 !
        </h1>

        <p className="text-sm text-center text-midnight/60 uppercase tracking-widest mb-6">
          訂單編號 #{order?.order_number}
        </p>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="border-t border-b border-midnight/10 py-4 mb-5 space-y-2 motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_180ms_backwards]">
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

      <div className="motion-safe:animate-[fade-up-in_500ms_cubic-bezier(0.16,1,0.3,1)_260ms_backwards]">
        {/* Pickup slot */}
        {order?.pickup_slots && (
          <div className="bg-yellow/20 rounded-xl px-4 py-3 mb-6 text-center">
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
      </div>

      {order?.tracking_token && <ViewOrder token={order.tracking_token} />}
      <div className="text-center">
        <BackHome />
      </div>
    </PageShell>
  )
}
