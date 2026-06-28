'use client'

import { useState, useTransition, useOptimistic } from 'react'
import Link from 'next/link'
import { updateOrderStatusAction, updateFlagAction } from '../actions'

type OrderStatus = 'received' | 'accepted' | 'processing' | 'validated' | 'partial_validated' | 'complete' | 'canceled'
type OrderFlag = 'shortage' | 'contact_needed' | 'postponed' | 'others' | 'no_show'

const STATUS: Record<OrderStatus, { label: string; color: string }> = {
  received:          { label: 'Reçue',                color: 'bg-orange/20 text-midnight' },
  accepted:          { label: 'Acceptée',              color: 'bg-blue-50 text-blue-700' },
  processing:        { label: 'En traitement',          color: 'bg-blue-100 text-blue-800' },
  validated:         { label: 'Validée',               color: 'bg-green-50 text-green-700' },
  partial_validated: { label: 'Part. validée',         color: 'bg-amber-50 text-amber-700' },
  complete:          { label: 'Terminée',              color: 'bg-midnight/8 text-midnight' },
  canceled:          { label: 'Annulée',               color: 'bg-midnight/5 text-midnight/40' },
}
const STATUS_OPTIONS: OrderStatus[] = ['received', 'accepted', 'processing', 'validated', 'partial_validated', 'complete', 'canceled']

const FLAG: Record<OrderFlag, string> = {
  shortage:       '⚠️ Rupture',
  contact_needed: '📞 À contacter',
  postponed:      '⏸️ Reporté',
  others:         '🔖 Autre',
  no_show:        '🚫 No-show',
}
const FLAG_OPTIONS: OrderFlag[] = ['shortage', 'contact_needed', 'postponed', 'others', 'no_show']

type ItemSnapshot = {
  name_fr: string
  name_tw: string
  unit_label: string
  qty: number
  line_total: number
}

export type Order = {
  id: string
  order_number: string
  customer_prenom: string
  customer_nom: string
  customer_email: string
  customer_phone: string | null
  status: OrderStatus
  flag: OrderFlag | null
  subtotal: number
  discount_amount: number
  total_amount: number
  created_at: string
  tracking_token: string
  note: string | null
  items: ItemSnapshot[]
  pickup_slots: { label: string; location: string | null } | null
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

export function CommandesTable({
  orders,
  firstTimeEmails,
}: {
  orders: Order[]
  firstTimeEmails: string[]
}) {
  const firstTimeSet = new Set(firstTimeEmails)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [openOrderId, setOpenOrderId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const [optimisticOrders, updateOptimistic] = useOptimistic(
    orders,
    (state, update: { id: string; status?: OrderStatus; flag?: OrderFlag | null }) =>
      state.map(o => o.id === update.id ? { ...o, ...update } : o)
  )

  function showToast(msg: string) {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  const openOrder = openOrderId ? optimisticOrders.find(o => o.id === openOrderId) : null

  return (
    <>
      <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-midnight/8 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Commande</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Client</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Créneau</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Total</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Statut</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Flag</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/5">
            {optimisticOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-midnight/35">
                  Aucune commande.
                </td>
              </tr>
            )}
            {optimisticOrders.map(order => {
              const s = STATUS[order.status] ?? STATUS.received
              const isNew = firstTimeSet.has(order.customer_email)

              return (
                <tr key={order.id} className="hover:bg-midnight/2 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/commande/${order.tracking_token}`}
                      className="font-bold text-midnight hover:underline underline-offset-2"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-midnight/35 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {isNew && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-orange text-midnight px-1.5 py-0.5 rounded-full leading-none">
                          New
                        </span>
                      )}
                      <p className="font-medium text-midnight">{order.customer_prenom} {order.customer_nom}</p>
                    </div>
                    <p className="text-xs text-midnight/40">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-xs text-midnight/40">{order.customer_phone}</p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-midnight/50 whitespace-nowrap">
                    {order.pickup_slots?.label ?? '—'}
                  </td>

                  <td className="px-4 py-3 font-bold text-midnight tabular-nums whitespace-nowrap">
                    {centsToEur(order.total_amount)} €
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20 ${s.color}`}
                      aria-label="Changer le statut"
                      onChange={e => {
                        const newStatus = e.target.value as OrderStatus
                        startTransition(async () => {
                          updateOptimistic({ id: order.id, status: newStatus })
                          await updateOrderStatusAction(order.id, newStatus)
                          showToast('Statut mis à jour')
                        })
                      }}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{STATUS[opt].label}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={order.flag ?? ''}
                      className="text-xs px-2 py-1 rounded-full border border-midnight/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20 text-midnight/60 bg-white"
                      aria-label="Flag"
                      onChange={e => {
                        const newFlag = (e.target.value || null) as OrderFlag | null
                        startTransition(async () => {
                          updateOptimistic({ id: order.id, flag: newFlag })
                          await updateFlagAction(order.id, newFlag)
                          showToast('Flag mis à jour')
                        })
                      }}
                    >
                      <option value="">—</option>
                      {FLAG_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{FLAG[opt]}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setOpenOrderId(order.id)}
                      className="text-xs text-midnight/40 hover:text-midnight border border-midnight/15 rounded-lg px-2.5 py-1.5 hover:border-midnight/30 transition-colors whitespace-nowrap"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Order details dialog */}
      {openOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpenOrderId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-midnight/40 mb-0.5">Commande</p>
                  <h2 className="text-xl font-bold text-midnight">{openOrder.order_number}</h2>
                  <p className="text-sm text-midnight/40 mt-0.5">
                    {new Date(openOrder.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setOpenOrderId(null)}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mt-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-midnight/4 rounded-xl p-4 mb-4">
                <p className="text-xs uppercase tracking-wider text-midnight/40 mb-2">Client</p>
                <p className="font-bold text-midnight">{openOrder.customer_prenom} {openOrder.customer_nom}</p>
                <p className="text-sm text-midnight/50">{openOrder.customer_email}</p>
                {openOrder.customer_phone && (
                  <p className="text-sm text-midnight/50">{openOrder.customer_phone}</p>
                )}
              </div>

              {openOrder.pickup_slots && (
                <div className="bg-orange/15 rounded-xl p-4 mb-4">
                  <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Créneau de retrait</p>
                  <p className="font-bold text-midnight text-sm">{openOrder.pickup_slots.label}</p>
                  {openOrder.pickup_slots.location && (
                    <p className="text-xs text-midnight/50 mt-0.5">{openOrder.pickup_slots.location}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-midnight/40 mb-3">Articles</p>
                <div className="space-y-2.5">
                  {openOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-3">
                      <div>
                        <span className="font-medium text-midnight text-sm">{item.name_tw}</span>
                        <span className="text-xs text-midnight/40 ml-1.5">{item.name_fr}</span>
                        <p className="text-xs text-midnight/40">{item.qty} × {item.unit_label}</p>
                      </div>
                      <span className="font-bold text-midnight text-sm tabular-nums shrink-0">
                        {centsToEur(item.line_total)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-midnight/8 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-midnight/60">
                  <span>Sous-total</span>
                  <span className="tabular-nums">{centsToEur(openOrder.subtotal)} €</span>
                </div>
                {openOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span className="tabular-nums">−{centsToEur(openOrder.discount_amount)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-midnight pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{centsToEur(openOrder.total_amount)} €</span>
                </div>
              </div>

              {openOrder.note && (
                <div className="mt-4 bg-yellow-50 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Note</p>
                  <p className="text-sm text-midnight">{openOrder.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="bg-green-400 text-green-950 text-base font-bold px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
          <span className="text-2xl leading-none">✓</span>
          {toastMsg}
        </div>
      </div>
    </>
  )
}
