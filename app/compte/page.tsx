import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  signOutAction,
  toggleNewsletterAction,
  deleteAccountAction,
} from './actions'
import { DeleteAccountButton } from './_components/DeleteAccountButton'

export const metadata = { title: 'Mon compte · 我的帳號 — Chez Jambes Courtes' }

type OrderStatus = 'pending' | 'locked' | 'confirmed' | 'done' | 'canceled'

const STATUS_LABEL: Record<OrderStatus, { fr: string; zh: string; color: string }> = {
  pending:   { fr: 'Confirmée',     zh: '已預定', color: 'bg-orange/20 text-midnight' },
  locked:    { fr: 'En traitement', zh: '處理中', color: 'bg-blue-50 text-blue-700' },
  confirmed: { fr: 'Prête',         zh: '已處理', color: 'bg-green-50 text-green-700' },
  done:      { fr: 'Livrée',        zh: '已交貨', color: 'bg-midnight/8 text-midnight' },
  canceled:  { fr: 'Annulée',       zh: '已取消', color: 'bg-midnight/5 text-midnight/40' },
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-midnight/8 p-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-midnight/40 mb-4">{title}</h2>
      {children}
    </section>
  )
}

export default async function ComptePage() {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  // Fetch customer record — create or link if first login
  let { data: customer } = await admin
    .from('customers')
    .select('id, name, email, subscriber_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!customer) {
    // Check for an existing guest customer by email and link them
    const { data: guestCustomer } = await admin
      .from('customers')
      .select('id, name, email, subscriber_id')
      .eq('email', user.email!)
      .is('auth_user_id', null)
      .single()

    if (guestCustomer) {
      await admin
        .from('customers')
        .update({ auth_user_id: user.id })
        .eq('id', guestCustomer.id)
      // Backfill customer_id on past guest orders
      await admin
        .from('orders')
        .update({ customer_id: guestCustomer.id })
        .eq('customer_email', user.email!)
        .is('customer_id', null)
      customer = guestCustomer
    } else {
      const { data: newCustomer } = await admin
        .from('customers')
        .insert({
          auth_user_id: user.id,
          name: (user.user_metadata.full_name as string | undefined) ?? user.email!.split('@')[0],
          email: user.email!,
        })
        .select('id, name, email, subscriber_id')
        .single()
      customer = newCustomer
    }
  }

  if (!customer) redirect('/connexion')

  // Newsletter status
  const { data: subscriber } = customer.subscriber_id
    ? await admin
        .from('subscribers')
        .select('id, active')
        .eq('id', customer.subscriber_id)
        .single()
    : { data: null }

  const newsletterActive = subscriber?.active ?? false

  // Order history (by email — admin bypasses RLS, identity verified via Supabase auth above)
  const { data: orders } = await admin
    .from('orders')
    .select('order_number, status, subtotal, created_at, tracking_token, pickup_slots(label)')
    .eq('customer_email', customer.email)
    .order('created_at', { ascending: false })
    .limit(20)

  const toggleNewsletter = toggleNewsletterAction.bind(
    null,
    customer.id,
    customer.subscriber_id ?? null,
    newsletterActive,
    customer.email,
    customer.name,
  )

  const deleteAccount = deleteAccountAction.bind(null, user.id)

  return (
    <main
      className="min-h-screen bg-orange/30 px-4 py-10"
      style={{
        backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-midnight/40 mb-0.5">
              Mon compte · 我的帳號
            </p>
            <h1 className="text-xl font-bold text-midnight tracking-tight">{customer.name}</h1>
            <p className="text-sm text-midnight/40">{customer.email}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs uppercase tracking-wider text-midnight/40 hover:text-midnight transition-colors border border-midnight/20 rounded-full px-3 py-1.5"
            >
              Déconnexion · 登出
            </button>
          </form>
        </div>

        {/* Newsletter */}
        <Section title="Notifications · 電子報">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-midnight mb-0.5">
                Recevoir les actualités · 訂閱電子報
              </p>
              <p className="text-xs text-midnight/40 leading-relaxed">
                Arrivages, disponibilités, offres exclusives.
                <br />
                新品到貨、現貨通知、獨家優惠。
              </p>
            </div>
            <form action={toggleNewsletter} className="shrink-0">
              <button
                type="submit"
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-midnight/30 ${
                  newsletterActive ? 'bg-midnight' : 'bg-midnight/20'
                }`}
                aria-label={newsletterActive ? 'Désactiver' : 'Activer'}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    newsletterActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </form>
          </div>
        </Section>

        {/* Order history */}
        <Section title="Mes commandes · 我的訂單">
          {!orders?.length ? (
            <p className="text-sm text-midnight/35 py-4 text-center">
              Aucune commande · 尚無訂單紀錄
            </p>
          ) : (
            <ul className="space-y-3">
              {orders.map(order => {
                const status = order.status as OrderStatus
                const label = STATUS_LABEL[status] ?? STATUS_LABEL.pending
                // @ts-expect-error — Supabase nested select returns object not array
                const slotLabel = order.pickup_slots?.label as string | undefined
                return (
                  <li key={order.order_number}>
                    <Link
                      href={`/commande/${order.tracking_token}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-midnight/4 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-midnight group-hover:underline underline-offset-2">
                          {order.order_number}
                        </p>
                        {slotLabel && (
                          <p className="text-xs text-midnight/35 truncate">{slotLabel}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${label.color}`}>
                          {label.zh}
                        </span>
                        <span className="text-sm font-bold text-midnight tabular-nums">
                          {centsToEur(order.subtotal)} €
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        {/* Danger zone */}
        <Section title="Compte · 帳號管理">
          <p className="text-xs text-midnight/40 leading-relaxed mb-4">
            La suppression est définitive et irréversible.
            Vos informations personnelles seront effacées.
            <br />
            <span className="text-midnight/30">
              刪除後無法復原，您的個人資料將被永久移除。
            </span>
          </p>
          <DeleteAccountButton action={deleteAccount} />
        </Section>

      </div>
    </main>
  )
}
