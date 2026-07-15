'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { updatePickupSlotActiveAction } from '../actions'
import { ModifierCreneauDialog, type PurchaseTripOption } from './ModifierCreneauDialog'

type OrderStatus = 'received_preorder' | 'received_instock' | 'validated' | 'partial_validated' | 'complete' | 'canceled'

const STATUS_LABEL: Record<OrderStatus, { fr: string; zh: string; color: string }> = {
  received_preorder: { fr: 'Reçue (flash)',         zh: '已收到（快閃）', color: 'bg-yellow/20 text-midnight' },
  received_instock:  { fr: 'Reçue (en stock)',      zh: '已收到（現貨）', color: 'bg-yellow/20 text-midnight' },
  validated:         { fr: 'Validée',               zh: '已確認',   color: 'bg-green/15 text-dark-green' },
  partial_validated: { fr: 'Partiellement validée', zh: '部分確認', color: 'bg-orange/12 text-orange' },
  complete:          { fr: 'Terminée',              zh: '已完成',   color: 'bg-midnight/8 text-midnight' },
  canceled:          { fr: 'Annulée',               zh: '已取消',   color: 'bg-midnight/5 text-midnight/40' },
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

type Order = {
  order_number: string | null
  status: string
  subtotal: number
  tracking_token: string
  customer_prenom: string
  customer_nom: string
  customer_email: string
  customer_phone: string | null
  line_username: string | null
  note: string | null
  items: { name_tw: string; qty: number; unit_label: string; preference?: string | null }[]
  payment_method: string | null
}

type LinkedTrip = {
  id: string
  purchase_date: string
  note: string | null
}

export type PickupSlot = {
  id: string
  label: string
  slot_at: string
  location: string | null
  active: boolean
  purchase_trips: LinkedTrip | null
  orders: Order[]
}

function fmtTripDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

type SlotFilter = 'active' | 'all'
const SLOT_FILTER_OPTIONS: { key: SlotFilter; label: string }[] = [
  { key: 'active', label: 'actifs' },
  { key: 'all',    label: 'tous' },
]

function formatSlotDate(slot_at: string) {
  return new Date(slot_at).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

export function PickupSlotsView({ slots, purchaseTrips }: { slots: PickupSlot[]; purchaseTrips: PurchaseTripOption[] }) {
  const [filter, setFilter] = useState<SlotFilter>('active')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastError, setToastError] = useState(false)
  const [, startTransition] = useTransition()

  const [optimisticSlots, updateOptimistic] = useOptimistic(
    slots,
    (state, update: { id: string; active: boolean }) =>
      state.map(s => s.id === update.id ? { ...s, active: update.active } : s),
  )

  function showToast(msg: string, isError = false) {
    setToastMsg(msg)
    setToastError(isError)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  function handleToggleActive(slot: PickupSlot) {
    const nextActive = !slot.active
    startTransition(async () => {
      updateOptimistic({ id: slot.id, active: nextActive })
      try {
        await updatePickupSlotActiveAction(slot.id, nextActive)
        showToast(nextActive ? `"${slot.label}" activé ✓` : `"${slot.label}" désactivé ✓`)
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Erreur — le créneau n\'a pas été modifié', true)
      }
    })
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        {SLOT_FILTER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
              filter === opt.key
                ? 'bg-midnight text-yellow border-midnight'
                : 'text-midnight/50 border-midnight/15 hover:border-midnight/30 hover:text-midnight'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {!optimisticSlots.length && (
        <p className="text-sm text-midnight/35">Aucun créneau.</p>
      )}

      {filter === 'active' ? (
        <div className="space-y-6">
          {optimisticSlots.filter(s => s.active).map(slot => {
            const orders = slot.orders ?? []
            const activeOrders = orders.filter(o => o.status !== 'canceled')
            const total = activeOrders.reduce((sum, o) => sum + o.subtotal, 0)

            return (
              <div key={slot.id} className="bg-white rounded-2xl border border-midnight/8 overflow-hidden">
                {/* Slot header */}
                <div className="px-5 py-4 border-b border-midnight/8 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-midnight">{slot.label}</p>
                    </div>
                    {slot.location && (
                      <p className="text-xs text-midnight/40">{slot.location}</p>
                    )}
                    <p className="text-xs text-midnight/35 mt-0.5">
                      {formatSlotDate(slot.slot_at)}
                    </p>
                    {slot.purchase_trips && (
                      <p className="text-xs text-midnight/35 mt-0.5">
                        🛒 Achat du {fmtTripDate(slot.purchase_trips.purchase_date)}
                      </p>
                    )}
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
                  <div className="overflow-x-auto">
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
                          const label = STATUS_LABEL[status] ?? STATUS_LABEL.received_preorder
                          const items = Array.isArray(order.items) ? order.items : []

                          return (
                            <tr key={order.tracking_token} className={`${status === 'canceled' ? 'opacity-40' : ''} hover:bg-midnight/2 transition-colors`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`/commande/${order.tracking_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-midnight hover:underline underline-offset-2"
                                  >
                                    {order.customer_prenom} {order.customer_nom}
                                  </a>
                                  {order.line_username && (
                                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green/15 text-dark-green leading-none">
                                      {order.line_username}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-midnight/40">{order.customer_email}</p>
                                {order.customer_phone && (
                                  <p className="text-xs text-midnight/40">{order.customer_phone}</p>
                                )}
                                {order.note && (
                                  <p className="text-xs text-orange mt-0.5 italic">⚠ {order.note}</p>
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
                                  : order.payment_method === 'cash_on_pickup' ? '💶 Espèces'
                                  : order.payment_method === 'card_on_pickup' ? '🏦 Carte Bancaire (Tap to Pay)'
                                  : order.payment_method === 'pay_on_pickup' ? '🤝 Sur place'
                                  : '—'}
                              </td>
                              <td className="px-4 py-3 font-bold text-midnight tabular-nums text-sm">
                                {centsToEur(order.subtotal)} €
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${label.color}`}>
                                  {label.fr} · {label.zh}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-midnight/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-midnight/5 text-left bg-midnight/2">
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35 w-14"></th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Créneau</th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Lieu</th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Date</th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-midnight/35">Achat lié</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {[...optimisticSlots].sort((a, b) => b.slot_at.localeCompare(a.slot_at)).map(slot => (
                <tr key={slot.id} className="hover:bg-midnight/2 transition-colors">
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.active}
                        onChange={() => handleToggleActive(slot)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full bg-midnight/20 peer-checked:bg-midnight transition-colors duration-200" />
                      <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5" />
                    </label>
                  </td>
                  <td className="px-4 py-3 font-bold text-midnight">{slot.label}</td>
                  <td className="px-4 py-3 text-xs text-midnight/40">{slot.location ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-midnight/35">{formatSlotDate(slot.slot_at)}</td>
                  <td className="px-4 py-3 text-xs text-midnight/40">
                    {slot.purchase_trips ? fmtTripDate(slot.purchase_trips.purchase_date) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ModifierCreneauDialog slot={slot} purchaseTrips={purchaseTrips} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className={`text-base font-bold px-6 py-4 rounded-2xl flex items-center gap-3 ${
          toastError ? 'bg-magenta text-white' : 'bg-midnight text-yellow'
        }`}>
          <span className="text-2xl leading-none">{toastError ? '✕' : '✓'}</span>
          {toastMsg}
        </div>
      </div>
    </>
  )
}
