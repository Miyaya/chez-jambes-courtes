import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NouveauCreneauDialog } from './_components/NouveauCreneauDialog'

export const metadata = { title: 'Pickup — Admin' }

type OrderStatus = 'received' | 'accepted' | 'processing' | 'validated' | 'partial_validated' | 'complete' | 'canceled'

const STATUS_LABEL: Record<OrderStatus, { zh: string; color: string }> = {
  received:          { zh: '已收到',   color: 'bg-yellow/20 text-midnight' },
  accepted:          { zh: '已接受',   color: 'bg-blue-50 text-blue-700' },
  processing:        { zh: '處理中',   color: 'bg-blue-50 text-blue-700' },
  validated:         { zh: '已確認',   color: 'bg-green-50 text-green-700' },
  partial_validated: { zh: '部分確認', color: 'bg-amber-50 text-amber-700' },
  complete:          { zh: '已完成',   color: 'bg-midnight/8 text-midnight' },
  canceled:          { zh: '已取消',   color: 'bg-midnight/5 text-midnight/40' },
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

export default async function PickupAdminPage() {
  await requireAdmin()

  const admin = createAdminClient()

  const { data: slots } = await admin
    .from('pickup_slots')
    .select(`
      id, label, slot_at, location, active,
      orders(
        order_number, status, subtotal, tracking_token,
        customer_prenom, customer_nom, customer_email, customer_phone,
        note, items, payment_method
      )
    `)
    .order('slot_at', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-midnight">
          Pickup · 取貨時段
        </h1>
        <NouveauCreneauDialog />
      </div>

      {!slots?.length && (
        <p className="text-sm text-midnight/35">Aucun créneau.</p>
      )}

      <div className="space-y-6">
        {(slots ?? []).map(slot => {
          const orders = (slot.orders ?? []) as {
            order_number: string
            status: string
            subtotal: number
            tracking_token: string
            customer_prenom: string
            customer_nom: string
            customer_email: string
            customer_phone: string | null
            note: string | null
            items: { name_tw: string; qty: number; unit_label: string; preference?: string | null }[]
            payment_method: string | null
          }[]

          const activeOrders = orders.filter(o => o.status !== 'canceled')
          const total = activeOrders.reduce((sum, o) => sum + o.subtotal, 0)

          return (
            <div key={slot.id} className="bg-white rounded-2xl border border-midnight/8 shadow-sm overflow-hidden">
              {/* Slot header */}
              <div className="px-5 py-4 border-b border-midnight/8 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-midnight">{slot.label}</p>
                    {!slot.active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-midnight/8 text-midnight/40">
                        Inactif
                      </span>
                    )}
                  </div>
                  {slot.location && (
                    <p className="text-xs text-midnight/40">{slot.location}</p>
                  )}
                  <p className="text-xs text-midnight/35 mt-0.5">
                    {new Date(slot.slot_at).toLocaleString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-midnight tabular-nums">{centsToEur(total)} €</p>
                  <p className="text-xs text-midnight/40">
                    {activeOrders.length} commande{activeOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Orders table */}
              {orders.length === 0 ? (
                <p className="px-5 py-6 text-sm text-midnight/30 text-center">Aucune commande.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-midnight/5 text-left bg-midnight/2">
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Client</th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Articles</th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Paiement</th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Total</th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-midnight/5">
                    {orders.map(order => {
                      const status = order.status as OrderStatus
                      const label = STATUS_LABEL[status] ?? STATUS_LABEL.received
                      const items: { name_tw: string; qty: number; unit_label: string; preference?: string | null }[] =
                        Array.isArray(order.items) ? order.items : []

                      return (
                        <tr key={order.order_number} className={`${status === 'canceled' ? 'opacity-40' : ''} hover:bg-midnight/2 transition-colors`}>
                          <td className="px-4 py-3">
                            <a
                              href={`/commande/${order.tracking_token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-midnight hover:underline underline-offset-2"
                            >
                              {order.customer_prenom} {order.customer_nom}
                            </a>
                            <p className="text-xs text-midnight/40">{order.customer_email}</p>
                            {order.customer_phone && (
                              <p className="text-xs text-midnight/40">{order.customer_phone}</p>
                            )}
                            {order.note && (
                              <p className="text-xs text-amber-600 mt-0.5 italic">⚠ {order.note}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <ul className="space-y-0.5">
                              {items.map((item, i) => (
                                <li key={i} className="text-xs text-midnight">
                                  <span className="font-bold">{item.name_tw}</span>
                                  <span className="text-midnight/40 ml-1">× {item.qty} {item.unit_label}</span>
                                  {item.preference && (
                                    <span className="ml-1 font-bold text-midnight bg-yellow/40 rounded px-1">{item.preference}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-3 text-xs text-midnight/50">
                            {order.payment_method === 'stripe' ? '💳 Stripe'
                              : order.payment_method === 'virement' ? '🏦 Virement'
                              : order.payment_method === 'pay_on_pickup' ? '🤝 Sur place'
                              : '—'}
                          </td>
                          <td className="px-4 py-3 font-bold text-midnight tabular-nums text-sm">
                            {centsToEur(order.subtotal)} €
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${label.color}`}>
                              {label.zh}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
